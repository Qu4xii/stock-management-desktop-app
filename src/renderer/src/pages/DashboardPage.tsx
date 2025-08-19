// In src/renderer/src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DashboardStats } from '../types';
import { toast } from 'sonner';
import { Users, UsersRound, DollarSign, Wrench, Warehouse, AlertCircle, Ratio } from 'lucide-react';

// A helper component for the stat cards to reduce repetition
const StatCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

function DashboardPage(): JSX.Element {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchedStats = await window.db.getDashboardStats();
        setStats(fetchedStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Helper for formatting currency
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Sales"
          value={isLoading || !stats ? '...' : formatCurrency(stats.totalSales)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total revenue from all sales"
        />
        <StatCard 
          title="Total Clients"
          value={isLoading || !stats ? '...' : stats.totalClients.toLocaleString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Total number of registered clients"
        />
        <StatCard 
          title="Total Workers"
          value={isLoading || !stats ? '...' : stats.totalStaff.toLocaleString()}
          icon={<UsersRound className="h-4 w-4 text-muted-foreground" />}
          description="Total number of staff members"
        />
        <StatCard 
          title="Total Repairs"
          value={isLoading || !stats ? '...' : stats.totalRepairs.toLocaleString()}
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          description="Total completed & ongoing repairs"
        />
        <StatCard 
          title="Stock Value"
          value={isLoading || !stats ? '...' : formatCurrency(stats.stockValue)}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          description="Total value of all products"
        />
        <StatCard 
          title="Out of Stock Items"
          value={isLoading || !stats ? '...' : stats.outOfStockCount}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
          description="Products with zero quantity"
        />
        <StatCard 
          title="Stock to Sales Ratio"
          value={isLoading || !stats ? '...' : stats.stockToSalesRatio.toFixed(2)}
          icon={<Ratio className="h-4 w-4 text-muted-foreground" />}
          description="Value of stock vs. total sales"
        />
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Activity Overview</h2>
        <Card className="h-96">
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Main graph will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;