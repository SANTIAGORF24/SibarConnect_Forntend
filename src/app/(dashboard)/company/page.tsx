"use client";
import { useEffect, useState } from "react";
import { Card } from "@/ui/card/card";
import { Button } from "@/ui/button/button";
import { TextInput } from "@/ui/form/input";
import { Select } from "@/ui/form/select";
import { Modal } from "@/ui/modal/modal";
import { Table, TableHeader } from "@/ui/table/table";
import { Badge } from "@/ui/badge/badge";
import { useAuth } from "@/contexts/auth-context";
import { api, type CompanyDTO, type UserOutDTO, type RoleDTO, type YCloudConfig, type YCloudTestResult } from "@/api";

type UserForm = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role_id: number | null;
};

const initialForm: UserForm = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  role_id: null,
};

export default function CompanyPage() {
  const { currentUser } = useAuth();
  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [employees, setEmployees] = useState<UserOutDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(initialForm);

  // Estados para YCloud
  const [ycloudConfig, setYcloudConfig] = useState<YCloudConfig>({
    api_key: "",
    phone_number: "",
    webhook_url: "",
  });
  const [ycloudTesting, setYcloudTesting] = useState(false);
  const [ycloudTestResult, setYcloudTestResult] = useState<YCloudTestResult | null>(null);
  const [ycloudConfigLoading, setYcloudConfigLoading] = useState(false);

  // Datos de estadísticas
  const [stats, setStats] = useState({
    activeEmployees: 0,
    chatsThisMonth: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser?.company_id) return;
      
      setLoading(true);
      try {
        const [companyData, employeesData, rolesData] = await Promise.all([
          api.companies.get(currentUser.company_id),
          api.users.list(),
          api.roles.list(),
        ]);
        
        setCompany(companyData);
        // Filtrar empleados de la empresa actual
        const companyEmployees = employeesData.filter(user => user.company_id === currentUser.company_id);
        setEmployees(companyEmployees);
        // Filtrar roles excluyendo admin (solo el super admin puede asignar admin)
        const availableRoles = rolesData.filter(role => !role.is_admin || currentUser.is_super_admin);
        setRoles(availableRoles);
        
        // Cargar configuración de YCloud
        setYcloudConfig({
          api_key: companyData.ycloud_api_key || "",
          phone_number: companyData.whatsapp_phone_number || "",
          webhook_url: companyData.ycloud_webhook_url || "",
        });
        
        // Calcular estadísticas
        setStats({
          activeEmployees: companyEmployees.length,
          chatsThisMonth: Math.floor(Math.random() * 200) + 50, // Mock data
          satisfaction: Math.floor(Math.random() * 20) + 80, // Mock data
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleCreateEmployee = async () => {
    if (!company || !currentUser?.company_id) return;
    
    // Validar límite de usuarios
    if (employees.length >= company.cantidad_usuarios) {
      alert(`No puedes crear más usuarios. Límite actual: ${company.cantidad_usuarios} usuarios.`);
      return;
    }

    setLoading(true);
    try {
      const created = await api.users.create({
        ...form,
        company_id: currentUser.company_id, // Forzar la empresa actual
      });
      setEmployees(prev => [created, ...prev]);
      setForm(initialForm);
      setIsCreateOpen(false);
      
      // Actualizar estadísticas
      setStats(prev => ({ ...prev, activeEmployees: prev.activeEmployees + 1 }));
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Error al crear el empleado");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para YCloud
  const handleYCloudConfigSave = async () => {
    if (!currentUser?.company_id || !ycloudConfig.api_key.trim()) return;
    
    setYcloudConfigLoading(true);
    try {
      const updatedCompany = await api.companies.updateYCloudConfig(currentUser.company_id, {
        api_key: ycloudConfig.api_key.trim(),
        phone_number: ycloudConfig.phone_number?.trim() || undefined,
        webhook_url: ycloudConfig.webhook_url?.trim() || undefined,
      });
      
      setCompany(updatedCompany);
      setYcloudTestResult(null);
      alert("Configuración de YCloud guardada exitosamente");
    } catch (error) {
      console.error("Error saving YCloud config:", error);
      alert("Error al guardar la configuración de YCloud");
    } finally {
      setYcloudConfigLoading(false);
    }
  };

  const handleYCloudTest = async () => {
    if (!currentUser?.company_id) return;
    
    setYcloudTesting(true);
    setYcloudTestResult(null);
    try {
      const result = await api.companies.testYCloudConnection(currentUser.company_id);
      setYcloudTestResult(result);
      
      if (result.success && result.phone_number) {
        // Actualizar el número de teléfono en la configuración local
        setYcloudConfig(prev => ({ ...prev, phone_number: result.phone_number || "" }));
      }
    } catch (error) {
      console.error("Error testing YCloud connection:", error);
      setYcloudTestResult({
        success: false,
        message: "Error de conexión al probar YCloud"
      });
    } finally {
      setYcloudTesting(false);
    }
  };

  const roleOptions = roles.map(r => ({ value: String(r.id), label: r.name }));

  const employeeColumns = [
    {
      key: "name",
      title: "Empleado",
      render: (_: unknown, user: UserOutDTO) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900">{`${user.first_name} ${user.last_name}`}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      title: "Usuario",
      render: (username: string) => <span className="text-sm text-gray-700">{username}</span>,
    },
    {
      key: "role",
      title: "Rol",
      render: (role: UserOutDTO["role"]) => (
        <Badge variant={role?.is_admin ? "success" : "info"}>
          {role?.name || "Sin rol"}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "Estado",
      render: () => <Badge variant="success">Activo</Badge>,
    },
  ];

  if (!currentUser?.company) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Empresa</h1>
          <p className="text-gray-600">Tu usuario no está asociado a ninguna empresa</p>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Contacta al administrador para ser asociado a una empresa.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Mi Empresa</h1>
        <p className="text-gray-600">Información y gestión de {currentUser.company.nombre}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Información de la Empresa - Solo lectura */}
          <Card title="Información de la Empresa">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {currentUser.company.nombre}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {currentUser.company.nit}
                  </div>
                </div>
              </div>
              
              {currentUser.company.direccion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {currentUser.company.direccion}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentUser.company.telefono && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                      {currentUser.company.telefono}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {currentUser.company.email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {currentUser.company.razon_social}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Usuarios</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    <span className={employees.length >= (company?.cantidad_usuarios || 0) ? "text-red-600 font-semibold" : "text-gray-700"}>
                      {employees.length} / {company?.cantidad_usuarios || 0} usuarios
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Configuración de YCloud API */}
          <Card title="Configuración de WhatsApp (YCloud)">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Integración con YCloud WhatsApp Business API</h4>
                <p className="text-sm text-blue-700">
                  Configura tu API Key de YCloud para habilitar la funcionalidad de WhatsApp Business en tu empresa.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key de YCloud <span className="text-red-500">*</span>
                  </label>
                  <TextInput
                    type="password"
                    value={ycloudConfig.api_key}
                    onChange={(e) => setYcloudConfig(prev => ({ ...prev, api_key: e.target.value }))}
                    placeholder="Ingresa tu API Key de YCloud"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de WhatsApp
                    </label>
                    <TextInput
                      value={ycloudConfig.phone_number || ""}
                      onChange={(e) => setYcloudConfig(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Ej: +573001234567"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se auto-completará al probar la conexión si está vacío
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook URL
                    </label>
                    <TextInput
                      value={ycloudConfig.webhook_url || ""}
                      onChange={(e) => setYcloudConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                      placeholder="https://tu-dominio.com/webhook"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleYCloudConfigSave}
                    disabled={!ycloudConfig.api_key.trim() || ycloudConfigLoading}
                    className="flex-1 sm:flex-none"
                  >
                    {ycloudConfigLoading ? "Guardando..." : "Guardar Configuración"}
                  </Button>

                  <Button
                    onClick={handleYCloudTest}
                    disabled={!company?.ycloud_api_key || ycloudTesting}
                    variant="ghost"
                    className="flex-1 sm:flex-none"
                  >
                    {ycloudTesting ? "Probando..." : "Probar Conexión"}
                  </Button>
                </div>

                {/* Resultado del test */}
                {ycloudTestResult && (
                  <div className={`rounded-lg p-4 ${
                    ycloudTestResult.success 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-red-50 border border-red-200"
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        ycloudTestResult.success ? "bg-green-500" : "bg-red-500"
                      }`}>
                        {ycloudTestResult.success ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          ycloudTestResult.success ? "text-green-800" : "text-red-800"
                        }`}>
                          {ycloudTestResult.success ? "¡Conexión exitosa!" : "Error de conexión"}
                        </p>
                        <p className={`text-sm mt-1 ${
                          ycloudTestResult.success ? "text-green-700" : "text-red-700"
                        }`}>
                          {ycloudTestResult.message}
                        </p>
                        {ycloudTestResult.success && ycloudTestResult.phone_number && (
                          <p className="text-sm text-green-700 mt-1">
                            <strong>Número detectado:</strong> {ycloudTestResult.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Estado actual */}
                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Estado actual:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">API Key:</span>
                      <div className={`mt-1 ${company?.ycloud_api_key ? "text-green-600" : "text-red-600"}`}>
                        {company?.ycloud_api_key ? "Configurada" : "No configurada"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Teléfono:</span>
                      <div className={`mt-1 ${company?.whatsapp_phone_number ? "text-green-600" : "text-gray-500"}`}>
                        {company?.whatsapp_phone_number || "No detectado"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Webhook:</span>
                      <div className={`mt-1 ${company?.ycloud_webhook_url ? "text-green-600" : "text-gray-500"}`}>
                        {company?.ycloud_webhook_url ? "Configurado" : "No configurado"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Empleados */}
          <Card>
            <TableHeader
              title="Empleados"
              subtitle={`Gestiona los empleados de ${currentUser.company.nombre}`}
              actions={
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  disabled={employees.length >= (company?.cantidad_usuarios || 0)}
                >
                  {employees.length >= (company?.cantidad_usuarios || 0) 
                    ? "Límite alcanzado" 
                    : "Nuevo Empleado"
                  }
                </Button>
              }
            />
            <Table
              columns={employeeColumns}
              data={employees}
              loading={loading}
              emptyMessage="No hay empleados en esta empresa"
            />
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="space-y-6">
          <Card title="Estadísticas">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.activeEmployees}</p>
                <p className="text-sm text-gray-600">Empleados Activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.chatsThisMonth}</p>
                <p className="text-sm text-gray-600">Chats Este Mes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.satisfaction}%</p>
                <p className="text-sm text-gray-600">Satisfacción</p>
              </div>
            </div>
          </Card>

          <Card title="Límites de Uso">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usuarios</span>
                <span className="text-sm font-medium">
                  {employees.length} / {company?.cantidad_usuarios || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    employees.length >= (company?.cantidad_usuarios || 0) 
                      ? "bg-red-500" 
                      : employees.length >= (company?.cantidad_usuarios || 0) * 0.8
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ 
                    width: `${Math.min((employees.length / (company?.cantidad_usuarios || 1)) * 100, 100)}%` 
                  }}
                />
              </div>
              {employees.length >= (company?.cantidad_usuarios || 0) && (
                <p className="text-xs text-red-600">
                  Has alcanzado el límite de usuarios para tu empresa
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Crear Empleado */}
      <Modal isOpen={isCreateOpen} onClose={() => {
        setIsCreateOpen(false);
        setForm(initialForm);
      }} title="Crear Nuevo Empleado">
        <form onSubmit={(e) => { e.preventDefault(); handleCreateEmployee(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput 
              label="Nombre" 
              value={form.first_name} 
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} 
              required 
            />
            <TextInput 
              label="Apellido" 
              value={form.last_name} 
              onChange={(e) => setForm({ ...form, last_name: e.target.value })} 
              required 
            />
            <TextInput 
              label="Usuario" 
              value={form.username} 
              onChange={(e) => setForm({ ...form, username: e.target.value })} 
              required 
            />
            <TextInput 
              label="Email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              type="email" 
              required 
            />
            <TextInput 
              label="Contraseña" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              type="password" 
              required 
            />
            <Select 
              label="Rol" 
              value={form.role_id ? String(form.role_id) : ""} 
              onChange={(e) => setForm({ ...form, role_id: e.target.value ? Number(e.target.value) : null })} 
              options={[{ value: "", label: "Sin rol" }, ...roleOptions]}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El empleado será creado automáticamente para {currentUser.company.nombre}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => {
              setIsCreateOpen(false);
              setForm(initialForm);
            }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Empleado"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
