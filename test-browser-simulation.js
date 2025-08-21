// Script que simula el comportamiento del navegador
const API_BASE_URL = "https://d79757fc9d41.ngrok-free.app/api";

// Simular diferentes escenarios del navegador
async function testBrowserScenarios() {
  console.log("🔍 Probando diferentes escenarios del navegador...");

  // Escenario 1: Llamada simple sin cache
  console.log("\n📝 Escenario 1: Llamada simple sin cache");
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: JSON.stringify({ email: "admin@admin.com", password: "admin123" }),
    });

    console.log("✅ Status:", response.status);
    console.log("✅ Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Login exitoso:", data.email);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Escenario 2: Llamada con diferentes headers
  console.log("\n📝 Escenario 2: Llamada con diferentes headers");
  try {
    const response = await fetch(`${API_BASE_URL}/chats/?company_id=1`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    console.log("✅ Status:", response.status);
    console.log("✅ Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Chats obtenidos:", data.length, "chats");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Escenario 3: Llamada con timeout
  console.log("\n📝 Escenario 3: Llamada con timeout");
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("✅ Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Usuarios obtenidos:", data.length, "usuarios");
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("⏰ Timeout después de 10 segundos");
    } else {
      console.log("❌ Error:", error.message);
    }
  }

  // Escenario 4: Llamada con retry
  console.log("\n📝 Escenario 4: Llamada con retry");
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 Intento ${retryCount + 1} de ${maxRetries}`);

      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Empresas obtenidas:", data.length, "empresas");
        break; // Éxito, salir del bucle
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      retryCount++;
      console.log(`❌ Error en intento ${retryCount}:`, error.message);

      if (retryCount >= maxRetries) {
        console.log("💥 Máximo de reintentos alcanzado");
      } else {
        console.log("⏳ Esperando 1 segundo antes del siguiente intento...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Escenario 5: Verificar conectividad
  console.log("\n📝 Escenario 5: Verificar conectividad");
  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/chats/?company_id=1`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log("✅ Status:", response.status);
    console.log("⏱️ Tiempo de respuesta:", responseTime, "ms");

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Chats obtenidos:", data.length, "chats");
    }
  } catch (error) {
    console.log("❌ Error de conectividad:", error.message);
  }
}

// Ejecutar las pruebas
testBrowserScenarios();
