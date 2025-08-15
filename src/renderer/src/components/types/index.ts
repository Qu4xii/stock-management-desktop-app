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