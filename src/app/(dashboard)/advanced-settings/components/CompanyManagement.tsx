"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/ui/card/card";
import { Button } from "@/ui/button/button";
import { TextInput } from "@/ui/form/input";
import { Select } from "@/ui/form/select";
import { Modal } from "@/ui/modal/modal";
import { ConfirmationModal } from "@/ui/modal/confirmation-modal";
import { Table, TableHeader } from "@/ui/table/table";
import { Badge } from "@/ui/badge/badge";
import { SearchAndFilter } from "@/ui/search/search-filter";
import { StatsGrid } from "@/ui/stats/stat-card";
import { api, type CompanyDTO, type UserOutDTO } from "@/api";

export type Company = {
  id: number;
  nombre: string;
  razonSocial: string;
  nit: string;
  responsable: string;
  activa: boolean;
  cantidadUsuarios: number;
  fechaCreacion: string;
  email: string;
  telefono: string;
  direccion: string;
  // roles removidos del formulario/tabla por ahora
};

type CompanyFormData = Omit<Company, 'id' | 'fechaCreacion'>;


const initialFormData: CompanyFormData = {
  nombre: "",
  razonSocial: "",
  nit: "",
  responsable: "",
  activa: true,
  cantidadUsuarios: 0,
  email: "",
  telefono: "",
  direccion: "",
};

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserOutDTO[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filtered companies based on search and filters
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Search filter
      const searchMatch = !searchTerm || 
        company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = !filters.status || 
        (filters.status === "active" && company.activa) ||
        (filters.status === "inactive" && !company.activa);

      return searchMatch && statusMatch;
    });
  }, [companies, searchTerm, filters]);

  const filterConfigs = [
    {
      key: "status",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "active", label: "Activas" },
        { value: "inactive", label: "Inactivas" },
      ],
      placeholder: "Filtrar por estado",
    },
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.activa).length;
    const totalUsers = users.length;
    const avgUsersPerCompany = totalCompanies > 0 ? Math.round(totalUsers / totalCompanies) : 0;

    return [
      {
        title: "Total Empresas",
        value: totalCompanies,
        subtitle: "Empresas registradas",
        color: "blue" as const,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        title: "Empresas Activas",
        value: activeCompanies,
        subtitle: `${totalCompanies > 0 ? Math.round((activeCompanies / totalCompanies) * 100) : 0}% del total`,
        color: "green" as const,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Total Usuarios",
        value: totalUsers,
        subtitle: "Usuarios en el sistema",
        color: "purple" as const,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        ),
      },
      {
        title: "Promedio de Usuarios",
        value: avgUsersPerCompany,
        subtitle: "Por empresa",
        color: "yellow" as const,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ];
  }, [companies, users]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [companiesRes, usersRes] = await Promise.all([
          api.companies.list(),
          api.users.list(),
        ]);
        setCompanies(companiesRes.map(mapFromDTO));
        setUsers(usersRes);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateCompany = async () => {
    setIsLoading(true);
    try {
      const created = await api.companies.create(mapToCreateDTO(formData));
      setCompanies(prev => [mapFromDTO(created), ...prev]);
      setFormData(initialFormData);
      setIsCreateModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = async () => {
    if (!selectedCompany) return;
    
    setIsLoading(true);
    try {
      const updated = await api.companies.update(selectedCompany.id, mapToUpdateDTO(formData));
      setCompanies(prev => prev.map(c => (c.id === selectedCompany.id ? mapFromDTO(updated) : c)));
      setFormData(initialFormData);
      setIsEditModalOpen(false);
      setSelectedCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    
    setIsLoading(true);
    try {
      await api.companies.remove(selectedCompany.id);
      setCompanies(prev => prev.filter(company => company.id !== selectedCompany.id));
      setIsDeleteModalOpen(false);
      setSelectedCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (company: Company) => {
      setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      nombre: company.nombre,
      razonSocial: company.razonSocial,
      nit: company.nit,
      responsable: company.responsable,
      activa: company.activa,
      cantidadUsuarios: company.cantidadUsuarios,
      email: company.email,
      telefono: company.telefono,
      direccion: company.direccion,
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (company: Company) => {
      setSelectedCompany(company);
    setIsViewModalOpen(true);
  };

  const tableColumns = [
    {
      key: "nombre",
      title: "Nombre",
      render: (value: string, company: Company) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-foreground/60">{company.nit}</div>
        </div>
      ),
    },
    {
      key: "responsable",
      title: "Responsable",
    },
    {
      key: "cantidadUsuarios",
      title: "Usuarios",
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: "activa",
      title: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "success" : "error"}>
          {value ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
    {
      key: "fechaCreacion",
      title: "Fecha Creación",
      render: (value: string) => (
        <span className="text-sm text-foreground/70">
          {new Date(value).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    
    {
      key: "actions",
      title: "Acciones",
      width: "w-36",
      className: "text-center",
      render: (_: unknown, company: Company) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            className="inline-flex items-center justify-center w-8 h-8 p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 border border-transparent hover:border-blue-200"
            onClick={() => openViewModal(company)}
            title="Ver detalles"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            className="inline-flex items-center justify-center w-8 h-8 p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-200 border border-transparent hover:border-green-200"
            onClick={() => openEditModal(company)}
            title="Editar"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="inline-flex items-center justify-center w-8 h-8 p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 border border-transparent hover:border-red-200"
            onClick={() => openDeleteModal(company)}
            title="Eliminar"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatsGrid stats={stats} />

      <TableHeader
        title="Gestión de Empresas"
        subtitle="Administra las empresas del sistema"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Empresa
          </Button>
        }
      >
        <SearchAndFilter
          searchPlaceholder="Buscar empresas por nombre, NIT, responsable..."
          filters={filterConfigs}
          onSearch={setSearchTerm}
          onFilter={setFilters}
          onClear={() => {
            setSearchTerm("");
            setFilters({});
          }}
        />
      </TableHeader>

      <Table
        columns={tableColumns}
        data={filteredCompanies}
        loading={isLoading}
        emptyMessage={
          searchTerm || Object.keys(filters).length > 0
            ? "No se encontraron empresas con los criterios de búsqueda"
            : "No hay empresas registradas"
        }
      />

      {/* Modal Crear Empresa */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData(initialFormData);
        }}
        title="Crear Nueva Empresa"
        size="lg"
      >
        <CompanyForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateCompany}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setFormData(initialFormData);
          }}
          isLoading={isLoading}
          submitText="Crear Empresa"
        />
      </Modal>

      {/* Modal Editar Empresa */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData(initialFormData);
          setSelectedCompany(null);
        }}
        title="Editar Empresa"
        size="lg"
      >
        <CompanyForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditCompany}
          onCancel={() => {
            setIsEditModalOpen(false);
            setFormData(initialFormData);
            setSelectedCompany(null);
          }}
          isLoading={isLoading}
          submitText="Guardar Cambios"
        />
      </Modal>

      {/* Modal Ver Empresa */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCompany(null);
        }}
        title="Detalles de la Empresa"
        size="lg"
      >
        {selectedCompany && <CompanyDetails company={selectedCompany} />}
      </Modal>

      {/* Modal Confirmación Eliminar */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleDeleteCompany}
        title="Eliminar Empresa"
        message={`¿Estás seguro de que deseas eliminar la empresa "${selectedCompany?.nombre}"? Esta acción no se puede deshacer y se eliminarán todos los datos relacionados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  );
}

type CompanyFormProps = {
  formData: CompanyFormData;
  setFormData: (data: CompanyFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  submitText: string;
};

function CompanyForm({ formData, setFormData, onSubmit, onCancel, isLoading, submitText }: CompanyFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput
          label="Nombre de la Empresa"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
          placeholder="Ingresa el nombre de la empresa"
        />

        <TextInput
          label="Razón Social"
          value={formData.razonSocial}
          onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
          required
          placeholder="Ingresa la razón social"
        />

        <TextInput
          label="NIT"
          value={formData.nit}
          onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
          required
          placeholder="Ej: 900123456-1"
        />

        <TextInput
          label="Responsable"
          value={formData.responsable}
          onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
          required
          placeholder="Nombre del responsable"
        />

        <TextInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="contacto@empresa.com"
        />

        <TextInput
          label="Teléfono"
          value={formData.telefono}
          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          placeholder="+57 300 123 4567"
        />

        <TextInput
          label="Cantidad de Usuarios"
          type="number"
          value={formData.cantidadUsuarios.toString()}
          onChange={(e) => setFormData({ ...formData, cantidadUsuarios: parseInt(e.target.value) || 0 })}
          min="0"
          required
        />

        <Select
          label="Estado"
          value={formData.activa ? "true" : "false"}
          onChange={(e) => setFormData({ ...formData, activa: e.target.value === "true" })}
          options={[
            { value: "true", label: "Activa" },
            { value: "false", label: "Inactiva" },
          ]}
          required
        />
      </div>

      <div className="col-span-full">
        <TextInput
          label="Dirección"
          value={formData.direccion}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          placeholder="Dirección completa de la empresa"
        />
      </div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : submitText}
        </Button>
      </div>
    </form>
  );
}

type CompanyDetailsProps = {
  company: Company;
};

function CompanyDetails({ company }: CompanyDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Nombre</h4>
          <p className="text-foreground">{company.nombre}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Razón Social</h4>
          <p className="text-foreground">{company.razonSocial}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">NIT</h4>
          <p className="text-foreground">{company.nit}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Responsable</h4>
          <p className="text-foreground">{company.responsable}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Email</h4>
          <p className="text-foreground">{company.email}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Teléfono</h4>
          <p className="text-foreground">{company.telefono}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Cantidad de Usuarios</h4>
          <p className="text-foreground font-medium">{company.cantidadUsuarios}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Estado</h4>
          <Badge variant={company.activa ? "success" : "error"}>
            {company.activa ? "Activa" : "Inactiva"}
          </Badge>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground/70 mb-2">Fecha de Creación</h4>
          <p className="text-foreground">{new Date(company.fechaCreacion).toLocaleDateString('es-ES')}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-foreground/70 mb-2">Dirección</h4>
        <p className="text-foreground">{company.direccion}</p>
      </div>

    </div>
  );
}

function mapFromDTO(dto: CompanyDTO): Company {
  return {
    id: dto.id,
    nombre: dto.nombre,
    razonSocial: dto.razon_social,
    nit: dto.nit,
    responsable: dto.responsable,
    activa: dto.activa,
    cantidadUsuarios: dto.cantidad_usuarios,
    fechaCreacion: dto.created_at,
    email: dto.email,
    telefono: dto.telefono || "",
    direccion: dto.direccion || "",
  };
}

function mapToCreateDTO(c: CompanyFormData) {
  return {
    nombre: c.nombre,
    razon_social: c.razonSocial,
    nit: c.nit,
    responsable: c.responsable,
    activa: c.activa,
    cantidad_usuarios: c.cantidadUsuarios,
    email: c.email,
    telefono: c.telefono,
    direccion: c.direccion,
  };
}

function mapToUpdateDTO(c: CompanyFormData) {
  return {
    nombre: c.nombre,
    razon_social: c.razonSocial,
    nit: c.nit,
    responsable: c.responsable,
    activa: c.activa,
    cantidad_usuarios: c.cantidadUsuarios,
    email: c.email,
    telefono: c.telefono,
    direccion: c.direccion,
  };
}
