export type ApiConfig = {
  baseUrl: string;
};

function ensureApiBase(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

const defaultConfig: ApiConfig = {
  baseUrl: ensureApiBase(
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  ),
};

async function request<T>(
  path: string,
  init?: RequestInit,
  config: ApiConfig = defaultConfig
): Promise<T> {
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Error ${res.status}`);
  }
  return (await res.json()) as T;
}

export type LoginPayload = { email: string; password: string };

export type CompanyInfo = {
  id: number;
  nombre: string;
  razon_social: string;
  nit: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  activa: boolean;
};

export type UserDTO = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  is_super_admin: boolean;
  role?: RoleDTO | null;
  company_id?: number | null;
  company?: CompanyInfo | null;
};
export type RoleDTO = {
  id: number;
  name: string;
  is_admin: boolean;
  allowed_paths: string[];
};

export type CompanyDTO = {
  id: number;
  nombre: string;
  razon_social: string;
  nit: string;
  responsable: string;
  activa: boolean;
  cantidad_usuarios: number;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  created_at: string;
  ycloud_api_key?: string | null;
  ycloud_webhook_url?: string | null;
  whatsapp_phone_number?: string | null;
};

export type YCloudConfig = {
  api_key: string;
  webhook_url?: string;
  phone_number?: string;
};

export type YCloudTestResult = {
  success: boolean;
  message: string;
  phone_number?: string;
  webhook_status?: string;
};

export type CompanyCreateDTO = Omit<CompanyDTO, "id" | "created_at">;
export type CompanyUpdateDTO = Partial<CompanyCreateDTO>;

// Chat Types
export type MessageDTO = {
  id: number;
  chat_id: number;
  content: string;
  message_type: string;
  direction: "incoming" | "outgoing";
  user_id?: number;
  whatsapp_message_id?: string;
  wamid?: string;
  sender_name?: string;
  status: string;
  attachment_url?: string;
  timestamp?: string;
  created_at?: string;
};

export type ChatDTO = {
  id: number;
  company_id: number;
  phone_number: string;
  customer_name?: string;
  status?: string;
  assigned_user_id?: number | null;
  priority?: "low" | "medium" | "high";
  last_message_time?: string;
  last_message_at?: string;
  created_at: string;
  updated_at?: string;
  messages?: MessageDTO[];
};

export type ChatWithLastMessageDTO = ChatDTO & {
  last_message?: MessageDTO;
  unread_count?: number;
};

export type SendMessageRequestDTO = {
  chat_id: number;
  content: string;
  message_type: string;
};

export type UserCreateDTO = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  is_super_admin?: boolean;
  role_id?: number | null;
  company_id?: number | null;
};
export type UserUpdateDTO = Partial<
  Omit<UserCreateDTO, "password"> & { password: string }
>;
export type UserOutDTO = UserDTO & {
  first_name: string;
  last_name: string;
  username: string;
  role?: RoleDTO | null;
  company_id?: number | null;
};

export const api = {
  auth: {
    login(payload: LoginPayload) {
      return request<UserDTO>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  companies: {
    list() {
      return request<CompanyDTO[]>("/companies");
    },
    create(payload: CompanyCreateDTO) {
      return request<CompanyDTO>("/companies", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    get(id: number) {
      return request<CompanyDTO>(`/companies/${id}`);
    },
    update(id: number, payload: CompanyUpdateDTO) {
      return request<CompanyDTO>(`/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    remove(id: number) {
      return request<{ ok: true }>(`/companies/${id}`, { method: "DELETE" });
    },
    updateYCloudConfig(id: number, config: YCloudConfig) {
      return request<CompanyDTO>(`/companies/${id}/ycloud-config`, {
        method: "PUT",
        body: JSON.stringify(config),
      });
    },
    testYCloudConnection(id: number) {
      return request<YCloudTestResult>(`/companies/${id}/test-ycloud`, {
        method: "POST",
      });
    },
  },
  roles: {
    list() {
      return request<RoleDTO[]>("/roles");
    },
    create(payload: Omit<RoleDTO, "id">) {
      return request<RoleDTO>("/roles", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id: number, payload: Partial<Omit<RoleDTO, "id">>) {
      return request<RoleDTO>(`/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    remove(id: number) {
      return request<{ ok: true }>(`/roles/${id}`, { method: "DELETE" });
    },
  },
  users: {
    list() {
      return request<UserOutDTO[]>("/users");
    },
    create(payload: UserCreateDTO) {
      return request<UserOutDTO>("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id: number, payload: UserUpdateDTO) {
      return request<UserOutDTO>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    remove(id: number) {
      return request<{ ok: true }>(`/users/${id}`, { method: "DELETE" });
    },
  },
  chats: {
    list(
      companyId: number,
      params?: {
        status?: string;
        priority?: string;
        has_appointment?: boolean;
        has_response?: boolean;
        last_days?: number;
        q?: string;
        tag_ids?: number[];
        pinned_by_user_id?: number;
        exclude_snoozed_for_user_id?: number;
      }
    ) {
      const p = new URLSearchParams();
      p.set("company_id", String(companyId));
      if (params?.status) p.set("status", params.status);
      if (params?.priority) p.set("priority", params.priority);
      if (params?.has_appointment !== undefined)
        p.set("has_appointment", String(params.has_appointment));
      if (params?.has_response !== undefined)
        p.set("has_response", String(params.has_response));
      if (params?.last_days !== undefined)
        p.set("last_days", String(params.last_days));
      if (params?.q) p.set("q", params.q);
      if (params?.tag_ids && params.tag_ids.length > 0)
        p.set("tag_ids", params.tag_ids.join(","));
      if (params?.pinned_by_user_id !== undefined)
        p.set("pinned_by_user_id", String(params.pinned_by_user_id));
      if (params?.exclude_snoozed_for_user_id !== undefined)
        p.set(
          "exclude_snoozed_for_user_id",
          String(params.exclude_snoozed_for_user_id)
        );
      return request<ChatWithLastMessageDTO[]>(`/chats/?${p.toString()}`);
    },
    getMessages(chatId: number, companyId: number, limit: number = 50) {
      return request<MessageDTO[]>(
        `/chats/${chatId}/messages?company_id=${companyId}&limit=${limit}`
      );
    },
    sendMessage(
      payload: SendMessageRequestDTO,
      companyId: number,
      userId: number
    ) {
      return request<{
        success: boolean;
        message: string;
        message_id: number;
        whatsapp_message_id?: string;
      }>(`/chats/send-message?company_id=${companyId}&user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    start(
      payload: {
        phone_number: string;
        content: string;
        message_type?: string;
        customer_name?: string;
      },
      companyId: number,
      userId: number
    ) {
      return request<{
        success: boolean;
        chat_id: number;
        message_id: number;
        whatsapp_message_id?: string;
      }>(`/chats/start?company_id=${companyId}&user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    startTemplate(
      payload: {
        phone_number: string;
        template_name: string;
        language_code?: string;
        body_params?: string[];
        customer_name?: string;
      },
      companyId: number,
      userId: number
    ) {
      return request<{
        success: boolean;
        chat_id: number;
        message_id: number;
        whatsapp_message_id?: string;
      }>(`/chats/start-template?company_id=${companyId}&user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    sendMediaLink(
      payload: {
        chat_id: number;
        media_url: string;
        message_type: string;
        caption?: string;
      },
      companyId: number,
      userId: number
    ) {
      return request<{
        success: boolean;
        message_id: number;
        whatsapp_message_id?: string;
      }>(`/chats/send-media-link?company_id=${companyId}&user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    delete(chatId: number, companyId: number) {
      return request<{
        success: boolean;
        message: string;
      }>(`/chats/${chatId}?company_id=${companyId}`, {
        method: "DELETE",
      });
    },
    uploadMedia(file: File, chatId: number, companyId: number, userId: number) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chat_id", chatId.toString());
      formData.append("company_id", companyId.toString());
      formData.append("user_id", userId.toString());

      return fetch(`${defaultConfig.baseUrl}/chats/upload-media`, {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        return res.json();
      });
    },
    assign(
      payload: {
        chat_id: number;
        assigned_user_id: number;
        priority: "low" | "medium" | "high";
      },
      companyId: number
    ) {
      return request<ChatDTO>(`/chats/assign?company_id=${companyId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateStatus(
      payload: { chat_id: number; status: string },
      companyId: number
    ) {
      return request<ChatDTO>(`/chats/status?company_id=${companyId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    createAppointment(
      payload: { chat_id: number; assigned_user_id: number; start_at: string },
      companyId: number
    ) {
      return request<{
        id: number;
        company_id: number;
        chat_id: number;
        assigned_user_id: number;
        start_at: string;
      }>(`/chats/appointments?company_id=${companyId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    listAppointments(chatId: number, companyId: number) {
      return request<
        Array<{
          id: number;
          company_id: number;
          chat_id: number;
          assigned_user_id: number;
          start_at: string;
        }>
      >(`/chats/appointments?chat_id=${chatId}&company_id=${companyId}`);
    },
    updateAppointment(
      appointmentId: number,
      companyId: number,
      payload: { assigned_user_id?: number; start_at?: string }
    ) {
      return request<{
        id: number;
        company_id: number;
        chat_id: number;
        assigned_user_id: number;
        start_at: string;
      }>(`/chats/appointments/${appointmentId}?company_id=${companyId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteAppointment(appointmentId: number, companyId: number) {
      return request<{ success: boolean }>(
        `/chats/appointments/${appointmentId}?company_id=${companyId}`,
        { method: "DELETE" }
      );
    },
    generateSummary(payload: { chat_id: number }, companyId: number) {
      return request<{
        id: number;
        summary: string;
        interest: "Interesado" | "No interesado" | "Indeciso";
        created_at: string;
      }>(`/chats/summaries/generate?company_id=${companyId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    getSummary(chatId: number, companyId: number) {
      return request<{
        id: number;
        summary: string;
        interest: "Interesado" | "No interesado" | "Indeciso";
        provider: string;
        model: string;
        created_at: string;
        updated_at?: string;
      }>(`/chats/summaries/${chatId}?company_id=${companyId}`);
    },
    listCompanyTags(companyId: number) {
      return request<Array<{ id: number; name: string }>>(
        `/chats/tags?company_id=${companyId}`
      );
    },
    createCompanyTag(companyId: number, name: string) {
      return request<{ id: number; name: string }>(
        `/chats/tags?company_id=${companyId}`,
        {
          method: "POST",
          body: JSON.stringify({ name }),
        }
      );
    },
    deleteCompanyTag(companyId: number, tagId: number) {
      return request<{ success: boolean }>(
        `/chats/tags/${tagId}?company_id=${companyId}`,
        { method: "DELETE" }
      );
    },
    listChatTags(chatId: number) {
      return request<number[]>(`/chats/${chatId}/tags`);
    },
    setChatTags(chatId: number, tagIds: number[]) {
      return request<{ success: boolean }>(`/chats/${chatId}/tags`, {
        method: "PUT",
        body: JSON.stringify(tagIds),
      });
    },
    addNote(
      chatId: number,
      companyId: number,
      userId: number,
      content: string
    ) {
      const p = new URLSearchParams();
      p.set("company_id", String(companyId));
      p.set("user_id", String(userId));
      p.set("content", content);
      return request<{
        id: number;
        chat_id: number;
        user_id: number;
        content: string;
        created_at: string;
      }>(`/chats/${chatId}/notes?${p.toString()}`, { method: "POST" });
    },
    listNotes(chatId: number, companyId: number) {
      return request<
        Array<{
          id: number;
          chat_id: number;
          user_id: number;
          content: string;
          created_at: string;
        }>
      >(`/chats/${chatId}/notes?company_id=${companyId}`);
    },
    pin(chatId: number, userId: number) {
      return request<{ success: boolean }>(
        `/chats/${chatId}/pin?user_id=${userId}`,
        { method: "POST" }
      );
    },
    unpin(chatId: number, userId: number) {
      return request<{ success: boolean }>(
        `/chats/${chatId}/pin?user_id=${userId}`,
        { method: "DELETE" }
      );
    },
    snooze(chatId: number, userId: number, untilIso: string) {
      return request<{ success: boolean }>(
        `/chats/${chatId}/snooze?user_id=${userId}&until_at=${encodeURIComponent(
          untilIso
        )}`,
        { method: "POST" }
      );
    },
    unsnooze(chatId: number, userId: number) {
      return request<{ success: boolean }>(
        `/chats/${chatId}/snooze?user_id=${userId}`,
        { method: "DELETE" }
      );
    },
    bulk(
      companyId: number,
      args: {
        chat_ids: number[];
        status?: string;
        priority?: string;
        assigned_user_id?: number;
        tag_ids?: number[];
      }
    ) {
      const p = new URLSearchParams();
      p.set("company_id", String(companyId));
      args.chat_ids.forEach((id) => p.append("chat_ids", String(id)));
      if (args.status) p.set("status", args.status);
      if (args.priority) p.set("priority", args.priority);
      if (args.assigned_user_id !== undefined)
        p.set("assigned_user_id", String(args.assigned_user_id));
      if (args.tag_ids && args.tag_ids.length > 0)
        args.tag_ids.forEach((id) => p.append("tag_ids", String(id)));
      return request<{ updated: number; success: boolean }>(
        `/chats/bulk?${p.toString()}`,
        { method: "POST" }
      );
    },
    insights(
      chatId: number,
      companyId: number,
      limit: number = 100,
      messages?: Array<{
        id?: number;
        content: string;
        message_type?: string;
        direction?: string;
        created_at?: string;
      }>
    ) {
      return request<{
        message_sentiments?: Array<{
          id?: number;
          content?: string;
          sentiment: string;
          score: number;
        }>;
        chat_sentiment?: { label: string; score: number; trend?: string };
        intents?: string[];
        entities?: Array<{ type: string; value: string }>;
        suggested_actions?: Array<{ action: string; reason?: string }>;
        suggested_reply?: string;
        tone_warnings?: string[];
        interest_probability?: number;
        churn_risk?: number;
      }>(`/chats/ai/insights?company_id=${companyId}`, {
        method: "POST",
        body: JSON.stringify({ chat_id: chatId, limit, messages }),
      });
    },
    assistDraft(draft: string) {
      return request<{ improved: string; tone_warnings: string[] }>(
        `/chats/ai/assist-draft`,
        {
          method: "POST",
          body: JSON.stringify({ draft }),
        }
      );
    },
  },
  stickers: {
    getCompanyStickers(companyId: number) {
      return request<CompanyStickerDTO[]>(`/chats/stickers/${companyId}`);
    },
    saveSticker(stickerUrl: string, stickerName: string, companyId: number) {
      const formData = new FormData();
      formData.append("sticker_url", stickerUrl);
      formData.append("sticker_name", stickerName);
      formData.append("company_id", companyId.toString());

      return fetch(`${defaultConfig.baseUrl}/chats/stickers/save`, {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        return res.json();
      });
    },
    deleteSticker(stickerId: number, companyId: number) {
      return request<{
        success: boolean;
        message: string;
      }>(`/chats/stickers/${stickerId}?company_id=${companyId}`, {
        method: "DELETE",
      });
    },
  },
  templates: {
    list(companyId: number) {
      return fetch(
        `${defaultConfig.baseUrl}/templates/?company_id=${companyId}`
      ).then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      });
    },
    create(
      payload: {
        name: string;
        items: Array<{
          order_index: number;
          item_type: "text" | "image" | "video" | "audio" | "document";
          text_content?: string;
          media_url?: string;
          mime_type?: string;
          caption?: string;
        }>;
      },
      companyId: number
    ) {
      return fetch(
        `${defaultConfig.baseUrl}/templates/?company_id=${companyId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      ).then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      });
    },
    update(
      templateId: number,
      payload: {
        name?: string;
        items?: Array<{
          order_index: number;
          item_type: "text" | "image" | "video" | "audio" | "document";
          text_content?: string;
          media_url?: string;
          mime_type?: string;
          caption?: string;
        }>;
      },
      companyId: number
    ) {
      return fetch(
        `${defaultConfig.baseUrl}/templates/${templateId}?company_id=${companyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      ).then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      });
    },
    delete(templateId: number, companyId: number) {
      return fetch(
        `${defaultConfig.baseUrl}/templates/${templateId}?company_id=${companyId}`,
        { method: "DELETE" }
      ).then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      });
    },
    uploadMedia(file: File, companyId: number, caption?: string) {
      const formData = new FormData();
      formData.append("file", file);
      if (caption) formData.append("caption", caption);
      return fetch(
        `${defaultConfig.baseUrl}/templates/upload?company_id=${companyId}`,
        { method: "POST", body: formData }
      ).then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      });
    },
  },
};

// Sticker Types
export type CompanyStickerDTO = {
  id: number;
  company_id: number;
  name: string;
  file_path: string;
  url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
};
