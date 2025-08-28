// File: src/renderer/src/components/dashboards/DefaultDashboard.tsx

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { StaffMember } from '../../types'

interface DashboardProps {
  user: StaffMember
}

function DefaultDashboard({ user }: DashboardProps): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Hello, {user.name}!</div>
          <p className="text-xs text-muted-foreground">
            Your dashboard is ready. Use the sidebar to navigate to your tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefaultDashboard