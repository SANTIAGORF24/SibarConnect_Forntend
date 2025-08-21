// Script que verifica las variables de entorno
console.log("🔍 Verificando variables de entorno...");

// Simular el entorno de Next.js
const env = {
  NEXT_PUBLIC_API_BASE_URL: "https://d79757fc9d41.ngrok-free.app",
  NODE_ENV: "development",
  // Otras variables que podrían estar definidas
};

console.log("📋 Variables de entorno:");
console.log("- NEXT_PUBLIC_API_BASE_URL:", env.NEXT_PUBLIC_API_BASE_URL);
console.log("- NODE_ENV:", env.NODE_ENV);

// Simular la función ensureApiBase del frontend
function ensureApiBase(url) {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

// Simular la configuración por defecto del frontend
const defaultConfig = {
  baseUrl: ensureApiBase(
    env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  ),
};

console.log("\n🔧 Configuración de API:");
console.log("- URL original:", env.NEXT_PUBLIC_API_BASE_URL);
console.log("- URL procesada:", defaultConfig.baseUrl);
console.log("- URL final:", defaultConfig.baseUrl);

// Verificar que la URL sea válida
try {
  const url = new URL(defaultConfig.baseUrl);
  console.log("\n✅ URL válida:");
  console.log("- Protocolo:", url.protocol);
  console.log("- Host:", url.host);
  console.log("- Pathname:", url.pathname);
  console.log("- URL completa:", url.toString());
} catch (error) {
  console.error("\n❌ URL inválida:", error.message);
}

// Simular diferentes configuraciones
console.log("\n🔍 Probando diferentes configuraciones:");

const configs = [
  "http://localhost:8000",
  "http://localhost:8000/",
  "http://localhost:8000/api",
  "https://d79757fc9d41.ngrok-free.app",
  "https://d79757fc9d41.ngrok-free.app/",
  "https://d79757fc9d41.ngrok-free.app/api",
];

configs.forEach((config) => {
  const processed = ensureApiBase(config);
  console.log(`- "${config}" → "${processed}"`);
});

console.log("\n📝 Recomendaciones:");
console.log("1. Asegúrate de que NEXT_PUBLIC_API_BASE_URL no termine en /api");
console.log("2. La función ensureApiBase agregará /api automáticamente");
console.log(
  "3. Verifica que no haya espacios o caracteres extraños en la variable"
);
