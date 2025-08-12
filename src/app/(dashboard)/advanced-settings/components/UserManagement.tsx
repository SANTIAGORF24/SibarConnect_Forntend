"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/ui/card/card";
import { Button } from "@/ui/button/button";
import { TextInput } from "@/ui/form/input";
import { Select } from "@/ui/form/select";
import { Modal } from "@/ui/modal/modal";
import { ConfirmationModal } from "@/ui/modal/confirmation-modal";
import { Table, TableHeader } from "@/ui/table/table";
import { api, type RoleDTO, type CompanyDTO, type UserOutDTO } from "@/api";

type UserForm = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role_id: number | null;
  company_id: number | null;
  is_super_admin: boolean;
};

const initialForm: UserForm = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  role_id: null,
  company_id: null,
  is_super_admin: false,
};

export function UserManagement() {
  const [users, setUsers] = useState<UserOutDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<UserOutDTO | null>(null);
  const [form, setForm] = useState<UserForm>(initialForm);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, r, c] = await Promise.all([
          api.users.list(),
          api.roles.list(),
          api.companies.list(),
        ]);
        setUsers(u);
        setRoles(r);
        setCompanies(c);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roleOptions = useMemo(() => roles.map(r => ({ value: String(r.id), label: r.name })), [roles]);
  const companyOptions = useMemo(() => companies.map(c => ({ value: String(c.id), label: c.nombre })), [companies]);

  const columns = [
    { key: "username", title: "Usuario" },
    { key: "email", title: "Email" },
    { key: "first_name", title: "Nombre" },
    { key: "last_name", title: "Apellido" },
    { key: "role", title: "Rol", render: (r: UserOutDTO["role"]) => r?.name ?? "-" },
    { key: "company_id", title: "Empresa", render: (id: number | null) => companies.find(c => c.id === id)?.nombre ?? "-" },
    {
      key: "actions",
      title: "Acciones",
      width: "w-36",
      className: "text-center",
      render: (_: unknown, user: UserOutDTO) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" onClick={() => {
            setSelected(user);
            setForm({
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              email: user.email,
              password: "",
              role_id: user.role?.id ?? null,
              company_id: user.company_id ?? null,
              is_super_admin: user.is_super_admin,
            });
            setIsEditOpen(true);
          }}>Editar</Button>
          <Button variant="ghost" onClick={() => { setSelected(user); setIsDeleteOpen(true); }}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await api.users.create({
        ...form,
        role_id: form.role_id ?? undefined,
        company_id: form.company_id ?? undefined,
      });
      setUsers(prev => [created, ...prev]);
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
      const { password, ...rest } = form;
      const updated = await api.users.update(selected.id, { ...rest, ...(password ? { password } : {}) });
      setUsers(prev => prev.map(u => (u.id === selected.id ? updated : u)));
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
      await api.users.remove(selected.id);
      setUsers(prev => prev.filter(u => u.id !== selected.id));
      setSelected(null);
      setIsDeleteOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <TableHeader title="Gestión de Usuarios" subtitle="Crear, editar y asignar roles y empresa" actions={<Button onClick={() => setIsCreateOpen(true)}>Nuevo Usuario</Button>} />
      <Table columns={columns} data={users} loading={loading} emptyMessage="No hay usuarios" />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Crear Usuario">
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            <TextInput label="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            <TextInput label="Usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
            <TextInput label="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required />
            <Select label="Rol" value={form.role_id ? String(form.role_id) : ""} onChange={(e) => setForm({ ...form, role_id: e.target.value ? Number(e.target.value) : null })} options={[{ value: "", label: "Sin rol" }, ...roleOptions]} />
            <Select label="Empresa" value={form.company_id ? String(form.company_id) : ""} onChange={(e) => setForm({ ...form, company_id: e.target.value ? Number(e.target.value) : null })} options={[{ value: "", label: "Sin empresa" }, ...companyOptions]} />
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button><Button type="submit">Crear</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Usuario">
        <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            <TextInput label="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            <TextInput label="Usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
            <TextInput label="Nueva contraseña (opcional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" />
            <Select label="Rol" value={form.role_id ? String(form.role_id) : ""} onChange={(e) => setForm({ ...form, role_id: e.target.value ? Number(e.target.value) : null })} options={[{ value: "", label: "Sin rol" }, ...roleOptions]} />
            <Select label="Empresa" value={form.company_id ? String(form.company_id) : ""} onChange={(e) => setForm({ ...form, company_id: e.target.value ? Number(e.target.value) : null })} options={[{ value: "", label: "Sin empresa" }, ...companyOptions]} />
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancelar</Button><Button type="submit">Guardar</Button></div>
        </form>
      </Modal>

      <ConfirmationModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Eliminar Usuario" message={`¿Eliminar al usuario "${selected?.username}"?`} confirmText="Eliminar" cancelText="Cancelar" />
    </div>
  );
}
