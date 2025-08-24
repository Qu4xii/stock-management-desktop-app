// File: src/renderer/src/pages/PurchaseOrdersPage.tsx

import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { toast } from 'sonner'
import { PurchaseOrder } from '../types'
import { usePermissions } from '../hooks/usePermissions'
import { useNavigate } from 'react-router-dom'

function PurchaseOrdersPage(): JSX.Element {
  const { can } = usePermissions()
  const navigate = useNavigate()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const fetchedPOs = await window.db.getPurchaseOrders()
        setPurchaseOrders(fetchedPOs)
      } catch (error) {
        console.error('Failed to fetch purchase orders:', error)
        toast.error('Failed to load purchase orders.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPurchaseOrders()
  }, [])

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">Create and manage orders for your suppliers.</p>
        </div>
        {can('products:create') && (
          <Button onClick={() => navigate('/purchase-orders/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New PO
          </Button>
        )}
      </div>

     <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>A list of all purchase orders created in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : purchaseOrders.length > 0 ? (
                purchaseOrders.map((po) => (
                  // --- 3. ADD THE onClick HANDLER TO THE TableRow ---
                  <TableRow
                    key={po.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/purchase-orders/${po.id}`)}
                  >
                    <TableCell className="font-medium">PO-{po.id}</TableCell>
                    <TableCell>{po.supplierName}</TableCell>
                    <TableCell>{formatDate(po.orderDate)}</TableCell>
                    <TableCell>
                      <Badge>{po.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(po.totalCost)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default PurchaseOrdersPage