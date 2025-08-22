// File: src/renderer/src/components/ProductsTable.tsx

import { Product } from '../types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { usePermissions } from '../hooks/usePermissions'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
}

function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps): JSX.Element {
  const { can } = usePermissions()

  const canPerformAnyAction = can('products:update') || can('products:delete')

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead className="w-[150px]">Price</TableHead>
            <TableHead className="w-[150px]">Quantity</TableHead>
            <TableHead className="w-[150px]">Availability</TableHead>
            {/* [UI REFINEMENT] Only render the Actions header if actions are possible */}
            {canPerformAnyAction && <TableHead className="text-right w-[120px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              {/* Adjust colSpan based on whether the Actions column is rendered */}
              <TableCell
                colSpan={canPerformAnyAction ? 5 : 4}
                className="h-24 text-center text-muted-foreground"
              >
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.quantity > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </TableCell>
                {/* [UI REFINEMENT] Only render the cell for the Actions column if actions are possible */}
                {canPerformAnyAction && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {can('products:update') && (
                          <DropdownMenuItem onClick={() => onEdit(product)}>Edit</DropdownMenuItem>
                        )}
                        {can('products:delete') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete "${product.name}"?`
                                  )
                                ) {
                                  onDelete(product.id)
                                }
                              }}
                              className="text-red-500 focus:text-red-500"
                            >
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

export default ProductsTable