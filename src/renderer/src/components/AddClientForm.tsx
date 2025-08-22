// File: src/renderer/src/components/AddClientForm.tsx

import React, { useState } from 'react'
import { Client } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface AddClientFormProps {
  onClientAdded: (clientData: Omit<Client, 'id' | 'picture'>) => void
}

function AddClientForm({ onClientAdded }: AddClientFormProps): JSX.Element {
  const [name, setName] = useState('')
  const [idCard, setIdCard] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name || !idCard || !email) {
      // Using toast for consistency is better than alert()
      toast.error('Please fill out at least Name, ID Card, and Email.')
      return
    }
    onClientAdded({ name, idCard, address, email, phone })
  }

  return (
    // This structure is more idiomatic for ShadCN forms.
    // Each form item is a div containing a Label and an Input.
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="idCard">ID Card Number</Label>
        <Input id="idCard" type="text" value={idCard} onChange={(e) => setIdCard(e.target.value)} required />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="col-span-full grid w-full items-center gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <Button type="submit" className="w-full mt-4 col-span-full">
        Save Client
      </Button>
    </form>
  )
}

// We'll need to import toast if we use it. If not, the alert is fine.
import { toast } from 'sonner'
export default AddClientForm