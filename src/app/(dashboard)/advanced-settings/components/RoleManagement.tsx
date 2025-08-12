"use client";
import { useEffect, useState } from "react";
import { Button } from "@/ui/button/button";
import { TextInput } from "@/ui/form/input";
import { Checkbox } from "@/ui/form/checkbox";
import { Modal } from "@/ui/modal/modal";
import { ConfirmationModal } from "@/ui/modal/confirmation-modal";
import { Table, TableHeader } from "@/ui/table/table";
import { Badge } from "@/ui/badge/badge";
import { api, type RoleDTO } from "@/api";

type RoleForm = { name: string; is_admin: boolean; allowed_paths: string[] };

// Rutas disponibles del menú lateral
const availableRoutes = [
  { path: "/dashboard", name: "Dashboard", description: "Panel principal del sistema" },
  { path: "/chats", name: "Chats Generales", description: "Acceso a todos los chats" },
  { path: "/my-chats", name: "Mis Chats", description: "Chats personales del usuario" },
  { path: "/templates", name: "Templates", description: "Plantillas del sistema" },
  { path: "/ai", name: "IA", description: "Funcionalidades de inteligencia artificial" },
  { path: "/company", name: "Empresa", description: "Gestión de la empresa" },
  { path: "/settings", name: "Configuración", description: "Configuración general" },
  { path: "/advanced-settings", name: "Configuración Avanzada", description: "Configuración de administrador" },
];

const initialForm: RoleForm = { name: "", is_admin: false, allowed_paths: [] };

export function RoleManagement() {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<RoleDTO | null>(null);
  const [form, setForm] = useState<RoleForm>(initialForm);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.roles.list();
        setRoles(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await api.roles.create(form);
      setRoles((prev) => [created, ...prev]);
      setForm(initialForm);
      setIsCreateOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const updated = await api.roles.update(selected.id, form);
      setRoles((prev) => prev.map((r) => (r.id === selected.id ? updated : r)));
      setSelected(null);
      setForm(initialForm);
      setIsEditOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.roles.remove(selected.id);
      setRoles((prev) => prev.filter((r) => r.id !== selected.id));
      setSelected(null);
      setIsDeleteOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "name", title: "Nombre" },
    {
      key: "is_admin",
      title: "Admin",
      render: (v: boolean) => (
        <Badge variant={v ? "success" : "default"}>{v ? "Sí" : "No"}</Badge>
      ),
    },
    {
      key: "allowed_paths",
      title: "Permisos",
      render: (v: string[], role: RoleDTO) => (
        <div className="flex flex-wrap gap-1">
          {role.is_admin ? (
            <Badge variant="success" size="sm">Acceso Total (Admin)</Badge>
          ) : v.length === 0 ? (
            <Badge variant="warning" size="sm">Sin permisos específicos</Badge>
          ) : (
            v.map((path) => {
              const route = availableRoutes.find(r => r.path === path);
              return (
                <Badge key={path} variant="info" size="sm">
                  {route?.name || path}
                </Badge>
              );
            })
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      width: "w-36",
      className: "text-center",
      render: (_: unknown, role: RoleDTO) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" onClick={() => {
            setSelected(role);
            setForm({ name: role.name, is_admin: role.is_admin, allowed_paths: role.allowed_paths });
            setIsEditOpen(true);
          }}>Editar</Button>
          <Button variant="ghost" onClick={() => { setSelected(role); setIsDeleteOpen(true); }}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TableHeader
        title="Gestión de Roles"
        subtitle="Define permisos y accesos"
        actions={<Button onClick={() => setIsCreateOpen(true)}>Nuevo Rol</Button>}
      />
      <Table columns={columns} data={roles} loading={loading} emptyMessage="No hay roles" />

      <Modal isOpen={isCreateOpen} onClose={() => {
        setIsCreateOpen(false);
        setForm(initialForm);
      }} title="Crear Rol">
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
          <TextInput 
            label="Nombre" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
            placeholder="Ej: Editor, Visualizador, etc."
          />
          
          <div className="space-y-3">
            <Checkbox 
              label="Es Admin" 
              checked={form.is_admin} 
              onChange={(e) => {
                const isAdmin = e.target.checked;
                setForm({ 
                  ...form, 
                  is_admin: isAdmin,
                  // Si es admin, limpiar los permisos específicos ya que tendrá acceso total
                  allowed_paths: isAdmin ? [] : form.allowed_paths
                });
              }}
            />
            <p className="text-sm text-gray-600">
              Los administradores tienen acceso a todas las rutas automáticamente
            </p>
          </div>

          {!form.is_admin && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permisos de Acceso
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona las secciones a las que este rol tendrá acceso
                </p>
                
                {/* Botones de selección rápida */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setForm({
                      ...form,
                      allowed_paths: availableRoutes.map(route => route.path)
                    })}
                  >
                    Seleccionar Todo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setForm({
                      ...form,
                      allowed_paths: []
                    })}
                  >
                    Limpiar Todo
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {availableRoutes.map((route) => (
                  <div key={route.path} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={form.allowed_paths.includes(route.path)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({
                            ...form,
                            allowed_paths: [...form.allowed_paths, route.path]
                          });
                        } else {
                          setForm({
                            ...form,
                            allowed_paths: form.allowed_paths.filter(path => path !== route.path)
                          });
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{route.name}</div>
                      <div className="text-xs text-gray-500">{route.description}</div>
                      <div className="text-xs text-gray-400 font-mono">{route.path}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => {
              setIsCreateOpen(false);
              setForm(initialForm);
            }}>
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => {
        setIsEditOpen(false);
        setSelected(null);
        setForm(initialForm);
      }} title="Editar Rol">
        <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-6">
          <TextInput 
            label="Nombre" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
            placeholder="Ej: Editor, Visualizador, etc."
          />
          
          <div className="space-y-3">
            <Checkbox 
              label="Es Admin" 
              checked={form.is_admin} 
              onChange={(e) => {
                const isAdmin = e.target.checked;
                setForm({ 
                  ...form, 
                  is_admin: isAdmin,
                  // Si es admin, limpiar los permisos específicos ya que tendrá acceso total
                  allowed_paths: isAdmin ? [] : form.allowed_paths
                });
              }}
            />
            <p className="text-sm text-gray-600">
              Los administradores tienen acceso a todas las rutas automáticamente
            </p>
          </div>

          {!form.is_admin && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permisos de Acceso
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona las secciones a las que este rol tendrá acceso
                </p>
                
                {/* Botones de selección rápida */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setForm({
                      ...form,
                      allowed_paths: availableRoutes.map(route => route.path)
                    })}
                  >
                    Seleccionar Todo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setForm({
                      ...form,
                      allowed_paths: []
                    })}
                  >
                    Limpiar Todo
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {availableRoutes.map((route) => (
                  <div key={route.path} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={form.allowed_paths.includes(route.path)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({
                            ...form,
                            allowed_paths: [...form.allowed_paths, route.path]
                          });
                        } else {
                          setForm({
                            ...form,
                            allowed_paths: form.allowed_paths.filter(path => path !== route.path)
                          });
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{route.name}</div>
                      <div className="text-xs text-gray-500">{route.description}</div>
                      <div className="text-xs text-gray-400 font-mono">{route.path}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => {
              setIsEditOpen(false);
              setSelected(null);
              setForm(initialForm);
            }}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Eliminar Rol" message={`¿Eliminar el rol "${selected?.name}"?`} confirmText="Eliminar" cancelText="Cancelar" />
    </div>
  );
}
