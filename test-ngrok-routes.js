// Script que prueba diferentes rutas para identificar problemas con ngrok
const API_BASE_URL = "https://d79757fc9d41.ngrok-free.app/api";

async function testRoute(path, method = "GET", body = null) {
  try {
    const url = `${API_BASE_URL}${path}`;
    console.log(`🌐 Probando: ${method} ${url}`);

    const init = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body) {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers.get("content-type")}`);

    if (response.ok) {
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log(`✅ Respuesta JSON exitosa`);
        return { success: true, data, contentType };
      } else if (contentType && contentType.includes("text/html")) {
        const html = await response.text();
        console.log(`⚠️ Respuesta HTML (posible error de ngrok)`);
        console.log(`📄 Primeros 200 caracteres:`, html.substring(0, 200));
        return { success: false, error: "HTML response", contentType, html };
      } else {
        const text = await response.text();
        console.log(`⚠️ Respuesta inesperada: ${contentType}`);
        console.log(`📄 Primeros 200 caracteres:`, text.substring(0, 200));
        return {
          success: false,
          error: "Unexpected response",
          contentType,
          text,
        };
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Error HTTP ${response.status}: ${errorText}`);
      return {
        success: false,
        error: `HTTP ${response.status}`,
        status: response.status,
      };
    }
  } catch (error) {
    console.log(`💥 Error de red: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllRoutes() {
  console.log("🔍 Probando todas las rutas de la API...");

  const routes = [
    // Rutas de autenticación
    {
      path: "/auth/login",
      method: "POST",
      body: { email: "admin@admin.com", password: "admin123" },
    },

    // Rutas de chats
    { path: "/chats/?company_id=1", method: "GET" },
    { path: "/chats/1/messages?company_id=1&limit=10", method: "GET" },

    // Rutas de usuarios
    { path: "/users", method: "GET" },

    // Rutas de empresas
    { path: "/companies", method: "GET" },

    // Rutas de roles
    { path: "/roles", method: "GET" },

    // Rutas de templates
    { path: "/templates/?company_id=1", method: "GET" },

    // Rutas de stickers
    { path: "/chats/stickers/1", method: "GET" },
  ];

  const results = [];

  for (const route of routes) {
    console.log(`\n${"=".repeat(60)}`);
    const result = await testRoute(route.path, route.method, route.body);
    results.push({ route, result });

    // Esperar un poco entre llamadas para no sobrecargar ngrok
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Resumen de resultados
  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 RESUMEN DE RESULTADOS:");
  console.log(`${"=".repeat(60)}`);

  let successCount = 0;
  let htmlCount = 0;
  let errorCount = 0;

  results.forEach(({ route, result }, index) => {
    const status = result.success
      ? "✅"
      : result.contentType?.includes("text/html")
      ? "⚠️"
      : "❌";
    console.log(`${status} ${route.method} ${route.path}`);

    if (result.success) {
      successCount++;
    } else if (result.contentType?.includes("text/html")) {
      htmlCount++;
    } else {
      errorCount++;
    }
  });

  console.log(`\n📈 ESTADÍSTICAS:`);
  console.log(`- Total de rutas: ${results.length}`);
  console.log(`- ✅ Exitosas: ${successCount}`);
  console.log(`- ⚠️ HTML (ngrok): ${htmlCount}`);
  console.log(`- ❌ Errores: ${errorCount}`);

  if (htmlCount > 0) {
    console.log(`\n🚨 PROBLEMA IDENTIFICADO:`);
    console.log(`- ${htmlCount} rutas están devolviendo HTML en lugar de JSON`);
    console.log(`- Esto indica que ngrok está interceptando algunas llamadas`);
    console.log(`- Posibles causas:`);
    console.log(`  1. Configuración incorrecta de ngrok`);
    console.log(`  2. Límites de ngrok (gratuito tiene restricciones)`);
    console.log(`  3. Problemas de enrutamiento en ngrok`);
  }
}

// Ejecutar las pruebas
testAllRoutes();
