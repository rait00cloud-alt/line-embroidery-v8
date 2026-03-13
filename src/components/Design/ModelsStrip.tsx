// "use client";

// import React from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Environment } from "@react-three/drei";
// import dynamic from "next/dynamic";

// const ModelInstance = dynamic(() => import("@/components/ModelInstance"), { ssr: false });

// const models = [
//   { key: "snapback", label: "Snapback" },
//   { key: "panel", label: "Five Panel" },
//   { key: "trucker", label: "Trucker" },
//   { key: "hat", label: "Baseball Cap" },
// ];

// export default function ModelsStrip() {
//   return (
//     <section className="w-full bg-black text-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <h2 className="text-2xl sm:text-3xl font-[HandoBold] mb-6">Design Models</h2>
//         <div className="overflow-x-auto flex gap-6 pb-4 snap-x snap-mandatory">
//           {models.map((m) => (
//             <div key={m.key} className="snap-center min-w-[360px] w-[360px] bg-white/5 rounded-xl border border-white/10 overflow-hidden">
//               <div className="relative h-[280px]">
//                 <Canvas camera={{ position: [5, 3, 10], fov: 45 }}>
//                   <ambientLight intensity={0.7} />
//                   <directionalLight position={[5, 5, 5]} intensity={1} />
//                   <Environment preset="studio" />
//                   <OrbitControls enablePan={false} enableZoom={false} />
//                   <ModelInstance modelKey={m.key} designUrl={null} />
//                 </Canvas>
//               </div>
//               <div className="p-4">
//                 <p className="font-[HandoBold]">{m.label}</p>
//                 <p className="text-sm text-white/60 font-[HandoRegular]">Rotate to inspect details.</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }





