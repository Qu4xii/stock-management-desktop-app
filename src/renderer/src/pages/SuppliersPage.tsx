// File: src/renderer/src/pages/SuppliersPage.tsx

import { useState, useEffect, useMemo } from 'react'
import { PlusCircle, MoreHorizontal, Pen, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { toast } from 'sonner'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Supplier } from '../types'
import { usePermissions } from '../hooks/usePermissions'

// Define the form values for adding/editing a supplier
type SupplierFormInputs = Omit<Supplier, 'id'>

function SuppliersPage(): JSX.Element {
  const { can } = usePermissions()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<SupplierFormInputs>()

  // Fetch all suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const fetchedSuppliers = await window.db.getSuppliers()
        setSuppliers(fetchedSuppliers)
      } catch (error) {
        console.error('Failed to fetch suppliers:', error)
        toast.error('Failed to load suppliers.')
      }
    }
    fetchSuppliers()
  }, [])

  const handleOpenDialog = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier)
    if (supplier) {
      // Pre-fill form for editing
      setValue('name', supplier.name)
      setValue('contactPerson', supplier.contactPerson || '')
      setValue('email', supplier.email || '')
      setValue('phone', supplier.phone || '')
      setValue('address', supplier.address || '')
    } else {
      // Reset form for adding
      reset()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSupplier(null)
    reset()
  }

  const onSubmit: SubmitHandler<SupplierFormInputs> = async (data) => {
    const toastId = toast.loading(editingSupplier ? 'Updating supplier...' : 'Adding supplier...')
    try {
      if (editingSupplier) {
        // Update existing supplier
        const updatedSupplier = await window.db.updateSupplier({ ...editingSupplier, ...data })
        setSuppliers(suppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s)))
        toast.success('Supplier updated successfully!', { id: toastId })
      } else {
        // Add new supplier
        const newSupplier = await window.db.addSupplier(data)
        setSuppliers([...suppliers, newSupplier])
        toast.success('Supplier added successfully!', { id: toastId })
      }
      handleCloseDialog()
    } catch (error: any) {
      console.error('Failed to save supplier:', error)
      toast.error(`Failed to save supplier: ${error.message}`, { id: toastId })
    }
  }

  const handleDeleteSupplier = async (supplierId: number) => {
    if (!confirm('Are you sure you want to delete this supplier? This cannot be undone.')) {
      return
    }
    const toastId = toast.loading('Deleting supplier...')
    try {
      await window.db.deleteSupplier(supplierId)
      setSuppliers(suppliers.filter((s) => s.id !== supplierId))
      toast.success('Supplier deleted successfully!', { id: toastId })
    } catch (error: any) {
      console.error('Failed to delete supplier:', error)
      toast.error(`Failed to delete supplier: ${error.message}`, { id: toastId })
    }
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'contactPerson', header: 'Contact Person' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      {
        id: 'actions',
        cell: ({ row }) => {
          const supplier = row.original as Supplier
          const canEdit = can('products:update')
          const canDelete = can('products:delete')

          if (!canEdit && !canDelete) return null

          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => handleOpenDialog(supplier)}>
                      <Pen className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      }
    ],
    [suppliers, can]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-muted-foreground">Manage your product suppliers.</p>
        </div>
        {can('products:create') && (
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.id || col.accessorKey}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  {columns.map((col) => (
                    <TableCell key={col.id || col.accessorKey}>
                      {col.cell
                        ? col.cell({ row: { original: supplier } })
                        : supplier[col.accessorKey as keyof Supplier]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              <DialogDescription>
                {editingSupplier
                  ? "Update the supplier's details below."
                  : 'Fill in the details for the new supplier.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    {...register('name', { required: 'Supplier name is required.' })}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactPerson" className="text-right">
                  Contact
                </Label>
                <Input
                  id="contactPerson"
                  {...register('contactPerson')}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" {...register('email')} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input id="phone" {...register('phone')} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input id="address" {...register('address')} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">Save Supplier</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SuppliersPage