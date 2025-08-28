// File: src/renderer/src/pages/CreatePurchaseOrderPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { Input } from '../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table'
import { Label } from '../components/ui/label'
import { toast } from 'sonner'
import { Supplier, Product, PurchaseOrderItem } from '../types'
import { Trash2 } from 'lucide-react'
import ProductSearch from '../components/ProductSearch' // We will create this small component next

// Define the shape of a line item in our form state
interface LineItem extends Omit<PurchaseOrderItem, 'id' | 'purchaseOrderId' | 'productName'> {
  productName: string;
}

function CreatePurchaseOrderPage(): JSX.Element {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedSuppliers = await window.db.getSuppliers()
        setSuppliers(fetchedSuppliers)
      } catch (error) {
        toast.error('Failed to load suppliers.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddProduct = (product: Product) => {
    // Prevent adding the same product twice
    if (lineItems.some((item) => item.productId === product.id)) {
      toast.info(`"${product.name}" is already in the order.`)
      return
    }
    const newItem: LineItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      costPrice: product.price // Default cost to sale price, user can edit
    }
    setLineItems([...lineItems, newItem])
  }

  const handleUpdateItem = (productId: number, field: 'quantity' | 'costPrice', value: string) => {
    const numValue = parseFloat(value) || 0
    setLineItems(
      lineItems.map((item) =>
        item.productId === productId ? { ...item, [field]: numValue } : item
      )
    )
  }

  const handleRemoveItem = (productId: number) => {
    setLineItems(lineItems.filter((item) => item.productId !== productId))
  }

  const totalCost = useMemo(() => {
    return lineItems.reduce((total, item) => total + item.quantity * item.costPrice, 0)
  }, [lineItems])

  const handleSaveOrder = async () => {
    if (!selectedSupplier) {
      toast.error('Please select a supplier.')
      return
    }
    if (lineItems.length === 0) {
      toast.error('Please add at least one product to the order.')
      return
    }

    const toastId = toast.loading('Creating purchase order...')
    try {
      const orderData = {
        supplierId: parseInt(selectedSupplier),
        items: lineItems.map(({ productName, ...item }) => item) // Remove productName before sending
      }
      await window.db.createPurchaseOrder(orderData)
      toast.success('Purchase order created successfully!', { id: toastId })
      navigate('/purchase-orders')
    } catch (error: any) {
      toast.error(`Failed to create order: ${error.message}`, { id: toastId })
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Purchase Order</h2>
          <p className="text-muted-foreground">Select a supplier and add products to the order.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
            Cancel
          </Button>
          <Button onClick={handleSaveOrder}>Save Purchase Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Supplier</Label>
            <Select onValueChange={setSelectedSupplier} value={selectedSupplier} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
            <CardDescription>Search for products to add to this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSearch onProductSelect={handleAddProduct} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-[120px]">Quantity</TableHead>
                <TableHead className="w-[150px]">Cost Price ($)</TableHead>
                <TableHead className="w-[150px] text-right">Subtotal</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.length > 0 ? (
                lineItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.productId, 'quantity', e.target.value)}
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.costPrice}
                        onChange={(e) => handleUpdateItem(item.productId, 'costPrice', e.target.value)}
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(item.quantity * item.costPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No products added to the order yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 text-right text-xl font-bold">
            Total Order Cost: ${totalCost.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreatePurchaseOrderPage