import { Platform } from "react-native";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "10.0.2.2", "[::1]"]);

export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigError";
  }
}

/**
 * URL del backend (FastAPI).
 *
 * - Siempre se toma de EXPO_PUBLIC_API_URL (sin barra final).
 * - Solo en desarrollo (`__DEV__`) hay un valor por defecto: `localhost` en web/iOS y `10.0.2.2` en el
 *   emulador de Android (alias del equipo anfitrión).
 * - En un build de producción (APK) NO se admite una URL ausente ni apuntando a localhost/10.0.2.2:
 *   se lanza un error claro en vez de intentar conectar a un servidor inexistente.
 * No se incluyen claves ni credenciales: EXPO_PUBLIC_* queda visible dentro del APK.
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (configured) {
    if (!__DEV__ && isLocalUrl(configured)) {
      throw new ApiConfigError(
        "La URL del servidor apunta a esta misma máquina (localhost). Configura EXPO_PUBLIC_API_URL con la dirección del backend para este build.",
      );
    }
    return configured;
  }
  if (__DEV__) {
    return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";
  }
  throw new ApiConfigError(
    "Falta la URL del servidor. Configura EXPO_PUBLIC_API_URL al compilar la aplicación.",
  );
}

export function isLocalUrl(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}
