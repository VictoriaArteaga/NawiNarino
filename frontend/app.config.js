// Configuración dinámica de Expo (extiende app.json).
//
// Política de red de Android:
//   - Producción (por defecto): SOLO HTTPS. Android 9+ bloquea el tráfico HTTP en claro.
//   - Demostración en red local (perfil "preview" de eas.json): ANDROID_ALLOW_CLEARTEXT=1 permite
//     HTTP hacia la IP del backend en la LAN. No usar para distribuir fuera de una demo.
// El permiso INTERNET lo agrega Expo por defecto; no se piden otros permisos.
// La URL del backend NO va aquí: se inyecta con EXPO_PUBLIC_API_URL (ver .env.example y README).
module.exports = ({ config }) => {
  const allowCleartext = process.env.ANDROID_ALLOW_CLEARTEXT === "1";
  const plugins = (config.plugins ?? []).filter(
    (p) => (Array.isArray(p) ? p[0] : p) !== "expo-build-properties",
  );
  plugins.push(["expo-build-properties", { android: { usesCleartextTraffic: allowCleartext } }]);
  return { ...config, plugins };
};
