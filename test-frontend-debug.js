// Script que simula el debug del frontend
const API_BASE_URL = "https://d79757fc9d41.ngrok-free.app/api";

// Simular el estado del frontend
let currentUser = null;
let chats = [];
let messages = [];
let loading = false;
let error = null;

// Simular la función request del frontend (exactamente como está implementada)
async function request(path, init = {}, config = { baseUrl: API_BASE_URL }) {
  const url = `${config.baseUrl}${path}`;
  console.log(`🌐 Llamando a: ${url}`);

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });

    console.log(`📊 Status: ${res.status}`);
    console.log(`📋 Content-Type: ${res.headers.get("content-type")}`);
    console.log(`📋 Headers:`, Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const message = await res.text();
      console.log(`❌ Error ${res.status}: ${message}`);
      throw new Error(message || `Error ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      console.log(`✅ Respuesta JSON exitosa`);
      return data;
    } else {
      const text = await res.text();
      console.log(`⚠️ Respuesta no-JSON: ${contentType}`);
      console.log(`📄 Contenido:`, text.substring(0, 200));
      throw new Error(`Respuesta no-JSON: ${contentType}`);
    }
  } catch (error) {
    console.log(`💥 Error en request: ${error.message}`);
    throw error;
  }
}

// Simular las funciones de la API del frontend
const api = {
  auth: {
    async login(payload) {
      console.log("🔐 Iniciando login...");
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  chats: {
    async list(companyId, params = {}) {
      console.log("📋 Iniciando listado de chats...");
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
      return request(`/chats/?${p.toString()}`);
    },
    async getMessages(chatId, companyId, limit = 50) {
      console.log("💬 Iniciando obtención de mensajes...");
      return request(
        `/chats/${chatId}/messages?company_id=${companyId}&limit=${limit}`
      );
    },
    async sendMessage(payload, companyId, userId) {
      console.log("📤 Iniciando envío de mensaje...");
      return request(
        `/chats/send-message?company_id=${companyId}&user_id=${userId}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
  },
  users: {
    async list() {
      console.log("👥 Iniciando listado de usuarios...");
      return request("/users");
    },
  },
  companies: {
    async list() {
      console.log("🏢 Iniciando listado de empresas...");
      return request("/companies");
    },
  },
};

// Simular el flujo completo del frontend con debug detallado
async function simulateFrontendFlowWithDebug() {
  console.log(
    "🔍 Simulando flujo completo del frontend con debug detallado..."
  );

  try {
    // Paso 1: Login (como lo hace el frontend)
    console.log("\n📝 Paso 1: Login...");
    loading = true;
    error = null;

    const user = await api.auth.login({
      email: "admin@admin.com",
      password: "admin123",
    });
    currentUser = user;
    console.log(
      "✅ Usuario logueado:",
      user.email,
      "Company ID:",
      user.company_id
    );

    // Paso 2: Cargar chats (como lo hace el frontend)
    console.log("\n📝 Paso 2: Cargar chats...");
    if (!currentUser?.company_id) {
      throw new Error("Usuario no tiene empresa asignada");
    }

    const chatsData = await api.chats.list(currentUser.company_id);
    chats = chatsData;
    console.log("✅ Chats cargados:", chats.length, "chats");

    // Paso 3: Cargar usuarios (como lo hace el frontend)
    console.log("\n📝 Paso 3: Cargar usuarios...");
    const allUsers = await api.users.list();
    const filteredUsers = currentUser?.company_id
      ? allUsers.filter((u) => u.company_id === currentUser.company_id)
      : allUsers;
    console.log("✅ Usuarios cargados:", filteredUsers.length, "usuarios");

    // Paso 4: Cargar empresas (como lo hace el frontend)
    console.log("\n📝 Paso 4: Cargar empresas...");
    const companiesData = await api.companies.list();
    console.log("✅ Empresas cargadas:", companiesData.length, "empresas");

    // Paso 5: Cargar mensajes de un chat (como lo hace el frontend)
    if (chats.length > 0) {
      console.log("\n📝 Paso 5: Cargar mensajes...");
      const selectedChat = chats[0];
      const messagesData = await api.chats.getMessages(
        selectedChat.id,
        currentUser.company_id,
        100
      );
      messages = messagesData;
      console.log("✅ Mensajes cargados:", messages.length, "mensajes");
    }

    // Paso 6: Simular envío de mensaje (como lo hace el frontend)
    if (chats.length > 0) {
      console.log("\n📝 Paso 6: Simular envío de mensaje...");
      const selectedChat = chats[0];
      const messageRequest = {
        chat_id: selectedChat.id,
        content: "Mensaje de prueba desde script de debug",
        message_type: "text",
      };

      const result = await api.chats.sendMessage(
        messageRequest,
        currentUser.company_id,
        currentUser.id
      );
      console.log("✅ Mensaje enviado:", result);
    }

    console.log("\n🎉 Flujo del frontend completado exitosamente!");
  } catch (err) {
    console.error("❌ Error en el flujo del frontend:", err.message);
    console.error("❌ Stack trace:", err.stack);
    error = err.message;
  } finally {
    loading = false;
  }

  // Mostrar estado final
  console.log("\n📊 Estado final del frontend:");
  console.log("- Usuario:", currentUser ? currentUser.email : "No logueado");
  console.log("- Chats:", chats.length);
  console.log("- Mensajes:", messages.length);
  console.log("- Loading:", loading);
  console.log("- Error:", error);
}

// Ejecutar la simulación
simulateFrontendFlowWithDebug();
