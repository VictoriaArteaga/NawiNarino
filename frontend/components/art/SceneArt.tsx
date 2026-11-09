import Svg, { Path, Rect } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import { scenes, type SceneKey } from "./placeScenes";

interface SceneArtProps extends SvgProps {
  scene: SceneKey;
}

/** Flat illustration (350×190) from the approved Explorar design. */
export function SceneArt({ scene, ...props }: SceneArtProps) {
  const art = scenes[scene];

  return (
    <Svg
      viewBox="0 0 350 190"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      {...props}
    >
      <Rect width="350" height="190" fill={art.sky} />
      {art.layers.map((layer, index) => (
        <Path key={index} d={layer.d} fill={layer.c} opacity={layer.o} />
      ))}
    </Svg>
  );
}
