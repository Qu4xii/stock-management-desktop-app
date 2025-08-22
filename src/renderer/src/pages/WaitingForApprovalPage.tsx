// File: src/renderer/src/pages/WaitingForApprovalPage.tsx

import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button' // Using your existing ShadCN button
import { LogOut, Clock } from 'lucide-react'

function WaitingForApprovalPage(): JSX.Element {
  const { logOut, currentUser } = useAuth()

  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-muted rounded-lg shadow-lg">
        <div className="flex justify-center">
          <Clock className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Registration Pending</h1>
        <p className="text-muted-foreground">
          Hello, <span className="font-semibold text-primary">{currentUser?.name || 'user'}</span>.
          Your account has been created successfully but is currently awaiting approval from a manager.
        </p>
        <p className="text-sm text-muted-foreground">
          Please check back later. You may log out and sign in again at any time to check your status.
        </p>
        <Button onClick={logOut} variant="secondary" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default WaitingForApprovalPage