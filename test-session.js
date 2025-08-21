// Script que simula el manejo de sesión del frontend
const API_BASE_URL = "https://d79757fc9d41.ngrok-free.app/api";

// Simular localStorage/sessionStorage
const storage = new Map();

// Simular las funciones de sesión del frontend
function saveSession(user, remember = true) {
  const record = remember
    ? { user }
    : { user, expiresAt: Date.now() + 3 * 60 * 60 * 1000 };
  storage.set("auth:user", JSON.stringify(record));
  console.log("💾 Sesión guardada:", user.email);
}

function getSession() {
  try {
    const rawSession = storage.get("auth:user");
    if (rawSession) {
      const maybeStored = JSON.parse(rawSession);
      if (maybeStored.user) {
        if (maybeStored.expiresAt && Date.now() > maybeStored.expiresAt) {
          console.log("⏰ Sesión expirada");
          return null;
        }
        return maybeStored.user;
      }
      return maybeStored;
    }
  } catch (error) {
    console.error("❌ Error leyendo sesión:", error);
  }
  return null;
}

function clearSession() {
  storage.delete("auth:user");
  console.log("🗑️ Sesión limpiada");
}

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

  if (!response.ok) {
    const message = await response.text();
    console.log(`❌ Error: ${message}`);
    throw new Error(message || `Error ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Respuesta exitosa`);
  return data;
}

async function testSessionFlow() {
  console.log(
    "🔍 Probando flujo de sesión del frontend con URL:",
    API_BASE_URL
  );

  try {
    // Paso 1: Login (como lo hace el frontend)
    console.log("\n📝 Paso 1: Login (api.auth.login)...");
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

    // Paso 2: Guardar sesión (como lo hace el frontend)
    console.log("\n📝 Paso 2: Guardar sesión...");
    saveSession(user, true);

    // Paso 3: Verificar sesión guardada
    console.log("\n📝 Paso 3: Verificar sesión guardada...");
    const savedUser = getSession();
    if (savedUser) {
      console.log("✅ Sesión recuperada:", savedUser.email);
    } else {
      console.log("❌ No se pudo recuperar la sesión");
      return;
    }

    // Paso 4: Listar chats usando la sesión guardada
    console.log("\n📝 Paso 4: Listar chats usando sesión guardada...");
    const chats = await request(`/chats/?company_id=${savedUser.company_id}`);
    console.log("✅ Chats obtenidos:", chats.length, "chats");

    // Paso 5: Obtener mensajes de un chat
    if (chats.length > 0) {
      console.log("\n📝 Paso 5: Obtener mensajes...");
      const messages = await request(
        `/chats/${chats[0].id}/messages?company_id=${savedUser.company_id}&limit=50`
      );
      console.log("✅ Mensajes obtenidos:", messages.length, "mensajes");
    }

    // Paso 6: Simular logout
    console.log("\n📝 Paso 6: Simular logout...");
    clearSession();
    const clearedUser = getSession();
    if (!clearedUser) {
      console.log("✅ Sesión limpiada correctamente");
    } else {
      console.log("❌ Error: la sesión no se limpió");
    }

    // Paso 7: Intentar acceder a chats sin sesión
    console.log("\n📝 Paso 7: Intentar acceder a chats sin sesión...");
    try {
      const chatsWithoutSession = await request(`/chats/?company_id=1`);
      console.log("⚠️ Acceso sin sesión:", chatsWithoutSession.length, "chats");
    } catch (error) {
      console.log("❌ Acceso denegado sin sesión (esperado):", error.message);
    }
  } catch (error) {
    console.error("💥 Error en la prueba:", error.message);
  }
}

// Ejecutar la prueba
testSessionFlow();
