// In src/renderer/src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
// --- 1. IMPORT THE NEW AND EXISTING TYPES ---
import { DashboardStats, ChartDataPoint, DailySalesPoint, RecentPurchase, Repair } from '../types';
import { toast } from 'sonner';
// --- 2. IMPORT NEW ICONS ---
import { Users, UsersRound, DollarSign, Wrench, Warehouse, AlertCircle, Ratio, ShoppingCart } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

// (The StatCard helper component and PIE_COLORS constant remain the same as before)
const StatCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: string }) => ( <Card className="transition-all hover:border-primary/50 hover:shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle>{icon}</CardHeader><CardContent><div className="text-2xl font-bold">{value}</div>{description && <p className="text-xs text-muted-foreground">{description}</p>}</CardContent></Card> );
const PIE_COLORS = ['#3b82f6', '#84cc16', '#f97316', '#ef4444', '#a855f7', '#14b8a6'];

function DashboardPage(): JSX.Element {
  // --- 3. ADD NEW STATE FOR RECENT ACTIVITY ---
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusData, setStatusData] = useState<ChartDataPoint[]>([]);
  const [priorityData, setPriorityData] = useState<ChartDataPoint[]>([]);
  const [salesData, setSalesData] = useState<DailySalesPoint[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [recentRepairs, setRecentRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 4. UPDATE THE DATA FETCHING HOOK ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          fetchedStats,
          fetchedStatusData,
          fetchedPriorityData,
          fetchedSalesData,
          fetchedRecentPurchases,
          fetchedRecentRepairs
        ] = await Promise.all([
          window.db.getDashboardStats(),
          window.db.getWorkOrdersByStatus(),
          window.db.getWorkOrdersByPriority(),
          window.db.getDailySales(),
          window.db.getRecentPurchases(),
          window.db.getRecentRepairs()
        ]);
        setStats(fetchedStats);
        setStatusData(fetchedStatusData);
        setPriorityData(fetchedPriorityData);
        setSalesData(fetchedSalesData);
        setRecentPurchases(fetchedRecentPurchases);
        setRecentRepairs(fetchedRecentRepairs);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header and Stats Grid (no changes) */}
      <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-muted-foreground">An at-a-glance overview of your business.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={isLoading || !stats ? '...' : formatCurrency(stats.totalSales)} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Stock Value" value={isLoading || !stats ? '...' : formatCurrency(stats.stockValue)} icon={<Warehouse className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total Clients" value={isLoading || !stats ? '...' : stats.totalClients} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total Repairs" value={isLoading || !stats ? '...' : stats.totalRepairs} icon={<Wrench className="h-5 w-5 text-muted-foreground" />} />
      </div>

      {/* Main Grid for Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main line chart */}
        <div className="lg:col-span-3">
            {/* The Line Chart Card from the previous step goes here, no changes needed */}
            <Card>
                <CardHeader><CardTitle>Daily Sales (Last 7 Days)</CardTitle></CardHeader>
                <CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} /><Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))" }} formatter={(value: number) => formatCurrency(value)} /><Line type="monotone" dataKey="totalSales" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></CardContent>
            </Card>
        </div>

        {/* --- 5. ADD THE NEW RECENT ACTIVITY SECTION --- */}
        
        {/* Recent Purchases Card */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader><CardTitle>Recent Purchases</CardTitle><CardDescription>The last 5 sales recorded in the system.</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? <p>Loading...</p> : recentPurchases.length > 0 ? recentPurchases.map((purchase) => (
                            <div key={`pur-${purchase.id}`} className="flex items-center">
                                <Avatar className="h-9 w-9"><AvatarFallback><ShoppingCart className="h-4 w-4" /></AvatarFallback></Avatar>
                                <div className="ml-4 space-y-1"><p className="text-sm font-medium leading-none">{purchase.clientName}</p><p className="text-sm text-muted-foreground truncate max-w-xs">{purchase.products}</p></div>
                                <div className="ml-auto font-medium">{formatCurrency(purchase.total_price)}</div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No recent purchases found.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* Work Orders by Status Pie Chart */}
        <div className="lg:col-span-1">
            <Card>
                <CardHeader><CardTitle>Work Orders by Status</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={3} cornerRadius={5}>{statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))" }} /><Legend /></PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        {/* Recent Repairs Card */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader><CardTitle>Recent Repairs</CardTitle><CardDescription>The last 5 work orders created.</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? <p>Loading...</p> : recentRepairs.length > 0 ? recentRepairs.map((repair) => (
                            <div key={`rep-${repair.id}`} className="flex items-center">
                                <Avatar className="h-9 w-9"><AvatarFallback><Wrench className="h-4 w-4" /></AvatarFallback></Avatar>
                                <div className="ml-4 space-y-1"><p className="text-sm font-medium leading-none">{repair.clientName}</p><p className="text-sm text-muted-foreground truncate max-w-xs">{repair.description}</p></div>
                                <div className="ml-auto font-medium">{repair.status}</div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No recent repairs found.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* Work Orders by Priority Pie Chart */}
        <div className="lg:col-span-1">
            <Card>
                <CardHeader><CardTitle>Work Orders by Priority</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={3} cornerRadius={5}>{priorityData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))" }} /><Legend /></PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;