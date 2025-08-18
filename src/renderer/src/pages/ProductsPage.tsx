// In src/renderer/src/pages/ProductsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import ProductsTable from '../components/ProductsTable';
import AddProductDialog from '../components/AddProductDialog';
import EditProductDialog from '../components/EditProductDialog';
import { Button } from '../components/ui/button';
import { Product } from '../types';
import { Input } from '../components/ui/input'; // For the search bar
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'; // For the sort dropdown

// Define the possible sort options for type safety
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'quantity-asc' | 'quantity-desc';

function ProductsPage(): JSX.Element {
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // --- DATA FETCHING ---
  const fetchProducts = useCallback(async () => {
    // We can add error handling here later with try/catch and toasts
    const productsFromDb = await window.db.getProducts();
    setProducts(productsFromDb);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- EVENT HANDLERS ---
  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
    await window.db.addProduct(newProductData);
    fetchProducts();
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await window.db.updateProduct(updatedProduct);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId: number) => {
    await window.db.deleteProduct(productId);
    fetchProducts();
  };

  // --- DERIVED STATE FOR DISPLAY ---
  // This logic runs on every render to filter and sort the master 'products' list.
  const processedProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'quantity-asc':
          return a.quantity - b.quantity;
        case 'quantity-desc':
          return b.quantity - a.quantity;
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // --- RENDER LOGIC ---
  return (
    <div className="flex flex-col gap-6 h-full"> {/* Use a smaller gap */}
      
      {/* Page Header */}
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
      
      {/* --- FIX #1: ADD THE SEARCH AND SORT CONTROLS TO THE UI --- */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Input */}
        <Input 
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {/* Sort Dropdown */}
        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            <SelectItem value="quantity-asc">Quantity (Low to High)</SelectItem>
            <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* --- FIX #2: PASS THE CORRECT (PROCESSED) LIST TO THE TABLE --- */}
      <ProductsTable 
        products={processedProducts}
        onEdit={setEditingProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Dialogs for editing */}
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