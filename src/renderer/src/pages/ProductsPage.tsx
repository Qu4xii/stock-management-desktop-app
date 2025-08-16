// In src/renderer/src/pages/ProductsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import ProductsTable from '../components/ProductsTable';
import AddProductDialog from '../components/AddProductDialog';
import EditProductDialog from '../components/EditProductDialog';
import { Button } from '../components/ui/button';
import { Product } from '../types';

function ProductsPage(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    const productsFromDb = await window.db.getProducts();
    setProducts(productsFromDb);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
    await window.db.addProduct(newProductData);
    fetchProducts(); // Refresh the list
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await window.db.updateProduct(updatedProduct);
    setEditingProduct(null); // Close the dialog
    fetchProducts(); // Refresh the list
  };

  const handleDeleteProduct = async (productId: number) => {
    await window.db.deleteProduct(productId);
    fetchProducts(); // Refresh the list
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
      
      <ProductsTable 
        products={products}
        onEdit={setEditingProduct}
        onDelete={handleDeleteProduct}
      />

      <EditProductDialog
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onProductUpdated={handleUpdateProduct}
      />
    </div>
  );
}

export default ProductsPage;