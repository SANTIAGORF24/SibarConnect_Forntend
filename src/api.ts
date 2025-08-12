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
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  messages?: MessageDTO[];
};

export type ChatWithLastMessageDTO = ChatDTO & {
  last_message?: MessageDTO;
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
    list(companyId: number) {
      return request<ChatWithLastMessageDTO[]>(
        `/chats?company_id=${companyId}`
      );
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

      return fetch(`${defaultConfig.baseUrl}/chats/save-sticker`, {
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
