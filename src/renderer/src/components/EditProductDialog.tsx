// File: src/renderer/src/components/EditProductDialog.tsx

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Product } from '../types'
// [THEME] Import the theme-aware components
import { Input } from './ui/input'
import { Label } from './ui/label'

interface EditProductDialogProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onProductUpdated: (updatedProduct: Product) => void
}

function EditProductDialog({ product, isOpen, onClose, onProductUpdated }: EditProductDialogProps): JSX.Element {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState(0)

  // This hook pre-fills the form when a product is selected
  useEffect(() => {
    if (product) {
      setName(product.name)
      setQuantity(product.quantity)
      setPrice(product.price)
    }
  }, [product])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!product) return

    const updatedProduct: Product = {
      ...product,
      name,
      quantity: Number(quantity),
      price: Number(price)
    }
    onProductUpdated(updatedProduct)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* [THEME] The hardcoded background color has been removed */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the details for "{product?.name}".</DialogDescription>
        </DialogHeader>
        {/* [THEME] The form has been refactored to use ShadCN components */}
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">
              Price ($)
            </Label>
            <Input id="edit-price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-quantity" className="text-right">
              Quantity
            </Label>
            <Input id="edit-quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="col-span-3" />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProductDialog