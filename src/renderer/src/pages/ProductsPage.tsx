// File: src/renderer/src/pages/ProductsPage.tsx (Updated Version)

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { PlusCircle, MoreHorizontal, Pen, Trash2, SlidersHorizontal, Search, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { Product, Supplier } from '../types'
import { usePermissions } from '../hooks/usePermissions'

// Forms
type ProductFormInputs = Omit<Product, 'id' | 'supplierName' | 'quantity'>
type AdjustStockFormInputs = { adjustment: number; reason: string }

// Filter and search state
interface FilterState {
  search: string
  supplierId: string
  lowStock: boolean
}

function ProductsPage(): JSX.Element {
  const { can } = usePermissions()
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter and search state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    supplierId: '',
    lowStock: false
  })

  const productForm = useForm<ProductFormInputs>()
  const adjustStockForm = useForm<AdjustStockFormInputs>()

  // Fetch all products and suppliers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log('[ProductsPage] Starting to fetch initial data...')

        const [fetchedProducts, fetchedSuppliers] = await Promise.all([
          window.db.getProducts(),
          window.db.getSuppliers()
        ])

        console.log('[ProductsPage] Received products:', fetchedProducts)
        console.log('[ProductsPage] Received suppliers:', fetchedSuppliers)
        
        setProducts(fetchedProducts)
        setSuppliers(fetchedSuppliers)

        console.log('[ProductsPage] State has been set.')
      } catch (error) {
        console.error('!!! [ProductsPage] FAILED TO FETCH DATA:', error)
        toast.error('Failed to load initial data. Check the console.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filtered and searched products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.supplierName?.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesSupplier = !filters.supplierId || 
        product.supplierId?.toString() === filters.supplierId
      
      const matchesLowStock = !filters.lowStock || product.quantity <= 10 // Configurable threshold
      
      return matchesSearch && matchesSupplier && matchesLowStock
    })
  }, [products, filters])

  // Update filter handlers
  const updateFilter = useCallback((key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ search: '', supplierId: '', lowStock: false })
  }, [])

  // Dialog handlers
  const handleOpenProductDialog = useCallback((product: Product | null = null) => {
    setSelectedProduct(product)
    if (product) {
      productForm.reset({
        name: product.name,
        price: product.price,
        supplierId: product.supplierId,
        costPrice: product.costPrice,
        sku: product.sku,
      })
    } else {
      productForm.reset()
    }
    setIsProductDialogOpen(true)
  }, [productForm])

  const handleOpenAdjustDialog = useCallback((product: Product) => {
    setSelectedProduct(product)
    adjustStockForm.reset({ adjustment: 0, reason: '' })
    setIsAdjustDialogOpen(true)
  }, [adjustStockForm])

  const handleCloseDialogs = useCallback(() => {
    setIsProductDialogOpen(false)
    setIsAdjustDialogOpen(false)
    setSelectedProduct(null)
  }, [])

  // Form submission handlers
  const onProductSubmit: SubmitHandler<ProductFormInputs> = async (data) => {
    const toastId = toast.loading(selectedProduct ? 'Updating product...' : 'Adding product...')
    try {
      if (selectedProduct) {
        const updatedProduct = await window.db.updateProduct({ ...selectedProduct, ...data })
        setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
        toast.success('Product updated!', { id: toastId })
      } else {
        const newProduct = await window.db.addProduct({ ...data, quantity: 0 })
        setProducts([...products, newProduct])
        toast.success('Product added!', { id: toastId })
      }
      handleCloseDialogs()
    } catch (error: any) {
      console.error('Product submission error:', error)
      toast.error(`Error: ${error.message || 'Unknown error occurred'}`, { id: toastId })
    }
  }

  const onAdjustStockSubmit: SubmitHandler<AdjustStockFormInputs> = async (data) => {
    if (!selectedProduct) return
    
    const newQuantity = selectedProduct.quantity + Number(data.adjustment)
    if (newQuantity < 0) {
      toast.error('Adjustment would result in negative stock quantity')
      return
    }

    const toastId = toast.loading('Adjusting stock...')
    try {
      const updatedProduct = await window.db.adjustStock({
        productId: selectedProduct.id,
        adjustment: Number(data.adjustment),
        reason: data.reason
      })
      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
      toast.success('Stock adjusted successfully!', { id: toastId })
      handleCloseDialogs()
    } catch (error: any) {
      console.error('Stock adjustment error:', error)
      toast.error(`Error: ${error.message || 'Unknown error occurred'}`, { id: toastId })
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    const toastId = toast.loading('Deleting product...')
    try {
      await window.db.deleteProduct(productId)
      setProducts((currentProducts) => currentProducts.filter((p) => p.id !== productId))
      toast.success('Product deleted successfully!', { id: toastId })
    } catch (error: any) {
      console.error('Failed to delete product:', error)
      toast.error(`Failed to delete product: ${error.message || 'Unknown error occurred'}`, { id: toastId })
    }
  }

  // Stock status helper
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const }
    if (quantity <= 10) return { label: 'Low Stock', variant: 'secondary' as const }
    return { label: 'In Stock', variant: 'default' as const }
  }

  // Check if user has any product management permissions
  const hasProductManagementPermissions = can('products:update') || can('products:delete')

  const columns = useMemo(() => {
    const baseColumns: Array<{
      accessorKey?: string
      id?: string
      header: string
      cell?: ({ row }: { row: { original: Product } }) => React.ReactNode
    }> = [
      { 
        accessorKey: 'name', 
        header: 'Name',
        cell: ({ row }) => {
          const product = row.original as Product
          return (
            <div className="font-medium">
              {product.name}
              {product.sku && <div className="text-sm text-muted-foreground">{product.sku}</div>}
            </div>
          )
        }
      },
      { accessorKey: 'supplierName', header: 'Supplier' },
      { 
        accessorKey: 'quantity', 
        header: 'Stock',
        cell: ({ row }) => {
          const product = row.original as Product
          const status = getStockStatus(product.quantity)
          return (
            <div className="flex items-center gap-2">
              <span>{product.quantity}</span>
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            </div>
          )
        }
      },
      { 
        accessorKey: 'price', 
        header: 'Sale Price',
        cell: ({ row }) => `$${(row.original as Product).price?.toFixed(2) || '0.00'}`
      },
      { 
        accessorKey: 'costPrice', 
        header: 'Cost Price',
        cell: ({ row }) => {
          const costPrice = (row.original as Product).costPrice
          return costPrice ? `$${costPrice.toFixed(2)}` : 'N/A'
        }
      },
      {
        id: 'margin',
        header: 'Margin',
        cell: ({ row }) => {
          const product = row.original as Product
          if (!product.price || !product.costPrice) return 'N/A'
          const margin = ((product.price - product.costPrice) / product.price) * 100
          return `${margin.toFixed(1)}%`
        }
      }
    ]

    // Only add actions column if user has management permissions
    if (hasProductManagementPermissions) {
      baseColumns.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: { row: { original: Product } }) => {
          const product = row.original as Product
          const canEdit = can('products:update')
          const canDelete = can('products:delete')

          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => handleOpenProductDialog(product)}>
                      <Pen className="mr-2 h-4 w-4" />Edit Details
                    </DropdownMenuItem>
                  )}
                  {canEdit && (
                    <DropdownMenuItem onClick={() => handleOpenAdjustDialog(product)}>
                      <SlidersHorizontal className="mr-2 h-4 w-4" />Adjust Stock
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      })
    }

    return baseColumns
  }, [can, handleOpenProductDialog, handleOpenAdjustDialog, hasProductManagementPermissions])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="rounded-md border p-8">
          <div className="text-center">Loading products...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory and details. {filteredProducts.length} of {products.length} products shown.
          </p>
        </div>
        {can('products:create') && (
          <Button onClick={() => handleOpenProductDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/10">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, SKU, or supplier..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filters.supplierId || "all"} onValueChange={(value) => updateFilter('supplierId', value === "all" ? "" : value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All suppliers</SelectItem>
            {suppliers.map(supplier => (
              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={filters.lowStock ? "default" : "outline"}
          onClick={() => updateFilter('lowStock', !filters.lowStock)}
          className="whitespace-nowrap"
        >
          Low Stock Only
        </Button>

        {(filters.search || filters.supplierId || filters.lowStock) && (
          <Button variant="ghost" onClick={clearFilters} className="px-2">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id || column.accessorKey}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  {columns.map((column) => {
                    const cellContent = column.cell
                      ? column.cell({ row: { original: product } })
                      : product[column.accessorKey as keyof Product]
                    
                    return (
                      <TableCell key={column.id || column.accessorKey}>
                        {cellContent === null || cellContent === undefined ? 'N/A' : cellContent}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {products.length === 0 
                    ? "No products found. Add a new product to get started."
                    : "No products match your current filters. Try adjusting your search criteria."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={productForm.handleSubmit(onProductSubmit)}>
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {selectedProduct 
                  ? "Update the product's details." 
                  : "Fill in the details for the new product. Stock will be added via Purchase Orders."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="product-name">Name *</Label>
                <Input
                  id="product-name"
                  {...productForm.register('name', { 
                    required: 'Product name is required.',
                    minLength: { value: 2, message: 'Name must be at least 2 characters long.' }
                  })}
                />
                {productForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{productForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="product-sku">SKU / Part No.</Label>
                <Input 
                  id="product-sku" 
                  {...productForm.register('sku')}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label>Supplier</Label>
                <Controller
                  control={productForm.control}
                  name="supplierId"
                  render={({ field }) => (
                    <Select 
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))} 
                      value={field.value?.toString() || "none"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supplier (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No supplier</SelectItem>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-cost">Cost Price ($)</Label>
                  <Input
                    id="product-cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...productForm.register('costPrice', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative.' }
                    })}
                  />
                  {productForm.formState.errors.costPrice && (
                    <p className="text-red-500 text-xs mt-1">{productForm.formState.errors.costPrice.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="product-price">Sale Price ($) *</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    {...productForm.register('price', {
                      required: 'Sale price is required.',
                      valueAsNumber: true,
                      min: { value: 0.01, message: 'Price must be greater than 0.' }
                    })}
                  />
                  {productForm.formState.errors.price && (
                    <p className="text-red-500 text-xs mt-1">{productForm.formState.errors.price.message}</p>
                  )}
                </div>
              </div>

              {selectedProduct && (
                <div>
                  <Label>Current Quantity (Read-only)</Label>
                  <Input readOnly value={selectedProduct.quantity} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Quantity is updated via Purchase Orders or using the 'Adjust Stock' action.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialogs}>
                Cancel
              </Button>
              <Button type="submit" disabled={productForm.formState.isSubmitting}>
                {productForm.formState.isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={adjustStockForm.handleSubmit(onAdjustStockSubmit)}>
            <DialogHeader>
              <DialogTitle>Adjust Stock for {selectedProduct?.name}</DialogTitle>
              <DialogDescription>
                Manually change the stock quantity and provide a reason for the adjustment. 
                This action should be used for corrections or write-offs.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Current Quantity</Label>
                <Input readOnly value={selectedProduct?.quantity || 0} />
              </div>
              
              <div>
                <Label htmlFor="adjustment">Adjustment Amount *</Label>
                <Input 
                  id="adjustment"
                  type="number" 
                  {...adjustStockForm.register('adjustment', { 
                    required: 'Adjustment amount is required.',
                    valueAsNumber: true,
                    validate: (value) => {
                      if (value === 0) return 'Adjustment cannot be zero.'
                      const newQuantity = (selectedProduct?.quantity || 0) + value
                      if (newQuantity < 0) return 'This adjustment would result in negative stock.'
                      return true
                    }
                  })} 
                />
                {adjustStockForm.formState.errors.adjustment && (
                  <p className="text-red-500 text-xs mt-1">
                    {adjustStockForm.formState.errors.adjustment.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Use positive numbers to add stock (e.g., 5) or negative numbers to remove stock (e.g., -3).
                </p>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason for Adjustment *</Label>
                <Input 
                  id="reason"
                  {...adjustStockForm.register('reason', { 
                    required: "A reason is required.",
                    minLength: { value: 3, message: 'Reason must be at least 3 characters long.' }
                  })} 
                  placeholder="e.g., Damaged inventory, Found stock, Correction"
                />
                {adjustStockForm.formState.errors.reason && (
                  <p className="text-red-500 text-xs mt-1">
                    {adjustStockForm.formState.errors.reason.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialogs}>
                Cancel
              </Button>
              <Button type="submit" disabled={adjustStockForm.formState.isSubmitting}>
                {adjustStockForm.formState.isSubmitting ? 'Applying...' : 'Apply Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsPage