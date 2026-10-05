# ÑAWI-Nariño Mobile App

Expo and React Native application for exploring language and cultural demonstration records. All current records are temporary and marked as mock data; they are not verified linguistic or cultural information.

## Requirements

- Node.js 20 or newer
- npm
- Expo Go or an Android/iOS simulator
- The backend API running locally (see [`../backend/README.md`](../backend/README.md))

## Install and run

```shell
npm install
Copy-Item .env.example .env
npm start
```

In PowerShell, open Expo Go or use the commands shown by the Expo CLI. `npm run android`, `npm run ios`, and `npm run web` are also available.

## API configuration

Set `EXPO_PUBLIC_API_URL` in `.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8000
```

The default works for a simulator running on the same computer. For a physical phone, use the computer's LAN IP address, for example `http://192.168.1.10:8000`, and ensure the backend's `CORS_ORIGINS` includes the Expo web origin if using web. Restart Expo after changing environment values.

## Included features

- Home screen and language list
- Language overview, cultural content, and sample vocabulary
- Loading, error, retry, and empty states
- Axios service layer and TanStack Query hooks
- Persistent app state with Zustand and AsyncStorage
- Expo Router navigation, NativeWind layout utilities, and Lucide icons

## Structure

`app/` contains file-based routes; `components/` contains shared UI; `hooks/` connects screens to TanStack Query; `services/` contains Axios API calls; `store/` holds persisted client state; `types/` describes API responses; and `constants/theme.ts` contains the visual tokens.

## Quality checks

```shell
npm run typecheck
npx expo install --check
npx expo-doctor
```

