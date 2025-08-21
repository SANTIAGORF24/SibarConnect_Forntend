// Script de prueba para diagnosticar problemas con la API
const API_BASE_URL = "https://d79757fc9d41.ngrok-free.app/api";

async function testAPI() {
  console.log("🔍 Probando API con URL:", API_BASE_URL);

  try {
    // Test 1: Endpoint de login (debería funcionar)
    console.log("\n📝 Test 1: Probando login...");
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@admin.com",
        password: "admin123",
      }),
    });

    console.log("Login Status:", loginResponse.status);
    console.log(
      "Login Headers:",
      Object.fromEntries(loginResponse.headers.entries())
    );

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("✅ Login exitoso:", loginData.email);

      // Test 2: Endpoint de chats (debería fallar sin autenticación)
      console.log(
        "\n📝 Test 2: Probando endpoint de chats sin autenticación..."
      );
      const chatsResponse = await fetch(`${API_BASE_URL}/chats/?company_id=1`);
      console.log("Chats Status:", chatsResponse.status);
      console.log(
        "Chats Headers:",
        Object.fromEntries(chatsResponse.headers.entries())
      );

      if (!chatsResponse.ok) {
        const errorText = await chatsResponse.text();
        console.log("❌ Error esperado (sin autenticación):", errorText);
      }

      // Test 3: Endpoint de chats con token de autenticación
      console.log(
        "\n📝 Test 3: Probando endpoint de chats con autenticación..."
      );
      const chatsAuthResponse = await fetch(
        `${API_BASE_URL}/chats/?company_id=1`,
        {
          headers: {
            Authorization: `Bearer ${loginData.token || "no-token"}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Chats Auth Status:", chatsAuthResponse.status);
      console.log(
        "Chats Auth Headers:",
        Object.fromEntries(chatsAuthResponse.headers.entries())
      );

      if (chatsAuthResponse.ok) {
        const chatsData = await chatsAuthResponse.json();
        console.log(
          "✅ Chats obtenidos exitosamente:",
          chatsData.length,
          "chats"
        );
      } else {
        const errorText = await chatsAuthResponse.text();
        console.log("❌ Error con autenticación:", errorText);
      }
    } else {
      const errorText = await loginResponse.text();
      console.log("❌ Error en login:", errorText);
    }
  } catch (error) {
    console.error("💥 Error general:", error.message);
  }
}

// Ejecutar la prueba
testAPI();
