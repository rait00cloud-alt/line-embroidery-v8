// src/lib/modelRegistry.ts
import { ReactNode } from 'react';
import { BaseballCap } from '@/components/Models/Dad-hat';
import { FivePanelHat } from '@/components/Models/Five-panel';
import { SnapbackHat } from '@/components/Models/Snapback';
import { TruckerHat } from '@/components/Models/Trucker';

export type ModelKey = 'snapback' | 'trucker' | 'hat' | 'panel';

// Map modelKey → component + design mesh name
export const MODEL_CONFIG = {
  snapback: {
    component: SnapbackHat,
    designMeshName: 'Object_0005_1', 
  },
  trucker: {
    component: TruckerHat,
    designMeshName: 'Object_3',
  },
  hat: {
    component: BaseballCap,
    designMeshName: 'Pattern2D_19137006_10', 
  },
  panel: {
    component: FivePanelHat,
    designMeshName: 'poly004_poly_0003_0_2', 
  },
} satisfies Record<ModelKey, { component: React.ComponentType<any>; designMeshName: string }>;