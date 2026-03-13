// constants/designConstants.ts
import type { DesignRegion } from "@/app/[locale]/products/[slug]/design/page.tsx";

export const MODEL_HOME_POSITIONS = {
  panel: {
    front: { position: [0, 0.6, 1.2], rotation: [0, 0, 0], scale: [0.9, 0.9,0.9] },
    left: { position: [-1, 0.2, -0.2], rotation: [0, -Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    right: { position: [1, 0.2, -0.2], rotation: [0, Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    back: { position: [0, 0.85, -1.5], rotation: [0, Math.PI, 0], scale: [0.5, 0.5, 0.5] },
  
  },
  snapback: {
    front: { position: [-0.10, 1, 1.2], rotation: [0, 0, 0], scale: [0.85, 0.85, 0.85] },
    left: { position: [-1.84, 0.15, -0.6], rotation: [0, -Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    right: { position: [1.7, 0.15, -0.6], rotation: [0, Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    back: { position: [-0.10, 0.8, -1.9], rotation: [0, Math.PI, 0], scale: [0.6, 0.6,0.6] },
  
  },
  hat: {
    front: { position: [-0.18, 0.8, 1.6], rotation: [0, 0, 0], scale:[0.8,1.5,1]},
    left: { position: [-1.35, -0.25, 0], rotation: [0, -Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    right: { position: [1.35, -0.25, 0], rotation: [0, Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    back: { position: [-0.23, 0.3, -1.5], rotation: [0, Math.PI, 0], scale: [0.5, 0.5, 0.5] },
    
  },

  trucker: {
    front: { position: [-0.2, 0.8, 1.2], rotation: [0, 0, 0], scale: [1,1,1] },
    left: { position: [-1.5, 0, -0.9], rotation: [0, -Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    right: { position: [0.92, 0, -0.75], rotation: [0, Math.PI / 2, 0], scale:[0.5,0.5,0.5]},
    back: { position: [-0.2, 0.7, -2.5], rotation: [0, Math.PI, 0], scale: [0.6,0.6,0.6] },
   
  },

};


export const DESIGN_REGIONS: Record<string, DesignRegion[]> = {
  snapback: [
    { id: "front", name: "Front", position: [0, 0.2, 0.15], rotation: [0, 0, 0] },
    { id: "left", name: "Left", position: [-0.15, 0.2, 0], rotation: [0, Math.PI / 2, 0] },
    { id: "right", name: "Right", position: [0.15, 0.2, 0], rotation: [0, -Math.PI / 2, 0] },
    { id: "back", name: "Back", position: [0, 0.2, -0.15], rotation: [0, Math.PI, 0] },
    
  ],
  hat: [
    { id: "front", name: "Front", position:[0, 0, -0.8], rotation: [0, 1, 0] },
    { id: "left", name: "Left", position: [-0.12, 0.15, 0], rotation: [0, Math.PI / 2, 0] },
    { id: "right", name: "Right", position: [0.12, 0.15, 0], rotation: [0, -Math.PI / 2, 0] },
    { id: "back", name: "Back", position: [0, 0.15, -0.12], rotation: [0, Math.PI, 0] },
    
  ],
  trucker: [
    { id: "front", name: "Front", position: [0, 0.18, 0.14], rotation: [0, 0, 0] },
    { id: "left", name: "Left", position: [-0.14, 0.18, 0], rotation: [0, Math.PI / 2, 0] },
    { id: "right", name: "Right", position: [0.14, 0.18, 0], rotation: [0, -Math.PI / 2, 0] },
    { id: "back", name: "Back", position: [0, 0.18, -0.14], rotation: [0, Math.PI, 0] },

  ],
  panel: [
    { id: "front", name: "Front", position: [0, 0.2, 0.15], rotation: [0, 0, 0] },
    { id: "left", name: "Left", position: [-0.15, 0.2, 0], rotation: [0, Math.PI / 2, 0] },
    { id: "right", name: "Right", position: [0.15, 0.2, 0], rotation: [0, -Math.PI / 2, 0] },
    { id: "back", name: "Back", position: [0, 0.2, -0.15], rotation: [0, Math.PI, 0] },
   
  ],
};

export const TEXTURE_OPTIONS: Record<string, { id: string; name: string; url: string | null }[]> = {
  hat: [
    { id: "blk", name: "Black", url: "/textures/dye/blk.jpg" },
    { id: "blu", name: "Blue", url: "/textures/dye/blu.jpg" },
    { id: "drn", name: "Dark Green", url: "/textures/dye/drn.jpg" },
    { id: "htp", name: "Heather Pink", url: "/textures/dye/htp.jpg" },
    { id: "kha", name: "Khaki", url: "/textures/dye/kha.jpg" },
    { id: "mgo", name: "Mango", url: "/textures/dye/mgo.jpg" },
    { id: "navy", name: "Navy", url: "/textures/dye/navy.jpg" },
    { id: "purple", name: "Purple", url: "/textures/dye/purple.jpg" },
    { id: "red", name: "Red", url: "/textures/dye/red.jpg" },
    { id: "ryl", name: "Royal Blue", url: "/textures/dye/ryl.jpg" },
    { id: "wine", name: "Wine", url: "/textures/dye/wine.jpg" }
  ],
   panel_laser: [
    { id: 'blk', name: 'Black Camo', url: '/textures/camo/blk.jpg' },
    { id: 'blue', name: 'Blue Camo', url: '/textures/camo/blue.png' },
    { id: 'brn', name: 'Brown Camo', url: '/textures/camo/brn.jpg' },
    { id: 'crm', name: 'Cream Camo', url: '/textures/camo/crm.jpg' },
    { id: 'dgy', name: 'Dark Gray Camo', url: '/textures/camo/dgy.jpg' },
    { id: 'lgy', name: 'Light Gray Camo', url: '/textures/camo/lgy.jpg' },
    { id: 'nvy', name: 'Navy Camo', url: '/textures/camo/nvy.jpg' },
    { id: 'olv', name: 'Olive Camo', url: '/textures/camo/olv.jpg' },
    { id: 'red', name: 'Red Camo', url: '/textures/camo/red.jpg' },
    { id: 'wht', name: 'White Camo', url: '/textures/camo/wht.jpg' },
  ],
 
  'panel-dye': [
  { id: 'blu', name: 'Blue Tye-Dye', url: '/textures/tye-die/blu.png' },
  { id: 'brn', name: 'Brown Tye-Dye', url: '/textures/tye-die/brn.jpg' },
  { id: 'grn', name: 'Green Tye-Die', url: '/textures/tye-die/grn.jpg' },
  { id: 'kha', name: 'Khaki Tye-Die', url: '/textures/tye-die/kha.jpg' },
  { id: 'nvy', name: 'Navy Tye-Die', url: '/textures/tye-die/nvy.jpg' },
  { id: 'sky', name: 'Sky Blue Tye-Die', url: '/textures/tye-die/sky.jpg' },
],
};

// components/constants/modelConstraints.ts

export interface ModelConstraint {
  radius: number;
  minY: number;
  maxY: number;
  positionConstraints?: {
    front?: { minRadius?: number; maxRadius?: number };
    left?: { minRadius?: number; maxRadius?: number };
    right?: { minRadius?: number; maxRadius?: number };
    back?: { minRadius?: number; maxRadius?: number };
    top?: { minRadius?: number; maxRadius?: number };
    bottom?: { minRadius?: number; maxRadius?: number };
  };
  
}

// Define base constraints
const FIVE_PANEL_CONSTRAINT: ModelConstraint = {
  radius: 1,
  minY: 0,
  maxY: 3,
  positionConstraints: {
    front: { minRadius: 0.8, maxRadius: 1.5 },
    left: { minRadius: 0.6, maxRadius: 1.2 },
    right: { minRadius: 0.6, maxRadius: 1.2 },
    back: { minRadius: 0.8, maxRadius: 1.5 },

  },
};

const BASEBALL_CAP_CONSTRAINT: ModelConstraint = {
  radius: 3,
  minY: -2,
  maxY: 4,
  positionConstraints: {
    front: { minRadius: 0, maxRadius: 2 },
    left: { minRadius: 0.8, maxRadius: 1.4 },
    right: { minRadius: 0.8, maxRadius: 1.4 },
    back: { minRadius: 1.0, maxRadius: 1.8 },
    top: { minRadius: 0.5, maxRadius: 1.2 },
    bottom: { minRadius: 0.4, maxRadius: 1.0 },
  },
};

const TRUCKER_CONSTRAINT: ModelConstraint = {
  radius: 2,
  minY: -3.0,
  maxY: 3.0,
  positionConstraints: {
    front: { minRadius: 0, maxRadius: 2},
    left: { minRadius: 1.1, maxRadius: 1.3 },
    right: { minRadius: 1.1, maxRadius: 1.3 },
    back: { minRadius: 1.2, maxRadius: 1.4 },
    top: { minRadius: 0.8, maxRadius: 1.1 },
    bottom: { minRadius: 0.7, maxRadius: 0.9 },
  },
};

const SNAPBACK_CONSTRAINT: ModelConstraint = {
  radius: 2.2,
  minY: -0.5,
  maxY: 2.5,
  positionConstraints: {
    front: { minRadius: 0, maxRadius: 2.1 },
    left: { minRadius: 0, maxRadius: 1.9 },
    right: { minRadius: 0, maxRadius: 1.9 },
    back: { minRadius: 0, maxRadius: 2.0 },

  },
};

// Helper function to get position-specific radius constraints
export const getPositionRadiusConstraints = (
  modelKey: string, 
  position: 'front' | 'left' | 'right' | 'back' 
): { minRadius: number; maxRadius: number } => {
  const constraint = MODEL_CONSTRAINTS[modelKey];
  if (!constraint) {
    return { minRadius: 0, maxRadius: constraint?.radius || 2 };
  }
  
  const positionConstraint = constraint.positionConstraints?.[position];
  
  return {
    minRadius: positionConstraint?.minRadius ?? 0,
    maxRadius: positionConstraint?.maxRadius ?? constraint.radius,
  };
};

export const MODEL_CONSTRAINTS: Record<string, ModelConstraint> = {
  // Five-panel family — all use the same constraint
  panel: FIVE_PANEL_CONSTRAINT,
  fivePanelWeave: FIVE_PANEL_CONSTRAINT,
  panel_laser: FIVE_PANEL_CONSTRAINT,
  panel_corduroy: FIVE_PANEL_CONSTRAINT,
  panel_leather_brim: FIVE_PANEL_CONSTRAINT,
  panel_brim: FIVE_PANEL_CONSTRAINT,
  'panel-underbrim': FIVE_PANEL_CONSTRAINT,
  'panel-dye': FIVE_PANEL_CONSTRAINT,

  // Others
  hat: BASEBALL_CAP_CONSTRAINT,      
  trucker: TRUCKER_CONSTRAINT,
  snapback: SNAPBACK_CONSTRAINT,
};