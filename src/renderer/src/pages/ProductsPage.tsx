// In src/renderer/src/pages/ProductsPage.tsx

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ProductsTable from '../components/ProductsTable';
import AddProductDialog from '../components/AddProductDialog';
import { Button } from '../components/ui/button';
import { Product } from '../components/types';
import EditProductDialog from '../components/EditProductDialog'; 


const initialProducts: Product[] = [
  { id: 1, name: 'GUINNESS KEG (11 gal)', price: 150.00, quantity: 2 },
  { id: 2, name: 'Kingston Classic bitter (500 ml)', price: 3.50, quantity: 24 },
  { id: 3, name: 'MAGNERS IRISH CIDER NRB (568 ml)', price: 4.25, quantity: 0 },
];

function ProductsPage(): JSX.Element {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  // --- NEW STATE FOR HANDLING THE EDIT DIALOG ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- HANDLER FUNCTIONS ---
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const productWithId: Product = { ...newProductData, id: Date.now() };
    setProducts(prevProducts => [...prevProducts, productWithId]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null); // Close the dialog after updating
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(prevProducts =>
      prevProducts.filter(p => p.id !== productId)
    );
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

      {/* We now pass the new handler functions down to the table */}
      <ProductsTable 
        products={products}
        onEdit={(product) => setEditingProduct(product)} // When Edit is clicked, set the product to be edited
        onDelete={handleDeleteProduct}
      />

      {/* The Edit Dialog is rendered here. It is only visible when 'editingProduct' is not null. */}
      <EditProductDialog
        product={editingProduct}
        isOpen={!!editingProduct} // The dialog is open if there is a product to edit
        onClose={() => setEditingProduct(null)} // Closing the dialog clears the editing product
        onProductUpdated={handleUpdateProduct}
      />
    </div>
  );
}

export default ProductsPage;