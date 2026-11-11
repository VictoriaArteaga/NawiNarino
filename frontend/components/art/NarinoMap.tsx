import { Platform } from "react-native";
import Svg, {
  ClipPath,
  Circle,
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

import { caucaPath, outlinePath, putumayoPath, seaPath } from "./narinoMapData";
import { cellColor, mapCells, peopleByKey, type PeopleKey } from "./peopleZones";

/** En el celular las formas SVG reciben `onPress`; en el navegador (react-native-svg web) el evento es `onClick`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tap = (handler: () => void): any => (Platform.OS === "web" ? { onClick: handler } : { onPress: handler });

interface NarinoMapProps extends SvgProps {
  /** Pueblo resaltado (muestra su marcador y remarca sus celdas). */
  selected?: PeopleKey;
  /** Se llama al tocar una celda de un pueblo (o la etiqueta del Nasa). */
  onSelect?: (key: PeopleKey) => void;
}

/**
 * Mapa del departamento de Nariño (390×520) como un mosaico de celdas. Cada celda toma el color del pueblo que
 * vive en esa zona según las fuentes del corpus; el resto del territorio se deja en tonos de arena. El pueblo
 * Nasa vive en el Cauca, fuera del recuadro, y se indica con una etiqueta.
 */
export function NarinoMap({ selected, onSelect, ...props }: NarinoMapProps) {
  const current = selected ? peopleByKey(selected) : undefined;
  const nasa = peopleByKey("nasa");
  const cells = mapCells.map((cell, index) => ({ cell, index, fill: cellColor(cell, index) }));

  return (
    <Svg
      viewBox="0 0 390 520"
      preserveAspectRatio="xMidYMin slice"
      width="100%"
      height="100%"
      accessibilityLabel="Mapa del departamento de Nariño en celdas de color: Awá, Pasto, Quillacinga, Inga y A'ingae. El pueblo Nasa vive en el Cauca, al noreste."
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
        <ClipPath id="nm-put">
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

      {/* Celdas de pueblos que viven en Putumayo (Inga del Sibundoy, A'ingae) */}
      <G clipPath="url(#nm-put)">
        {cells
          .filter(({ cell }) => cell.k)
          .map(({ cell, index, fill }) => (
            <Polygon
              key={`p${index}`}
              points={cell.p}
              fill={fill}
              stroke="#FBF7EE"
              strokeWidth="1.8"
              strokeLinejoin="round"
              {...tap(() => cell.k && onSelect?.(cell.k))}
            />
          ))}
      </G>

      <Path d={seaPath} fill="#CFE3EA" />
      <Path d={seaPath} fill="url(#nm-wave)" />

      {/* Sombra suave (copia desplazada del contorno) */}
      <Path d={outlinePath} fill="#5A4520" opacity={0.28} transform="translate(0 6)" />
      <Path d={outlinePath} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />

      {/* Mosaico de Nariño */}
      <G clipPath="url(#nm-nar)">
        {cells
          .filter(({ cell }) => cell.g === "nar")
          .map(({ cell, index, fill }) => (
            <Polygon
              key={`n${index}`}
              points={cell.p}
              fill={fill}
              stroke="#FBF7EE"
              strokeWidth="1.8"
              strokeLinejoin="round"
              {...tap(() => cell.k && onSelect?.(cell.k))}
            />
          ))}
        {cells
          .filter(({ cell }) => cell.g === "nar")
          .map(({ cell, index }) => (
            <Circle key={`d${index}`} cx={cell.cx} cy={cell.cy} r="1.8" fill="#FFFFFF" opacity={0.8} pointerEvents="none" />
          ))}
      </G>

      {/* Remarca las celdas del pueblo elegido */}
      {selected ? (
        <>
          <G clipPath="url(#nm-nar)" pointerEvents="none">
            {cells
              .filter(({ cell }) => cell.k === selected && cell.g === "nar")
              .map(({ cell, index }) => (
                <Polygon key={`sn${index}`} points={cell.p} fill="none" stroke="#FFFFFF" strokeWidth="3.6" strokeLinejoin="round" />
              ))}
          </G>
          <G clipPath="url(#nm-put)" pointerEvents="none">
            {cells
              .filter(({ cell }) => cell.k === selected)
              .map(({ cell, index }) => (
                <Polygon key={`sp${index}`} points={cell.p} fill="none" stroke="#FFFFFF" strokeWidth="3.6" strokeLinejoin="round" />
              ))}
          </G>
        </>
      ) : null}

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
        pointerEvents="none"
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
        pointerEvents="none"
      >
        Nariño
      </SvgText>

      <G fontFamily="Outfit_600SemiBold" fontSize="12" fill="#6F6A58" pointerEvents="none">
        <SvgText x="44" y="338">Ecuador</SvgText>
        <SvgText x="318" y="474">Putumayo</SvgText>
      </G>
      <G fontFamily="NunitoSans_400Regular_Italic" fontSize="11" fill="#4F8499" pointerEvents="none">
        <SvgText x="6" y="120">Océano</SvgText>
        <SvgText x="6" y="133">Pacífico</SvgText>
      </G>

      <Rect width="390" height="86" fill="url(#nm-fade)" pointerEvents="none" />

      {/* El pueblo Nasa vive en el Cauca, fuera del recuadro: etiqueta con flecha (debajo del título) */}
      <G {...tap(() => onSelect?.("nasa"))}>
        <Rect x="232" y="88" width="152" height="26" rx="13" fill={nasa.color} stroke="#FFFFFF" strokeWidth={selected === "nasa" ? 3 : 1.5} />
        <SvgText x="294" y="105.5" fontFamily="Outfit_700Bold" fontSize="11" fill="#FFFFFF" textAnchor="middle" pointerEvents="none">
          Nasa Yuwe · Cauca
        </SvgText>
        <Path d="M366 101 h8 M370 97 l4 4 l-4 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" pointerEvents="none" />
      </G>

      {/* Marcador del pueblo seleccionado */}
      {current && current.key !== "nasa" ? (
        <G transform={`translate(${current.pin[0] - 150} ${current.pin[1] - 337})`} pointerEvents="none">
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
