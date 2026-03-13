  // components/Design/DesignPage.tsx
  "use client";
  import React, { useState, useMemo, useEffect, useRef } from "react";
  import * as THREE from "three";
  import { useCart } from "@/contexts/CartContext";
  import { useTranslations } from "next-intl";
  import { PRODUCTS } from "@/data/products";
  import type { DecalData } from "@/components/Models/Dad-hat.tsx";
  import { MODEL_HOME_POSITIONS, DESIGN_REGIONS } from "@/components/constants/designConstatns";
  import { createTextTexture} from "@/components/lib/designUtils";
  import { DesignSidebar } from "@/components/DesignPage/DesignSidebar";
  import { DesignAccordions } from "@/components/DesignPage/DesignAccordions";
  import { DesignCanvas } from "@/components/DesignPage/DesignCanvas";
  import { DesignToolsModal } from "@/components/DesignPage/DesignToolsModal";
  import { LayersModal } from "@/components/DesignPage/LayersModal";
  import { useParams, useSearchParams } from 'next/navigation';
  import { Image as ImageIcon, SplinePointer, Layers, Undo, Move3D, Check } from "lucide-react";
  import { motion } from "framer-motion";
  import { MODEL_CONSTRAINTS, getPositionRadiusConstraints } from "@/components/constants/designConstatns";
  import { lockScroll, unlockScroll } from "@/utils/scrollLock";
  import { supabase } from "@/components/lib/supabase";
