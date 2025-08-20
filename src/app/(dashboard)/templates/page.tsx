"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/ui/card/card";
import { api } from "@/api";
import { useAuth } from "@/contexts/auth-context";

type TemplateItemType = "text" | "image" | "video" | "audio" | "document";

type TemplateItemDraft = {
  order_index: number;
  item_type: TemplateItemType;
  text_content?: string;
  media_url?: string;
  mime_type?: string;
  caption?: string;
};

type TemplateDTO = {
  id: number;
  company_id: number;
  name: string;
  items: Array<{
    id: number;
    order_index: number;
    item_type: TemplateItemType;
    text_content?: string;
    media_url?: string;
    mime_type?: string;
    caption?: string;
  }>;
};

export default function TemplatesPage() {
  const { currentUser } = useAuth();
  const companyId = currentUser?.company_id ?? 1;

  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [items, setItems] = useState<TemplateItemDraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  useEffect(() => {
    void fetchTemplates();
  }, []);

  async function fetchTemplates(): Promise<void> {
    try {
      setLoading(true);
      const data: TemplateDTO[] = await api.templates.list(companyId);
      setTemplates(data);
    } catch (e) {
      setError("No se pudieron cargar los templates");
    } finally {
      setLoading(false);
    }
  }

  function resetForm(): void {
    setEditingId(null);
    setName("");
    setItems([]);
    setError(null);
  }

  function addItem(kind: TemplateItemType): void {
    setItems((prev) => [
      ...prev,
      {
        order_index: prev.length,
        item_type: kind,
        text_content: kind === "text" ? "" : undefined,
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<TemplateItemDraft>): void {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function moveItemUp(index: number): void {
    if (index === 0) return;
    setItems((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy.map((it, i) => ({ ...it, order_index: i }));
    });
  }

  function moveItemDown(index: number): void {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy.map((it, i) => ({ ...it, order_index: i }));
    });
  }

  function removeItem(index: number): void {
    setItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((it, i) => ({ ...it, order_index: i }))
    );
  }

  async function onUploadMedia(index: number, file: File): Promise<void> {
    try {
      const res = await api.templates.uploadMedia(file, companyId);
      updateItem(index, { media_url: res.file_url, mime_type: res.mime_type });
    } catch {
      setError("Error subiendo archivo");
    }
  }

  async function onSave(): Promise<void> {
    try {
      setSaving(true);
      setError(null);
      const payload = { name, items };
      if (isEditing && editingId !== null) {
        await api.templates.update(editingId, payload, companyId);
      } else {
        await api.templates.create(payload, companyId);
      }
      resetForm();
      await fetchTemplates();
    } catch (e) {
      setError("Error guardando el template");
    } finally {
      setSaving(false);
    }
  }

  function onEdit(tpl: TemplateDTO): void {
    setEditingId(tpl.id);
    setName(tpl.name);
    setItems(
      tpl.items
        .sort((a, b) => a.order_index - b.order_index)
        .map((i) => ({
          order_index: i.order_index,
          item_type: i.item_type,
          text_content: i.text_content ?? undefined,
          media_url: i.media_url ?? undefined,
          mime_type: i.mime_type ?? undefined,
          caption: i.caption ?? undefined,
        }))
    );
  }

  async function onDelete(id: number): Promise<void> {
    try {
      await api.templates.delete(id, companyId);
      if (editingId === id) resetForm();
      await fetchTemplates();
    } catch {
      setError("Error eliminando el template");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">
            Crea plantillas con múltiples mensajes y medios
          </p>
        </div>
        <button
          onClick={() => resetForm()}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          Nuevo Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Nombre del template"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <button
                onClick={() => void onSave()}
                disabled={saving || !name}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg disabled:opacity-50"
              >
                {isEditing ? "Actualizar" : "Guardar"}
              </button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex flex-wrap gap-2">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addItem("text")}
              >
                + Texto
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addItem("image")}
              >
                + Imagen
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addItem("video")}
              >
                + Video
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addItem("audio")}
              >
                + Audio
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addItem("document")}
              >
                + Documento
              </button>
            </div>

            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-700">
                      #{idx + 1} — {it.item_type}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => moveItemUp(idx)}
                      >
                        ↑
                      </button>
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => moveItemDown(idx)}
                      >
                        ↓
                      </button>
                      <button
                        className="px-2 py-1 border rounded text-red-600"
                        onClick={() => removeItem(idx)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {it.item_type === "text" ? (
                    <textarea
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Escribe el mensaje de texto"
                      value={it.text_content ?? ""}
                      onChange={(e) =>
                        updateItem(idx, { text_content: e.target.value })
                      }
                    />
                  ) : (
                    <div className="space-y-2">
                      {it.media_url ? (
                        <div className="text-sm text-gray-700 break-all">
                          Archivo subido: {it.media_url}
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept={
                            it.item_type === "image"
                              ? "image/*"
                              : it.item_type === "video"
                              ? "video/*"
                              : it.item_type === "audio"
                              ? "audio/*"
                              : undefined
                          }
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void onUploadMedia(idx, f);
                          }}
                        />
                      )}
                      <input
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Caption (opcional)"
                        value={it.caption ?? ""}
                        onChange={(e) =>
                          updateItem(idx, { caption: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Tus templates" className="space-y-3">
            {loading ? (
              <div className="text-sm text-gray-600">Cargando…</div>
            ) : templates.length === 0 ? (
              <div className="text-sm text-gray-600">No hay templates aún</div>
            ) : (
              <div className="space-y-3">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {tpl.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tpl.items.length} items
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => onEdit(tpl)}
                        >
                          Editar
                        </button>
                        <button
                          className="px-2 py-1 border rounded text-red-600"
                          onClick={() => void onDelete(tpl.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
