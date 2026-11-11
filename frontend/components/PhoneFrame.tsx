import { createContext, useContext, type ReactNode } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const BEZEL = 10;
const BREAKPOINT = 520;

const ScreenWidthContext = createContext<number | null>(null);

/** Ancho real de la pantalla de la app (el del "celular" en la versión web). */
export function useScreenWidth(): number {
  const { width } = useWindowDimensions();
  return useContext(ScreenWidthContext) ?? width;
}

/**
 * En la versión web de escritorio muestra la app dentro de un celular
 * (390 × 844) centrado, idéntica a la versión móvil. En pantallas pequeñas
 * o en el celular real no cambia nada.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== "web" || width < BREAKPOINT) return <>{children}</>;

  const outerHeight = Math.min(PHONE_HEIGHT + BEZEL * 2, height - 24);
  const innerHeight = outerHeight - BEZEL * 2;
  // Escala el aparato si la ventana es muy baja, manteniendo las proporciones.
  const phoneHeight = Math.max(innerHeight, 560);

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#E7DFCF",
        flex: 1,
        justifyContent: "center",
        minHeight: "100%" as unknown as number,
      }}
    >
      <View
        style={{
          backgroundColor: "#111",
          borderRadius: 54,
          height: phoneHeight + BEZEL * 2,
          padding: BEZEL,
          shadowColor: "#000",
          shadowOffset: { height: 20, width: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 40,
          width: PHONE_WIDTH + BEZEL * 2,
        }}
      >
        <View
          style={
            {
              borderRadius: 44,
              flex: 1,
              overflow: "hidden",
              // Crea un contenedor para que los elementos fijos queden dentro.
              transform: "translateZ(0)",
            } as object
          }
        >
          <ScreenWidthContext.Provider value={PHONE_WIDTH}>
            <SafeAreaInsetsContext.Provider
              value={{ bottom: 20, left: 0, right: 0, top: 30 }}
            >
              {children}
            </SafeAreaInsetsContext.Provider>
          </ScreenWidthContext.Provider>
        </View>
      </View>
    </View>
  );
}
