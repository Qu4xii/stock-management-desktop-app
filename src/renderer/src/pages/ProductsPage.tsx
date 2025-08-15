// In src/renderer/src/pages/ProductsPage.tsx

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ProductsTable from '../components/ProductsTable';
import AddProductDialog from '../components/AddProductDialog';
import { Button } from '../components/ui/button';
import { Product } from '../components/types';

const initialProducts: Product[] = [
  { id: 1, name: 'GUINNESS KEG (11 gal)', price: 150.00, quantity: 2 },
  { id: 2, name: 'Kingston Classic bitter (500 ml)', price: 3.50, quantity: 24 },
  { id: 3, name: 'MAGNERS IRISH CIDER NRB (568 ml)', price: 4.25, quantity: 0 },
];

function ProductsPage(): JSX.Element {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const productWithId: Product = { ...newProductData, id: Date.now() };
    setProducts(prevProducts => [...prevProducts, productWithId]);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-1 text-muted-foreground">Manage your product inventory.</p>
        </div>
        <AddProductDialog onProductAdded={handleAddProduct}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </AddProductDialog>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}

export default ProductsPage;