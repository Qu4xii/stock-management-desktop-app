// In src/renderer/src/types/index.ts

export interface Client {
  id: number;
  name: string;
  idCard: string;
  address: string;  // <-- NEW FIELD
  email: string;      // <-- NEW FIELD
  phone: string;      // <-- NEW FIELD
  picture?: string;   // <-- NEW, OPTIONAL FIELD (the '?' makes it optional)
}
export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  // 'availability' can be derived from quantity > 0, but we can add it if needed.
}