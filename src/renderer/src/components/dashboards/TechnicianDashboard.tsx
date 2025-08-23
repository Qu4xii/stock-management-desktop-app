import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { StaffMember, TechnicianStats, ChartDataPoint, ActiveRepair, RepairPriority } from '../../types'
import { toast } from 'sonner'
import { Wrench, CheckCircle, AlertTriangle, ListTodo } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// A small helper component for the KPI cards
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

// Colors for the pie chart
const PIE_COLORS = ['#3b82f6', '#f97316', '#a855f7', '#14b8a6']

// A mapping to style the priority badges automatically
const priorityVariantMap: { [key in RepairPriority]: 'secondary' | 'default' | 'destructive' } = {
  Low: 'secondary',
  Medium: 'default',
  High: 'destructive',
  Urgent: 'destructive'
}

interface DashboardProps {
  user: StaffMember
}

function TechnicianDashboard({ user }: DashboardProps): JSX.Element {
  // State for storing technician-specific data
  const [stats, setStats] = useState<TechnicianStats | null>(null)
  const [statusData, setStatusData] = useState<ChartDataPoint[]>([])
  const [activeRepairs, setActiveRepairs] = useState<ActiveRepair[]>([])
  const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
    const fetchTechData = async () => {
      try {
        // --- [DEBUG] Log that the fetch process is starting ---
        console.log('[TechnicianDashboard] Starting to fetch data for user:', user.name);

        const [fetchedStats, fetchedStatusData, fetchedActiveRepairs] = await Promise.all([
          window.db.getTechnicianStats(),
          window.db.getTechnicianWorkOrdersByStatus(),
          window.db.getActiveRepairsForStaff()
        ]);

        // --- [DEBUG] Log the data that was received from the backend ---
        console.log('[TechnicianDashboard] Received Stats:', fetchedStats);
        console.log('[TechnicianDashboard] Received Status Data:', fetchedStatusData);
        console.log('[TechnicianDashboard] Received Active Repairs:', fetchedActiveRepairs);

        setStats(fetchedStats);
        setStatusData(fetchedStatusData);
        setActiveRepairs(fetchedActiveRepairs);

      } catch (error) {
        // --- [CRITICAL DEBUG] This will show any error message from the backend ---
        console.error('!!! [TechnicianDashboard] FAILED TO FETCH DATA:', error);
        toast.error('Could not load your dashboard data. Check the console for errors.');

      } finally {
        setIsLoading(false);
      }
    };
    fetchTechData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.name}. Here are your current assignments and stats.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Assignments" value={isLoading ? '...' : stats?.activeAssigned ?? 0} icon={<Wrench className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Overdue Tasks" value={isLoading ? '...' : stats?.overdue ?? 0} icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total Completed" value={isLoading ? '...' : stats?.totalCompleted ?? 0} icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Active Assignments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Active Assignments</CardTitle>
              <CardDescription>All work orders currently assigned to you that are not completed.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? ( <p>Loading...</p> ) : activeRepairs.length > 0 ? (
                  activeRepairs.map((repair) => (
                    <div key={repair.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{repair.clientName}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-sm">{repair.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={priorityVariantMap[repair.priority]} className="mb-1">{repair.priority}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(repair.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <ListTodo className="h-8 w-8 text-muted-foreground mb-2"/>
                    <p className="font-semibold">All caught up!</p>
                    <p className="text-sm text-muted-foreground">You have no active assignments.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments by Status Pie Chart */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Assignments by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? ( <p>Loading chart...</p> ) : statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={3} cornerRadius={5}>
                      {statusData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">No active assignments to display.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TechnicianDashboard