export interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  modelKey: string;
  price: number;
  colors: string[];
  sizes: string[];
  sku: string;
  weight: string;
  designUrl?: string;
  photos?: Record<string, string[]>;
  new?: string;
}