// File: src/renderer/src/components/dashboards/InventoryDashboard.tsx

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { StaffMember, InventoryStats, Product } from '../../types'
import { toast } from 'sonner'
import { Package, Warehouse, DollarSign, AlertTriangle, PackageX, ListOrdered } from 'lucide-react'

// Helper component for KPI cards
const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

interface DashboardProps {
  user: StaffMember
}

function InventoryDashboard({ user }: DashboardProps): JSX.Element {
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const [fetchedStats, fetchedLowStock] = await Promise.all([
          window.db.getInventoryStats(),
          window.db.getLowStockProducts()
        ])
        setStats(fetchedStats)
        setLowStockProducts(fetchedLowStock)
      } catch (error) {
        console.error('Failed to fetch inventory dashboard data:', error)
        toast.error('Could not load inventory data.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInventoryData()
  }, [])

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h1>
        <p className="text-muted-foreground">Manage and monitor product stock levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Stock Value" value={isLoading ? '...' : formatCurrency(stats?.stockValue ?? 0)} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total SKUs" value={isLoading ? '...' : stats?.totalSKUs ?? 0} icon={<Package className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total Units" value={isLoading ? '...' : stats?.totalUnits ?? 0} icon={<Warehouse className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Low Stock Items" value={isLoading ? '...' : stats?.lowStockCount ?? 0} icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Report</CardTitle>
          <CardDescription>Products with 5 or fewer units in stock. Items at zero are highlighted.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? ( <p>Loading report...</p> ) : lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">Price: {formatCurrency(product.price)}</p>
                  </div>
                  <Badge variant={product.quantity === 0 ? 'destructive' : 'secondary'}>
                    {product.quantity} Units Left
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <PackageX className="h-8 w-8 text-muted-foreground mb-2"/>
                <p className="font-semibold">Stock levels are healthy!</p>
                <p className="text-sm text-muted-foreground">There are no items with low stock.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InventoryDashboard