// File: src/renderer/src/pages/PurchaseOrderDetailPage.tsx

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { toast } from 'sonner'
import { PurchaseOrder } from '../types'
import { usePermissions } from '../hooks/usePermissions'
import { ArrowLeft, CheckCircle, Package } from 'lucide-react'

function PurchaseOrderDetailPage(): JSX.Element {
  const { can } = usePermissions()
  const navigate = useNavigate()
  const { poId } = useParams<{ poId: string }>()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!poId) {
      toast.error('Purchase Order ID is missing.')
      navigate('/purchase-orders')
      return
    }

    const fetchPO = async () => {
      try {
        const fetchedPO = await window.db.getPurchaseOrderById(parseInt(poId))
        setPo(fetchedPO)
      } catch (error) {
        console.error('Failed to fetch purchase order:', error)
        toast.error('Failed to load purchase order details.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPO()
  }, [poId, navigate])

  const handleReceiveOrder = async () => {
    if (!po) return;
    if (!confirm('Are you sure you want to mark this order as received? This will add all items to your inventory and cannot be undone.')) {
      return
    }

    const toastId = toast.loading('Receiving order...');
    try {
      const updatedPO = await window.db.receivePurchaseOrder(po.id);
      setPo(updatedPO); // Update the state to reflect the new status
      toast.success('Order received successfully! Inventory has been updated.', { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to receive order: ${error.message}`, { id: toastId });
      console.error(error);
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  if (isLoading) {
    return <div className="p-4">Loading order details...</div>
  }
  if (!po) {
    return <div className="p-4">Purchase Order not found.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Orders
        </Button>
        {can('products:update') && po.status !== 'Received' && (
          <Button onClick={handleReceiveOrder}>
            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Received
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Purchase Order PO-{po.id}</CardTitle>
          <CardDescription>
            From: <span className="font-semibold">{po.supplierName}</span> | Date: {formatDate(po.orderDate)} | Status: <span className="font-semibold">{po.status}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Items on this Order</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost per Item</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.costPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.quantity * item.costPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-right text-xl font-bold">
            Total Order Cost: {formatCurrency(po.totalCost)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PurchaseOrderDetailPage