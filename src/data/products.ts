  import type { Product } from "../types/product";

  export const PRODUCTS: Product[] = [
    
    {
      id: 1,
      name: "Trucker Hat",
      description: "Classic trucker hat",
      slug: "trucker",
      modelKey: "trucker",
      price: 35.00,
      colors: [
      "BLACK",
"WHITE",

"RED",
"ROYAL",
"N.YEL",

"NAVY",
"PURPLE",
"LAVENDER",
"H.PINK",
"L.PINK",
"AQUA",
"SKY",
"MINT",

"D.GREY",
"L.GRAY",
"D.GRE",
"K.GRE",
"N.GRE",

"KHAKI",
"BROWN",
"OLIVE",
"BUR",

"GOLD",
"N.ORA",


"G.CAMO",

"CAMO/BLK",

"KHI/BRO",

"GOLD/BLK",
"GOLD/NAVY",
"GOLD/ROY",

"RED/WHT/ROY",
"RED/WHT/BLK",
"BLK/WHT/RED",



"WHT/BLK",
"WHT/NAV",
"WHT/D.GR",
"WHT/RED",
"WHT/H.PINK",
"WHT/L.PINK",
"WHT/ROY",
"WHT/AQUA",
"WHT/SKY",
"WHT/BRO",
"WHT/KHI",
"WHT/PUR",
"WHT/GOLD",
"WHT/D.GRE",
"WHT/K.GRE",
"WHT/N.GRE",
"WHT/N.ORA",
"WHT/N.YEL",
"WHT/BUR",
"WHT/LAV",
"WHT/OLI",
"WHT/MINT"


      ],
      sizes: ["One Size"],
      sku: "TR001O-BLK-WHT",
      weight: "220 gsm",
      designUrl: "/photos/trucker/black-1.png",
      photos: {
        ROYAL: ["/photos/trucker/black-1.png", "/photos/trucker/black-2.png"],
        White: ["/photos/trucker/white-1.png"]
      },
      new: "Yes"
    },
    {
      id: 2,
      name: "Snapback",
      description: "Modern Snapback",
      slug: "snapback",
      modelKey: "snapback",
      price: 35.00,
      
      colors: [
        "BLACK",
      "WHITE",
      "BROWN",
      "RED", 
      "PINK",    
      "SKY",
      "NAVY",
      "D. GREY",
      "D. GREEN",
      "KHAKI",
      "OLIVE",
      "WINE",
      "L. GREY",  
      "BLK(RED)",
      "MNT(RED)"
      ],
      sizes: ["One Size"],
      sku: "PN001O-BLK-WHT",
      weight: "210 gsm",
      designUrl: "/photos/snapback/panel-1.png",
      photos: {
        BLACK: ["/photos/snapback/panel-1.png"],
        
      },
      new: "Yes"
    },
    {
      id: 3,
      name: "Dad Hat",
      description: "Comfortable baseball cap",
      slug: "hat",
      modelKey: "hat",
      price: 35.00,
      colors: [
        "BLACK",
        "WHITE",
        "RED",
        "ROYAL",
        "SKY",
        "MANGO",
        "TANGERINE",
        "HOT PINK",
        "PURPLE",
        "DARK GREEN",
        "NAVY",
        "WINE",
        "KHAKI",

  ],
      sizes: ["One Size"],
      sku: "BSB001O-BLK-WHT",
      weight: "200 gsm",
      designUrl: "/photos/hat/black-1.png",
      photos: {
        SKY: ["/photos/hat/black-1.png"]  
      },
      new: "Yes"
    },
    {
      id: 4,
      name: "5Panel",
      description: "Five-panel hat",
      slug: "panel",
      modelKey: "panel",
      price: 35.00,
      
      colors: [
        "BLACK",
        "DARK GREY",
        "COFFEE",
        "DARK RED",
        "PURPLE"
      ],
      sizes: ["One Size"],
      sku: "PN003O-BLK-OLV",
      weight: "210 gsm",
      designUrl: "/photos/panel/panel.png",
      photos: {
        ROYAL: ["/photos/panel/panel.png"],
      
      },
      new: "Yes"
    },

  ]
