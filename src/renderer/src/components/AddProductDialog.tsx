// File: src/renderer/src/components/AddProductDialog.tsx

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Product } from '../types'
// [THEME] Import the Input and Label components
import { Input } from './ui/input'
import { Label } from './ui/label'

interface AddProductDialogProps {
  children: React.ReactNode
  onProductAdded: (productData: Omit<Product, 'id'>) => void
}

function AddProductDialog({ children, onProductAdded }: AddProductDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState(0)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name || price <= 0) {
      alert('Please provide a product name and a valid price.')
      return
    }
    onProductAdded({ name, quantity: Number(quantity), price: Number(price) })
    setIsOpen(false) // Close the dialog
    // Reset form
    setName('')
    setQuantity(0)
    setPrice(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* [THEME] The hardcoded background color has been removed */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Enter the details for the new product.</DialogDescription>
        </DialogHeader>
        {/* [THEME] The form has been refactored to use ShadCN components */}
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price ($)
            </Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="col-span-3" />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddProductDialog