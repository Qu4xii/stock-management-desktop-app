// In src/renderer/src/components/EditProductDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Product } from '../types'; // Ensure path is correct: ../types if types folder is in src/renderer/src

interface EditProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: (updatedProduct: Product) => void;
}

function EditProductDialog({ product, isOpen, onClose, onProductUpdated }: EditProductDialogProps): JSX.Element {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setQuantity(product.quantity);
      setPrice(product.price);
    }
  }, [product]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      name,
      quantity: Number(quantity),
      price: Number(price),
    };
    onProductUpdated(updatedProduct);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for "{product?.name}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* --- FIXES START HERE --- */}

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="edit-name" className="text-right">Name</label>
            {/* FIX: Correctly wrap onChange in curly braces {} */}
            <input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="edit-price" className="text-right">Price ($)</label>
            {/* FIX: Correctly wrap onChange in curly braces {} */}
            <input id="edit-price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="col-span-3 mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="edit-quantity" className="text-right">Quantity</label>
            {/* FIX: Correctly wrap onChange in curly braces {} and add the second argument to parseInt */}
            <input id="edit-quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="col-span-3 mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button type="submit">Save Changes</Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditProductDialog;