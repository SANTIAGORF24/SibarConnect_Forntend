// Script que simula exactamente las llamadas del frontend
const API_BASE_URL = "https://d79757fc9d41.ngrok-free.app/api";

// Simular la función request del frontend
async function request(path, init = {}, config = { baseUrl: API_BASE_URL }) {
  const url = `${config.baseUrl}${path}`;
  console.log(`🌐 Llamando a: ${url}`);

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  console.log(`📊 Status: ${response.status}`);
  console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const message = await response.text();
    console.log(`❌ Error: ${message}`);
    throw new Error(message || `Error ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Respuesta exitosa:`, data);
  return data;
}

async function testFrontendAPI() {
  console.log("🔍 Probando API del frontend con URL:", API_BASE_URL);

  try {
    // Test 1: Login (como lo hace el frontend)
    console.log("\n📝 Test 1: Login (api.auth.login)...");
    const user = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@admin.com", password: "admin123" }),
    });
    console.log(
      "✅ Usuario logueado:",
      user.email,
      "Company ID:",
      user.company_id
    );

    // Test 2: Listar chats (como lo hace el frontend)
    console.log("\n📝 Test 2: Listar chats (api.chats.list)...");
    const chats = await request(`/chats/?company_id=${user.company_id}`);
    console.log("✅ Chats obtenidos:", chats.length, "chats");

    // Test 3: Obtener mensajes de un chat (como lo hace el frontend)
    if (chats.length > 0) {
      console.log("\n📝 Test 3: Obtener mensajes (api.chats.getMessages)...");
      const messages = await request(
        `/chats/${chats[0].id}/messages?company_id=${user.company_id}&limit=50`
      );
      console.log("✅ Mensajes obtenidos:", messages.length, "mensajes");
    }

    // Test 4: Listar usuarios (como lo hace el frontend)
    console.log("\n📝 Test 4: Listar usuarios (api.users.list)...");
    const users = await request("/users");
    console.log("✅ Usuarios obtenidos:", users.length, "usuarios");

    // Test 5: Listar empresas (como lo hace el frontend)
    console.log("\n📝 Test 5: Listar empresas (api.companies.list)...");
    const companies = await request("/companies");
    console.log("✅ Empresas obtenidas:", companies.length, "empresas");
  } catch (error) {
    console.error("💥 Error en la prueba:", error.message);
  }
}

// Ejecutar la prueba
testFrontendAPI();