import FloatingLogoAI from "@/ui/FloatingLogoAI";

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const captureCanvasImage = (canvas: HTMLCanvasElement): string => {
    return canvas.toDataURL('image/png');
  };

  interface CachedDesign {
    id: string;
    productId: string;
    assetsByPosition: Record<Position, Asset[]>
    selectedColor: { h: number; s: number; l: number };
    selectedTexture?: string | null;
    createdAt: number;
    price: number; // $45 per design
  }

  type Position = "front" | "left" | "right" | "back";
  type DesignTool = "text" | "upload" | "assets";

  interface Asset {
    type: "text" | "upload" | "public";
    value: string | File;
    properties: {
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
        scale: { x: number; y: number };
      opacity: number;
    };
    _url?: string;
  }

  export interface DesignRegion {
    id: string;
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
  }

  interface DesignPageProps {
    product: typeof PRODUCTS[number];
  }

  export const dynamic = "force-dynamic";

  function DesignPageContent({ product }: DesignPageProps) {
    const t = useTranslations("DesignPage");
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const initialSize = searchParams.get("size") || product.sizes[0];
    const initialColor = searchParams.get("color") || product.colors[0];
    const initialPrice = parseFloat(searchParams.get("price") || product.price.toString());

    const getInitialColorHsl = () => {
      const { getColorHex } = require('@/utils/colorMapping');
      const firstColorName = product.colors[0];
      const hex = getColorHex(firstColorName);
      return hexToHsl(hex);
    };

    const [showLayers, setShowLayers] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const [activeTool, setActiveTool] = useState<DesignTool>("upload");
    type AllowedPosition = "left" | "right" | "front" | "back";
  const [activePosition, setActivePosition] = useState<AllowedPosition>("front");


  // Função utilitária
  const mapPositionForComponent = (pos: AllowedPosition): "left" | "right" | "front" => {
    if (pos === "back") return "front";
    return pos;
  };


    const [sceneRotation, setSceneRotation] = useState<[number, number, number]>([0, 0, 0]);
    const [isScrollLocked, setIsScrollLocked] = useState(false);
    
    // Refs for canvas capture
    const canvasRef = useRef<DesignCanvasHandle>(null);
    const [userText, setUserText] = useState("");
  const [userAssetBlob, setUserAssetBlob] = useState<Blob | null>(null);
  const [userAsset, setUserAsset] = useState<string | null>(null);
  const userAssetBlobRef = useRef<string | null>(null); // ✅ Para gerenciar cleanup
    const [publicAsset, setPublicAsset] = useState("/patches/patch-01.png");
    const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
      const [selectedColor, setSelectedColor] = useState<{ h: number; s: number; l: number }>(getInitialColorHsl());
    const [assetsByPosition, setAssetsByPosition] = useState<Record<Position, Asset[]>>({
      front: [], left: [], right: [], back: []
    });
    
  const [selectedRegion, setSelectedRegion] = useState<Position>("front");
    const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
    const [selectedRegionPosition, setSelectedRegionPosition] = useState(() => {
    const config = MODEL_HOME_POSITIONS[product.modelKey] || MODEL_HOME_POSITIONS.panel;
    const frontConfig = config.front;
    return {
      position: { x: frontConfig.position[0], y: frontConfig.position[1], z: frontConfig.position[2] },
      rotation: { x: frontConfig.rotation[0], y: frontConfig.rotation[1], z: frontConfig.rotation[2] },
      scale: frontConfig.scale[0],
      opacity: 1,
    };
  });

    const [isPositionOpen, setIsPositionOpen] = useState(false);
    const [isColorOpen, setIsColorOpen] = useState(true);
    const [isTextureOpen, setIsTextureOpen] = useState(false);
    const [textAssetUrl, setTextAssetUrl] = useState<string | null>(null);
    
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    // Constants
    
  const regions = DESIGN_REGIONS[product.modelKey];
  const selectedColorCss = `hsl(${selectedColor.h}, ${selectedColor.s}%, ${selectedColor.l}%)`;

  // Get model-specific constraints
  const modelConstraint = MODEL_CONSTRAINTS[product.modelKey] || MODEL_CONSTRAINTS['panel'];
  const MIN_Y = modelConstraint.minY;
  const MAX_Y = modelConstraint.maxY;

  // Get position-specific radius constraints
  const getActivePositionRadiusConstraints = () => {
    return getPositionRadiusConstraints(product.modelKey, activePosition);
  };

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);


  const downloadRef = useRef<HTMLDivElement>(null);
  //product picture
  const selectedPhotos = product.photos?.[0] || [];
  const mainPhoto = selectedPhotos.length > 0 ? selectedPhotos[0] : product.designUrl;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    if (isDownloadOpen) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [isDownloadOpen]);

    // Effect
    useEffect(() => {
      if (activeTool === "text" && userText.trim()) {
        createTextTexture(userText.trim()).then(setTextAssetUrl);
      } else {
        setTextAssetUrl(null);
      }
    }, [userText, activeTool]);

  const uploadDesignToSupabase = async (
    designId: string,
    userId: string,
    assets: Asset[],
    preview3D: string | null, // base64 dataURL
    dstFile?: Blob
  ) => {
    const uploadedAssets: string[] = [];

    // Upload logos
    for (const asset of assets) {
      if (asset.type === "upload" && asset._url) {
        const blob = await (await fetch(asset._url)).blob();
        const fileExt = blob.type.split("/")[1] || "png";
        const fileName = `${userId}/${designId}/logos/${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage
          .from("user-designs")
          .upload(fileName, blob);
        if (!error) {
          const publicUrl = supabase.storage.from("user-designs").getPublicUrl(fileName).data.publicUrl;
          uploadedAssets.push(publicUrl);
        }
      }
    }

    // Upload 3D preview
    let previewUrl = "";
    if (preview3D) {
      const byteString = atob(preview3D.split(",")[1]);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) arrayBuffer[i] = byteString.charCodeAt(i);
      const blob = new Blob([arrayBuffer], { type: "image/png" });
      const fileName = `${userId}/${designId}/preview.png`;
      const { error } = await supabase.storage.from("user-designs").upload(fileName, blob, { upsert: true });
      if (!error) {
        previewUrl = supabase.storage.from("user-designs").getPublicUrl(fileName).data.publicUrl;
      }
    }

    // Upload DST file
    let dstUrl = "";
    if (dstFile) {
      const fileName = `${userId}/${designId}/design.dst`;
      const { error } = await supabase.storage.from("user-designs").upload(fileName, dstFile);
      if (!error) {
        dstUrl = supabase.storage.from("user-designs").getPublicUrl(fileName).data.publicUrl;
      }
    }

    return { uploadedAssets, previewUrl, dstUrl };
  };

  const saveDesignRecord = async (
    userId: string,
    productId: string,
    designId: string,
    uploadedAssets: string[],
    previewUrl: string,
    dstUrl: string,
    customColors: string[]
  ) => {
    const { error } = await supabase
      .from("user_designs")
      .insert([{
        user_id: userId,
        product_id: productId,
        design_id: designId,
        uploaded_assets: uploadedAssets,
        preview_3d_url: previewUrl,
        dst_file: dstUrl,
        custom_colors: customColors,
      }]);
    
    if (error) console.error("Error saving design record:", error);
  };



    
  useEffect(() => {
    // Only update selectedRegionPosition when no asset is selected
    if (selectedAssetIndex !== null) return;
    
    const modelConfig = MODEL_HOME_POSITIONS[product.modelKey] || MODEL_HOME_POSITIONS.panel;
    const config = modelConfig[selectedRegion];

    if (!config) return;

    setSelectedRegionPosition({
      position: { x: config.position[0], y: config.position[1], z: config.position[2] },
      rotation: { x: config.rotation[0], y: config.rotation[1], z: config.rotation[2] },
      scale: config.scale[0],
      opacity: 1,
    });
  }, [selectedRegion, product.modelKey, selectedAssetIndex]);

    //is Panning

    useEffect(() => {
    if (isPanning) {
      const handleGlobalEnd = () => {
        if (isPanning) {
          setIsPanning(false);
          unlockScroll();
        }
      };
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchend', handleGlobalEnd);
      return () => {
        window.removeEventListener('mouseup', handleGlobalEnd);
        window.removeEventListener('touchend', handleGlobalEnd);
      };
    }
  }, [isPanning]);

    // Derived
  const currentAsset = useMemo(() => {
    if (activeTool === "text" && textAssetUrl) return { type: "public", value: textAssetUrl };
    if (activeTool === "upload" && userAssetBlob) return { type: "upload", value: userAssetBlob }; // ✅ Usa o Blob, não a URL
    if (activeTool === "assets") return { type: "public", value: publicAsset };
    return null;
  }, [userText, textAssetUrl, userAssetBlob, publicAsset, activeTool]); // ✅ Dependência mudou

    const finalPrice = useMemo(() => {
      const allAssets = Object.values(assetsByPosition).flat();
      return initialPrice + allAssets.length * 5;
    }, [initialPrice, assetsByPosition]);

const decalProps: DecalData[] = Object.entries(assetsByPosition)
  .flatMap(([position, assets]) => 
    assets.map((asset, i) => ({
      id: `decal-${position}-${i}`,
      position: [asset.properties.position.x, asset.properties.position.y, asset.properties.position.z],
      rotation: [asset.properties.rotation.x, asset.properties.rotation.y, asset.properties.rotation.z],
      // ✅ FIX: Usar scale como array consistente
      scale: [
        asset.properties.scale.x ?? 0.5, 
        asset.properties.scale.y ?? 0.5, 
        1
      ] as [number, number, number],
      map: asset._url || (asset.value as string),
      opacity: asset.properties.opacity,
      placement: position as 'front' | 'back' | 'left' | 'right',
    }))
  )
      const hslToHex = (h: number, s: number, l: number) => {
      s /= 100;
      l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      const toHex = (x: number) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0");
      return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
    };
    const selectedColorHex = useMemo(
      () => hslToHex(selectedColor.h, selectedColor.s, selectedColor.l),
      [selectedColor]
    );

    // Handlers
  const handleModelRotate = (position: Position) => {
    setActivePosition(position);
    setSelectedRegion(position); // Track which region/view we're looking at
    
    const frontRotation: [number, number, number] = [0, 0, 0];
    const rotationMap: Record<Position, [number, number, number]> = {
      front: frontRotation,
      left: [0, Math.PI / 2, 0],
      right: [0, -Math.PI / 2, 0],
      back: [0, Math.PI, 0],
    };

    if (product.modelKey === 'five-panelbrim') {
      rotationMap.front = [0, Math.PI, 0];
    }

    setSceneRotation(rotationMap[position]);
  };


    const [loading, setLoading] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Helper: count distinct (quantized) colors in an image file/blob.
    const countDistinctColors = async (blob: Blob, maxColors = 5): Promise<number> => {
      try {
        const imgBitmap = await createImageBitmap(blob);
        // Downscale for performance
        const w = 64;
        const h = Math.max(1, Math.round((imgBitmap.height / imgBitmap.width) * w));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return maxColors;
        ctx.drawImage(imgBitmap, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const seen = new Set<string>();
        
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 10) continue;
          const r = data[i] >> 4;
          const g = data[i + 1] >> 4;
          const b = data[i + 2] >> 4;
          seen.add(`${r}_${g}_${b}`);
          if (seen.size >= maxColors) {
            imgBitmap.close?.();
            return seen.size;
          }
        }
        imgBitmap.close?.();
        return seen.size;
      } catch (err) {
        console.error("countDistinctColors error", err);
        return maxColors;
      }
    };
  const handleUpload = async (blob: Blob) => {
    // Convert to base64 for localStorage
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUserAsset(base64); // store base64 instead of blob URL
    };
    reader.readAsDataURL(blob);

    // Keep blob for rendering
    setUserAssetBlob(blob);
  };

  const handleStretchDecal = (axis: "x" | "y", value: number) => {
  setAssetsByPosition(prev => {
    const updated = [...prev[activePosition]];
    if (selectedAssetIndex === null) return prev;

    const asset = { ...updated[selectedAssetIndex] };
    const min = 0.2;
    const max = 3;

    // ✅ Atualizar scale mantendo tipo correto
    const newScale = {
      x: asset.properties.scale.x,
      y: asset.properties.scale.y,
    };

    newScale[axis] = Math.max(min, Math.min(max, value));

    // ✅ Armazenar corretamente
    asset.properties.scale = newScale;

    updated[selectedAssetIndex] = asset;
    return { ...prev, [activePosition]: updated };
  });
};


useEffect(() => {
  let stored: string | null = null;

  try {
    stored = localStorage.getItem("cachedDesigns");
  } catch (err) {
    console.warn("localStorage not available", err);
    return;
  }

  if (!stored) return;

  try {
    const designs: CachedDesign[] = JSON.parse(stored);
    const lastDesign = designs.find(d => d.productId === product.id);
    if (!lastDesign) return;

    const restoredAssets = Object.entries(lastDesign.assetsByPosition).reduce(
      (acc, [pos, assets]) => {
        acc[pos as Position] = assets.map(asset => {
          // ✅ upload salvo como base64
          if (
            asset.type === "upload" &&
            typeof asset.value === "string" &&
            asset.value.startsWith("data:image")
          ) {
            const blob = dataURLtoBlob(asset.value);
            const url = URL.createObjectURL(blob);

            return {
              ...asset,
              value: "",        // não usar value pra render
              _url: url,        // SOMENTE a URL
            };
          }

          // ✅ assets públicos
          if (typeof asset.value === "string") {
            return { ...asset, _url: asset.value };
          }

          // fallback defensivo
          return { ...asset, _url: "" };
        });

        return acc;
      },
      {} as Record<Position, Asset[]>
    );

    setAssetsByPosition(restoredAssets);
    setSelectedColor(lastDesign.selectedColor);
  } catch (e) {
    console.error("Failed to restore design", e);
  }
}, [product.id]);


  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPanning(true);
    lockScroll(); 
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanStart({ x: clientX, y: clientY });
  };

  const handlePanMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning || selectedAssetIndex === null) return;
    e.preventDefault();
    e.stopPropagation(); 

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - panStart.x;
    const deltaY = clientY - panStart.y;

    setAssetsByPosition((prev) => {
      const updated = [...prev[activePosition]];
      if (selectedAssetIndex === null || selectedAssetIndex >= updated.length) return prev;

      const asset = { ...updated[selectedAssetIndex] };
      const currentX = asset.properties.position.x;
      const currentY = asset.properties.position.y;

      const xDelta = deltaX * 0.01;
      const yDelta = -deltaY * 0.01;

      let newX = currentX + xDelta;
      let newY = Math.max(MIN_Y, Math.min(MAX_Y, currentY + yDelta));

      const radiusConstraints = getActivePositionRadiusConstraints();
      const currentRadius = Math.sqrt(newX * newX + newY * newY);
      
      let constrainedRadius = Math.max(radiusConstraints.minRadius, Math.min(radiusConstraints.maxRadius, currentRadius));
      
      const rSquared = newX * newX + newY * newY;
      let newZ = 0;
      
      if (rSquared < constrainedRadius * constrainedRadius) {
        newZ = Math.sqrt(constrainedRadius * constrainedRadius - rSquared);
      } else {
        const scale = constrainedRadius / Math.sqrt(rSquared);
        newX *= scale;
        newY *= scale;
        newZ = 0;
      }

      const normal = new THREE.Vector3(newX, newY, newZ).normalize();

      const dummy = new THREE.Object3D();
      dummy.position.set(newX, newY, newZ);

      
  dummy.up.set(0, 1, 0); // define o vetor up
  dummy.lookAt(dummy.position.clone().add(normal));


      const rotation = new THREE.Euler().setFromQuaternion(dummy.quaternion, 'YXZ');

      asset.properties.position = { x: newX, y: newY, z: newZ };
      asset.properties.rotation = {
        x: rotation.x,
        y: rotation.y,
        z: 0, 
      };

      updated[selectedAssetIndex] = asset;
      return { ...prev, [activePosition]: updated };
    });

    setPanStart({ x: clientX, y: clientY });
  };

    const handlePanEnd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsPanning(false);
    unlockScroll(); 
  };

    const handleSelectLayer = (position: Position, index: number) => {
      setActivePosition(position);
      setSelectedAssetIndex(index);
      const rotationMap: Record<Position, [number, number, number]> = {
        front: [0, 0, 0],
        left: [0, Math.PI / 2, 0],
        right: [0, -Math.PI / 2, 0],
        back: [0, Math.PI, 0],
    
      };
      setSceneRotation(rotationMap[position]);
    };

  const handleDeleteLayer = (position: Position, indexToDelete: number) => {
    setAssetsByPosition(prev => {
      const updatedPositionAssets = [...prev[position]];
      const assetToDelete = updatedPositionAssets[indexToDelete];
      
      // ✅ Cleanup da URL do blob
      if (assetToDelete._url && assetToDelete._url.startsWith('blob:')) {
        URL.revokeObjectURL(assetToDelete._url);
      }

      updatedPositionAssets.splice(indexToDelete, 1);
      
      let newSelectedIndex: number | null = selectedAssetIndex;
      if (position === activePosition) {
        if (indexToDelete === selectedAssetIndex) newSelectedIndex = null;
        else if (indexToDelete < selectedAssetIndex) newSelectedIndex = selectedAssetIndex - 1;
      }
      
      if (newSelectedIndex !== selectedAssetIndex) setSelectedAssetIndex(newSelectedIndex);
      return { ...prev, [position]: updatedPositionAssets };
    });
  };

  useEffect(() => {
  return () => {
    Object.values(assetsByPosition).flat().forEach(asset => {
      if (asset._url?.startsWith('blob:')) URL.revokeObjectURL(asset._url);
    });
  };
}, [assetsByPosition]);

    // Get position based on active view for decal placement using MODEL_HOME_POSITIONS
    const getDecalPositionForView = (view: Position) => {
      const modelConfig = MODEL_HOME_POSITIONS[product.modelKey] || MODEL_HOME_POSITIONS.panel;
      const viewConfig = modelConfig[view];
      
      if (viewConfig) {
        return {
          position: { x: viewConfig.position[0], y: viewConfig.position[1], z: viewConfig.position[2] },
          rotation: { x: viewConfig.rotation[0], y: viewConfig.rotation[1], z: viewConfig.rotation[2] },
          scale: viewConfig.scale[0],
          opacity: 1,
        };
      }
      
      // Fallback to front view if specific view not found
      const frontConfig = modelConfig.front;
      return {
        position: { x: frontConfig.position[0], y: frontConfig.position[1], z: frontConfig.position[2] },
        rotation: { x: frontConfig.rotation[0], y: frontConfig.rotation[1], z: frontConfig.rotation[2] },
        scale: frontConfig.scale[0],
        opacity: 1,
      };
    };

 const handleAddAsset = () => {
  if (!currentAsset) return;

  const decalPosition = getDecalPositionForView(activePosition);
  
  const valueAsFile = currentAsset.value instanceof Blob 
    ? new File([currentAsset.value], "upload.png", { type: currentAsset.value.type })
    : currentAsset.value;

  const newAsset: Asset = {
    type: currentAsset.type as "text" | "upload" | "public",
    value: valueAsFile,
    properties: {
      position: decalPosition.position,
      rotation: decalPosition.rotation,
      scale: { x: decalPosition.scale, y: decalPosition.scale }, // ✅ Convert single number to object
      opacity: decalPosition.opacity,
    },
    _url: undefined,
  };

  // ✅ Para uploads, criar uma NOVA URL do Blob para cada asset
  if (newAsset.type === 'upload') {
    if (newAsset.value instanceof Blob) {
      newAsset._url = URL.createObjectURL(newAsset.value);
      newAsset.value = '';
    } else if (typeof newAsset.value === 'string') {
      newAsset._url = newAsset.value;
    } else {
      console.warn("Unexpected asset type:", newAsset.value);
      newAsset._url = '';
    }
  }

  const newIndex = assetsByPosition[activePosition].length;
  setAssetsByPosition(prev => ({
    ...prev,
    [activePosition]: [...prev[activePosition], newAsset],
  }));
  setSelectedAssetIndex(newIndex);

  // Reset inputs
  if (activeTool === 'text') {
    setUserText('');
    setTextAssetUrl(null);
  } else if (activeTool === 'upload') {
    if (userAsset) {
      URL.revokeObjectURL(userAsset);
    }
    setUserAsset(null);
    setUserAssetBlob(null);
  } else if (activeTool === 'assets') {
    setPublicAsset('/patches/patch-01.png');
  }
  setShowTools(false);
};

  const handleCacheDesign = () => {
    // Convert assets to serializable format
    const serializableAssets = Object.entries(assetsByPosition).reduce(
      (acc, [position, assets]) => {
        acc[position as Position] = assets.map(asset => ({
          type: asset.type,
          // For uploads: store as base64 (only for testing!)
          value: asset.type === 'upload' && asset._url
            ? asset._url // but this is blob: URL → not serializable!
            : typeof asset.value === 'string' ? asset.value : '',
          properties: asset.properties,
          // DO NOT store _url (blob URLs die on refresh)
        }));
        return acc;
      },
      {} as Record<Position, Omit<Asset, '_url' | 'value'> & { value: string }> 
    );

    const design: CachedDesign = {
      id: `design_${Date.now()}`,
      productId: product.id,
      assetsByPosition: serializableAssets,
      selectedColor,
      selectedTexture,
      createdAt: Date.now(),
      price: finalPrice,
    };

    // Store in localStorage
    const stored = localStorage.getItem('cachedDesigns');
    const designs = stored ? JSON.parse(stored) : [];
    designs.push(design);
    localStorage.setItem('cachedDesigns', JSON.stringify(designs));

    return design;
  };



  const handleAddToCart = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const cachedDesign = handleCacheDesign();

      let preview3D = "";
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas();
        if (canvas) preview3D = canvas.toDataURL("image/png");
      }

      let uploadedAssets: string[] = [];
      let previewUrl = "";
      let dstUrl = "";

      if (user) {
        const userId = user.id;
        const uploaded = await uploadDesignToSupabase(
          cachedDesign.id,
          userId,
          Object.values(assetsByPosition).flat(),
          preview3D
        );
        uploadedAssets = uploaded.uploadedAssets;
        previewUrl = uploaded.previewUrl;
        dstUrl = uploaded.dstUrl;

        await saveDesignRecord(
          userId,
          product.id,
          cachedDesign.id,
          uploadedAssets,
          previewUrl,
          dstUrl,
          [hslToHex(selectedColor.h, selectedColor.s, selectedColor.l)]
        );
      }

      addToCart({
        id: product.id,
        name: product.name,
        size: initialSize,
        color: initialColor,
        price: cachedDesign.price,
        quantity: 1,
        design: Object.values(assetsByPosition).flat(),
        designUrl: mainPhoto,
        customColors: [hslToHex(selectedColor.h, selectedColor.s, selectedColor.l)],
        designImages: { preview3D },
        type: "custom-design",
        dstFile: dstUrl || `custom-design-${Date.now()}.dst`,
        uploadedAssets,
      });

      setLoading(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1500);
    } catch (error) {
      setLoading(false);
      console.error('Error adding to cart:', error);
    }
  };


    const handleUndo = () => {
      setAssetsByPosition(prev => ({
        ...prev,
        [activePosition]: prev[activePosition].slice(0, -1)
      }));
    };

  const handleSurfacePick = (point: THREE.Vector3) => {
    setAssetsByPosition(prev => {
      const updated = [...prev[activePosition]];
      if (selectedAssetIndex === null || selectedAssetIndex >= updated.length) return prev;
      
      const asset = { ...updated[selectedAssetIndex] };
      // Only update position, no rotation
      asset.properties.position = { x: point.x, y: point.y, z: point.z };
      
      updated[selectedAssetIndex] = asset;
      return { ...prev, [activePosition]: updated };
    });
  };

  const handleScaleDecal = (scaleDelta: number) => {
    setAssetsByPosition(prev => {
      const updated = [...prev[activePosition]];
      if (selectedAssetIndex === null || selectedAssetIndex >= updated.length) return prev;
      
      const asset = { ...updated[selectedAssetIndex] };
      const minScale = 0.05;
      const maxScale = 0.5;
      
      // Apply scale delta and clamp
     asset.properties.scale = {
  x: asset.properties.scale.x * scaleDelta,
  y: asset.properties.scale.y * scaleDelta,
};

      
      updated[selectedAssetIndex] = asset;
      return { ...prev, [activePosition]: updated };
    });
  };

    const sidebarProps = {
      product,
      activePosition,
      onPositionChange: handleModelRotate,
      selectedColor,
      onColorChange: setSelectedColor,
      selectedTexture,
      onTextureChange: setSelectedTexture,
      finalPrice,
      onAddToCart: handleAddToCart, 
      selectedRegionPosition,
      isPanning,
      onPanStart: handlePanStart,
      onPanMove: handlePanMove,
      onPanEnd: handlePanEnd,
      isPositionOpen,
      onTogglePosition: () => setIsPositionOpen(p => !p),
      isColorOpen,
      onToggleColor: () => setIsColorOpen(p => !p),
      isTextureOpen,
      onToggleTexture: () => setIsTextureOpen(p => !p),
      loading,
      addedToCart,
    };
  // Cleanup de todos os blob URLs ao desmontar o componente
  useEffect(() => {
    return () => {
      // Cleanup do preview atual
      if (userAsset) {
        URL.revokeObjectURL(userAsset);
      }
      
      // Cleanup de todos os assets adicionados
      Object.values(assetsByPosition).flat().forEach(asset => {
        if (asset._url && asset._url.startsWith('blob:')) {
          URL.revokeObjectURL(asset._url);
        }
      });
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row max-h-max bg-gray-100 mt-20">
      <FloatingLogoAI/>
      {/* Sidebar - Top on mobile, Left on desktop */}
      <DesignSidebar
        activePosition={activePosition}
        onPositionChange={handleModelRotate}
        product={product}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        selectedTexture={selectedTexture}
        onTextureChange={setSelectedTexture}
        selectedRegionPosition={selectedRegionPosition}
        isPanning={isPanning}
        onPanStart={handlePanStart}
        onPanMove={handlePanMove}
        onPanEnd={handlePanEnd}
        isPositionOpen={isPositionOpen}
        onTogglePosition={() => setIsPositionOpen(p => !p)}
        isColorOpen={isColorOpen}
        onToggleColor={() => setIsColorOpen(p => !p)}
        isTextureOpen={isTextureOpen}
        onToggleTexture={() => setIsTextureOpen(p => !p)}
        selectedAssetIndex={selectedAssetIndex}
        assetsByPosition={assetsByPosition}
        onAddToCart={handleAddToCart}
        loading={mounted && loading}
        addedToCart={mounted && addedToCart}
      />

      <div className="flex flex-col flex-1">
        {/* Canvas */}
        <DesignCanvas
          ref={canvasRef}
          modelKey={product.modelKey}
          color={selectedColorHex}
          decals={decalProps}
          colorName={initialColor}
          sceneRotation={sceneRotation}
          selectedAssetIndex={selectedAssetIndex}
          activePosition={activePosition}
          assetsByPosition={assetsByPosition}
          onSurfacePick={handleSurfacePick}
          onScaleDecal={handleScaleDecal}
          positions={regions}
          texture={selectedTexture}
          >
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="absolute top-2 right-2 flex items-center gap-1 z-50 text-sm font-bold"
                >
                  {selectedAssetIndex !== null ? (
              <>
                <Move3D size={18} /> {t("position")}
              </>
            ) : (
              <>
                <ImageIcon size={18} /> {t("decal")}
              </>
            )}

                </motion.div>
        <motion.div className="absolute bottom-2 right-2 z-20 flex flex-col items-center ">
              <motion.button
                onClick={() => setShowTools(prev => !prev)}
                className="px-4 py-2 rounded-full bg-black text-white shadow-lg font-[HandoBold] flex flex-row justify-center items-center gap-2"
                initial={{ scale: 0.9 }}
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("design_tools")} <SplinePointer size={24}/>
              </motion.button>
            </motion.div>
        <div className="absolute bottom-2 left-2 z-20 flex flex-col items-center">
          <motion.button
            onClick={() => setShowLayers(prev => !prev)}
            className="px-4 py-2 rounded-full bg-black text-white shadow-lg font-[HandoBold] flex flex-row justify-center items-center gap-2"
            initial={{ scale: 0.9 }}
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("layers")} <Layers size={24} />
          </motion.button>
        </div>

        <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
          <button
            onClick={handleUndo}
            className="px-3 py-1 flex flex-row gap-2 justify-center items-center rounded-sm bg-white/80 shadow-sm font-[HandoBold] text-gray-800 hover:bg-gray-300 text-sm"
          >
            {t("undo")} <Undo size={16}/>
          </button>
        </div>
      </DesignCanvas>

        {/* Accordions - Below canvas on mobile, hidden on desktop */}
        <div className="lg:hidden p-4">
          <DesignAccordions
            onStretchDecal={handleStretchDecal}
            product={product}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            selectedTexture={selectedTexture}
            onTextureChange={setSelectedTexture}
            selectedRegionPosition={selectedRegionPosition}
            isPanning={isPanning}
            onPanStart={handlePanStart}
            onPanMove={handlePanMove}
            onPanEnd={handlePanEnd}
            isPositionOpen={isPositionOpen}
            onTogglePosition={() => setIsPositionOpen(p => !p)}
            isColorOpen={isColorOpen}
            onToggleColor={() => setIsColorOpen(p => !p)}
            isTextureOpen={isTextureOpen}
            onToggleTexture={() => setIsTextureOpen(p => !p)}
            selectedAssetIndex={selectedAssetIndex}
            assetsByPosition={assetsByPosition}
            activePosition={activePosition}
          />
          
          {/* Add to Cart Button - Mobile */}
          <motion.button 
            onClick={handleAddToCart}
            disabled={loading || addedToCart}
            className="w-full mt-4 px-4 py-3 rounded-lg font-[HandoBold] flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 transition-all duration-150"
            style={mounted && addedToCart ? { backgroundColor: '#22c55e' } : {}}
            whileHover={!addedToCart && !loading ? { scale: 1.02 } : {}}
            whileTap={!addedToCart && !loading ? { scale: 0.98 } : {}}
          >
            {mounted && loading ? (
              <img src="/loading/loading.gif" alt="loading" className="w-5 h-5" />
            ) : mounted && addedToCart ? (
              <Check size={20} />
            ) : (
              t("add_to_cart")
            )}
          </motion.button>
        </div>
      </div>

      <DesignToolsModal
        isOpen={showTools}
        onClose={() => setShowTools(false)}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        userText={userText}
        onTextChange={setUserText}
        onFileUpload={handleUpload}
        publicAsset={publicAsset}
        onPublicAssetSelect={setPublicAsset}
        currentAsset={currentAsset}
        onAddAsset={handleAddAsset}
      />

     <LayersModal
  isOpen={showLayers}
  onClose={() => setShowLayers(false)}
  assetsByPosition={assetsByPosition}
  activePosition={activePosition} // ✅ Pass original position
  selectedAssetIndex={selectedAssetIndex}
  onSelectLayer={handleSelectLayer}
  onDeleteLayer={handleDeleteLayer}
/>

    </div>
  );
  }


  export default function DesignPageWrapper() {
    const params = useParams<{ slug: string }>();
    const productSlug = params.slug;
    const product = PRODUCTS.find((p) => p.slug === productSlug);
    if (!product) return <div>Product not found</div>;
    return <DesignPageContent product={product} />;
  }
