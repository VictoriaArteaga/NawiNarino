# Compatibilidad con Android (APK)

**Estado:** configuración preparada y verificada (manifiesto resultante, bundle de Android, guardias de producción). **No se compiló ni instaló un APK** en esta
sesión (requiere EAS o Android SDK/JDK) y **no se probó desde un teléfono real**.

## Arquitectura
`APK (React Native)` → HTTP(S) → `FastAPI (backend)` → `Ollama` (en la misma máquina del backend, solo `127.0.0.1`).
Ollama y el modelo **no van dentro del APK**. El APK solo necesita la URL del backend.

## URL del backend (`EXPO_PUBLIC_API_URL`)
- Se resuelve en `frontend/services/config.ts` (en cada petición). Sin barra final.
- **Desarrollo:** si falta, `localhost:8000` (web/iOS) o `10.0.2.2:8000` (emulador Android).
- **Producción (APK):** la URL es obligatoria y **se rechaza** si falta o apunta a `localhost`, `127.0.0.1`, `0.0.0.0` o `10.0.2.2`: la pantalla muestra un mensaje claro
  («Falta la URL del servidor…» / «La URL del servidor apunta a esta misma máquina…»). Verificado en Chrome con builds de producción.
- `EXPO_PUBLIC_*` queda **visible dentro del APK**: no incluir claves ni credenciales (el backend actual no las necesita).
- Archivos: `.env.example` (desarrollo), `.env.production.example` (plantilla de producción), `eas.json` (perfiles).

## Entornos
| Perfil EAS | Uso | HTTP en claro | URL |
|---|---|---|---|
| `development` / `preview` | demostración en red local (APK interno) | **permitido** (`ANDROID_ALLOW_CLEARTEXT=1`) | `http://IP-del-equipo:8000` |
| `production` | distribución | **bloqueado** (solo HTTPS) | `https://…` obligatoria |
Android 9+ bloquea HTTP en claro por defecto; `app.config.js` fija `usesCleartextTraffic` con `expo-build-properties` según el perfil. Comprobado en el manifiesto resultante
(`npx expo config --type introspect`): `usesCleartextTraffic: false` (producción) / `true` (preview), permiso `android.permission.INTERNET` presente (lo agrega Expo; no se piden otros),
`android.package = com.nawinarino.app` (**identificador provisional: confirmar antes de publicar**).

## Compilar (cuando se decida)
```powershell
cd frontend
npm install
# Demostración en LAN (HTTP):
$env:EXPO_PUBLIC_API_URL="http://192.168.0.12:8000"; eas build -p android --profile preview
# Producción (HTTPS obligatorio):
$env:EXPO_PUBLIC_API_URL="https://api.tu-dominio.example"; eas build -p android --profile production
```
(`eas login` y un proyecto de EAS son necesarios; no se configuraron.) Verificación local sin compilar nativo: `npx expo export --platform android` (compila el bundle; se ejecutó sin errores).

## Backend accesible desde el móvil
1. `uvicorn app.main:app --host 0.0.0.0 --port 8000` (por defecto solo escucha en `127.0.0.1`).
2. Misma red Wi-Fi que el teléfono; IP del equipo (`ipconfig`). Medido: desde la propia máquina el backend responde por `http://192.168.0.12:8000/health` y escucha en `0.0.0.0:8000`;
   Ollama escucha solo en `127.0.0.1:11434` (no queda expuesto).
3. **Firewall de Windows** (activo en los tres perfiles): hace falta permitir el puerto 8000 de entrada en red privada, p. ej. (PowerShell **como administrador**; no se ejecutó):
   `New-NetFirewallRule -DisplayName "Nawi API 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private`
4. CORS no aplica a la app nativa; `CORS_ORIGINS` solo importa para la versión web.
5. Para producción real: servir el backend detrás de HTTPS (proxy inverso o túnel con certificado válido); Android rechaza certificados no confiables.

## Web
Sin cambios de comportamiento: `EXPO_PUBLIC_API_URL=http://localhost:8000` en `.env` (desarrollo). El build web de producción aplica las mismas guardias.

## Pendiente (requiere acción humana)
Compilar y probar el APK en un dispositivo real; confirmar el `package` definitivo; decidir hosting HTTPS del backend; crear la regla de firewall; (opcional) instalar `expo-system-ui`
(Expo avisa de que `userInterfaceStyle` lo necesita en Android; aviso previo a este trabajo); el tiempo de respuesta con generación en CPU (decenas de segundos) debe validarse en el móvil.
