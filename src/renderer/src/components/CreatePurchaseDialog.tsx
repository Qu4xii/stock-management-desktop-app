// In src/renderer/src/components/CreatePurchaseDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Product, Client } from '../types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils'; // Assumes you have this utility from ShadCN

interface CreatePurchaseDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseCreated: () => void;
}

function CreatePurchaseDialog({ client, isOpen, onClose, onPurchaseCreated }: CreatePurchaseDialogProps): JSX.Element {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Map<number, { name: string; quantity: number }>>(new Map());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Fetch all available products when the dialog opens
    if (isOpen) {
      window.db.getProducts().then(setAllProducts);
    }
  }, [isOpen]);

  const handleSelectProduct = (product: Product) => {
    const newSelection = new Map(selectedProducts);
    if (newSelection.has(product.id)) {
      newSelection.delete(product.id);
    } else {
      newSelection.set(product.id, { name: product.name, quantity: 1 });
    }
    setSelectedProducts(newSelection);
    setOpen(false);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const newSelection = new Map(selectedProducts);
    const item = newSelection.get(productId);
    if (item) {
      item.quantity = Math.max(1, newQuantity); // Ensure quantity is at least 1
      setSelectedProducts(newSelection);
    }
  };
  
  const handleSubmit = async () => {
    if (!client || selectedProducts.size === 0) {
      alert('Please select a client and at least one product.');
      return;
    }
    const items = Array.from(selectedProducts.entries()).map(([id, { quantity }]) => ({ id, quantity }));
    await window.db.createPurchase({ clientId: client.id, items });
    onPurchaseCreated();
    onClose();
  };

if (!client) return <></>;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Create New Purchase for {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Products</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                  {selectedProducts.size > 0 ? `${selectedProducts.size} products selected` : "Select products..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[550px] p-0">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {allProducts.map((product) => (
                      <CommandItem key={product.id} onSelect={() => handleSelectProduct(product)}>
                        <Check className={cn("mr-2 h-4 w-4", selectedProducts.has(product.id) ? "opacity-100" : "opacity-0")} />
                        {product.name} (In Stock: {product.quantity})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedProducts.size > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">Selected Items</h3>
              {Array.from(selectedProducts.entries()).map(([id, { name, quantity }]) => (
                <div key={id} className="flex items-center justify-between">
                  <span>{name}</span>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => handleQuantityChange(id, parseInt(e.target.value, 10))}
                    className="w-20 text-center border rounded-md dark:bg-slate-700 dark:border-slate-600"
                    min="1"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit} disabled={selectedProducts.size === 0}>Create Purchase</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePurchaseDialog;