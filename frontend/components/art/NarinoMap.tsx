import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Pattern,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import { caucaPath, outlinePath, putumayoPath, seaPath, zones } from "./narinoMapData";
import { peopleByKey, peopleZones, smoothPath, type PeopleKey } from "./peopleZones";

/** Tonos neutros del territorio: el color solo lo ponen los pueblos. */
const NEUTRAL = ["#F1E8D2", "#EEE3C9", "#F4ECD9", "#EBDFC2", "#F2E9D6"];

interface NarinoMapProps extends SvgProps {
  /** Pueblo resaltado (muestra su marcador). */
  selected?: PeopleKey;
}

/**
 * Mapa del departamento de Nariño (390×520). El contorno es el límite departamental simplificado;
 * cada pueblo se dibuja en la zona de los municipios que citan las fuentes del corpus. El pueblo
 * Nasa vive en el Cauca, fuera del recuadro, y se indica con una flecha.
 */
export function NarinoMap({ selected, ...props }: NarinoMapProps) {
  const current = selected ? peopleByKey(selected) : undefined;
  const nasa = peopleByKey("nasa");

  return (
    <Svg
      viewBox="0 0 390 520"
      preserveAspectRatio="xMidYMin slice"
      width="100%"
      height="100%"
      accessibilityLabel="Mapa del departamento de Nariño con las zonas de los pueblos Awá, Pasto, Quillacinga, Inga y A'ingae. El pueblo Nasa vive en el Cauca, al noreste."
      {...props}
    >
      <Defs>
        <Pattern id="nm-topo" width="44" height="44" patternUnits="userSpaceOnUse">
          <Path
            d="M0 30 Q11 19 22 28 T44 24 M0 9 Q13 2 24 9 T44 5"
            stroke="#E2D7BB"
            strokeWidth="1"
            fill="none"
          />
        </Pattern>
        <Pattern id="nm-wave" width="30" height="14" patternUnits="userSpaceOnUse">
          <Path d="M0 7 Q7.5 0 15 7 T30 7" stroke="#B6D2DD" strokeWidth="1" fill="none" />
        </Pattern>
        <ClipPath id="nm-nar">
          <Path d={outlinePath} />
        </ClipPath>
        <ClipPath id="nm-any">
          <Path d={outlinePath} />
          <Path d={putumayoPath} />
        </ClipPath>
        <LinearGradient id="nm-fade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#EFE6CF" stopOpacity="1" />
          <Stop offset="1" stopColor="#EFE6CF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect width="390" height="520" fill="#EFE6CF" />
      <Rect width="390" height="520" fill="url(#nm-topo)" />
      <Path
        d={caucaPath}
        fill="#E8DEC4"
        stroke="#B9AD8D"
        strokeWidth="1.2"
        strokeDasharray="5 3"
        strokeLinejoin="round"
      />
      <Path
        d={putumayoPath}
        fill="#E4D9BC"
        stroke="#B9AD8D"
        strokeWidth="1.2"
        strokeDasharray="5 3"
        strokeLinejoin="round"
      />
      <Path d={seaPath} fill="#CFE3EA" />
      <Path d={seaPath} fill="url(#nm-wave)" />

      {/* Sombra suave (copia desplazada del contorno) */}
      <Path d={outlinePath} fill="#5A4520" opacity={0.22} transform="translate(0 6)" />
      <Path d={outlinePath} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />

      {/* Territorio base: celdas neutras */}
      <G clipPath="url(#nm-nar)">
        {zones.map((zone, index) => (
          <Polygon
            key={zone.points}
            points={zone.points}
            fill={NEUTRAL[index % NEUTRAL.length]}
            stroke="#FBF7EE"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ))}
      </G>

      {/* Zonas de cada pueblo */}
      {peopleZones.map((people) =>
        people.shapes.map((shape, index) => {
          const active = people.key === selected;
          return (
            <G key={`${people.key}-${index}`} clipPath={people.clip === "nar" ? "url(#nm-nar)" : "url(#nm-any)"}>
              <Path
                d={smoothPath(shape)}
                fill={people.color}
                fillOpacity={people.livingLanguage ? 0.92 : 0.74}
                stroke="#FFFFFF"
                strokeWidth={active ? 3.4 : 2}
                strokeDasharray={people.livingLanguage ? undefined : "5 3"}
                strokeLinejoin="round"
              />
            </G>
          );
        }),
      )}

      <Path d={outlinePath} fill="none" stroke="#2F2E28" strokeWidth="2" strokeLinejoin="round" opacity={0.7} />

      <SvgText
        x="196"
        y="264"
        fontFamily="Outfit_800ExtraBold"
        fontSize="26"
        fill="#23302A"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinejoin="round"
        textAnchor="middle"
      >
        Nariño
      </SvgText>
      <SvgText
        x="196"
        y="264"
        fontFamily="Outfit_800ExtraBold"
        fontSize="26"
        fill="#23302A"
        textAnchor="middle"
      >
        Nariño
      </SvgText>

      {/* Nombre de cada pueblo junto a su zona */}
      {peopleZones
        .filter((p) => p.shapes.length > 0)
        .map((p) => (
          <G key={`label-${p.key}`}>
            <SvgText
              x={p.pin[0]}
              y={p.pin[1] + 22}
              fontFamily="Outfit_700Bold"
              fontSize="11"
              fill="#FFFFFF"
              stroke="#2F2E28"
              strokeWidth="3"
              strokeLinejoin="round"
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
            <SvgText
              x={p.pin[0]}
              y={p.pin[1] + 22}
              fontFamily="Outfit_700Bold"
              fontSize="11"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          </G>
        ))}

      <G fontFamily="Outfit_600SemiBold" fontSize="12" fill="#6F6A58">
        <SvgText x="205" y="58">Cauca</SvgText>
        <SvgText x="120" y="432">Ecuador</SvgText>
        <SvgText x="318" y="474">Putumayo</SvgText>
      </G>
      <G fontFamily="NunitoSans_400Regular_Italic" fontSize="11" fill="#4F8499">
        <SvgText x="6" y="120">Océano</SvgText>
        <SvgText x="6" y="133">Pacífico</SvgText>
      </G>

      <Rect width="390" height="86" fill="url(#nm-fade)" />

      {/* El pueblo Nasa vive en el Cauca, fuera del recuadro: se indica con una flecha */}
      <G opacity={selected === "nasa" ? 1 : 0.92}>
        <Rect x="232" y="28" width="152" height="26" rx="13" fill={nasa.color} stroke="#FFFFFF" strokeWidth={selected === "nasa" ? 3 : 1.5} />
        <SvgText x="294" y="45.5" fontFamily="Outfit_700Bold" fontSize="11" fill="#FFFFFF" textAnchor="middle">
          Nasa Yuwe · Cauca
        </SvgText>
        <Path d="M366 41 h8 M370 37 l4 4 l-4 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </G>

      {/* Marcador del pueblo seleccionado */}
      {current && current.key !== "nasa" ? (
        <G transform={`translate(${current.pin[0] - 150} ${current.pin[1] - 337})`}>
          <Path
            d="M142 316 c0-11 16-11 16 0 c0 11-8 21-8 21 c0 0-8-10-8-21z"
            fill="#D32F2F"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <Path d="M150 312.600 a3.400 3.400 0 1 0 .1 0Z" fill="#FFFFFF" />
        </G>
      ) : null}
    </Svg>
  );
}
