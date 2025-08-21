// Script que simula el cambio de variable de entorno
const LOCAL_API_URL = "http://localhost:8000/api";
const NGROK_API_URL = "https://d79757fc9d41.ngrok-free.app/api";

// Simular la función request del frontend
async function request(path, init = {}, config) {
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

  if (!response.ok) {
    const message = await response.text();
    console.log(`❌ Error: ${message}`);
    throw new Error(message || `Error ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Respuesta exitosa`);
  return data;
}

async function testBothEnvironments() {
  console.log("🔍 Probando ambas configuraciones de API...");

  // Test con localhost
  console.log("\n📝 Test 1: API Local (http://localhost:8000/api)");
  try {
    const localUser = await request(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: "admin@admin.com",
          password: "admin123",
        }),
      },
      { baseUrl: LOCAL_API_URL }
    );

    console.log("✅ Login local exitoso:", localUser.email);

    const localChats = await request(
      `/chats/?company_id=${localUser.company_id}`,
      {},
      { baseUrl: LOCAL_API_URL }
    );
    console.log("✅ Chats locales obtenidos:", localChats.length, "chats");
  } catch (error) {
    console.log("❌ Error con API local:", error.message);
  }

  // Test con ngrok
  console.log(
    "\n📝 Test 2: API Ngrok (https://d79757fc9d41.ngrok-free.app/api)"
  );
  try {
    const ngrokUser = await request(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: "admin@admin.com",
          password: "admin123",
        }),
      },
      { baseUrl: NGROK_API_URL }
    );

    console.log("✅ Login ngrok exitoso:", ngrokUser.email);

    const ngrokChats = await request(
      `/chats/?company_id=${ngrokUser.company_id}`,
      {},
      { baseUrl: NGROK_API_URL }
    );
    console.log("✅ Chats ngrok obtenidos:", ngrokChats.length, "chats");
  } catch (error) {
    console.log("❌ Error con API ngrok:", error.message);
  }

  // Test de comparación
  console.log("\n📝 Test 3: Comparación de respuestas...");
  try {
    const [localUser, ngrokUser] = await Promise.all([
      request(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: "admin@admin.com",
            password: "admin123",
          }),
        },
        { baseUrl: LOCAL_API_URL }
      ),
      request(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: "admin@admin.com",
            password: "admin123",
          }),
        },
        { baseUrl: NGROK_API_URL }
      ),
    ]);

    console.log("🔍 Comparando respuestas de login:");
    console.log("- Local user ID:", localUser.id);
    console.log("- Ngrok user ID:", ngrokUser.id);
    console.log("- IDs iguales:", localUser.id === ngrokUser.id);

    const [localChats, ngrokChats] = await Promise.all([
      request(
        `/chats/?company_id=${localUser.company_id}`,
        {},
        { baseUrl: LOCAL_API_URL }
      ),
      request(
        `/chats/?company_id=${ngrokUser.company_id}`,
        {},
        { baseUrl: NGROK_API_URL }
      ),
    ]);

    console.log("🔍 Comparando respuestas de chats:");
    console.log("- Local chats count:", localChats.length);
    console.log("- Ngrok chats count:", ngrokChats.length);
    console.log("- Counts iguales:", localChats.length === ngrokChats.length);
  } catch (error) {
    console.log("❌ Error en comparación:", error.message);
  }
}

// Ejecutar la prueba
testBothEnvironments();
