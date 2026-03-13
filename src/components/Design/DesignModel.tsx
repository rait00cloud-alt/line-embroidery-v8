// "use client";

// import React, { useMemo } from "react";
// import ModelInstance from "./ModelInstance"; 
// import {DecalData}  from "./ModelInstance";

// type DesignModelProps = {
//   modelKey: string;
//   color?: string;
//   decals?: DecalData[];
//   position?: [number, number, number];
//   rotation?: [number, number, number];
//   scale?: number;
// };

// export default function DesignModel({
//   modelKey,
//   color,
//   decals = [],
//   position = [0, 0, 0],
//   rotation = [0, 0, 0],
//   scale = 1,
// }: DesignModelProps) {
//   const normalizedDecals = useMemo(() => decals, [decals]);

//   return (
//     <ModelInstance
//       modelKey={modelKey}
//       color={color}
//       decals={normalizedDecals}
//       position={position}
//       rotation={rotation}
//       scale={scale}
//     />
//   );
// }
