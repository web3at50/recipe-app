'use client'

import { UserButton } from '@clerk/nextjs'
import { Settings, Package } from 'lucide-react'

export function UserButtonWithLinks() {
  return (
    <UserButton afterSignOutUrl="/">
      <UserButton.MenuItems>
        <UserButton.Link
          label="Settings & Preferences"
          labelIcon={<Settings className="h-4 w-4" />}
          href="/settings"
        />
        <UserButton.Link
          label="My Pantry Staples"
          labelIcon={<Package className="h-4 w-4" />}
          href="/settings/pantry-staples"
        />
      </UserButton.MenuItems>
    </UserButton>
  )
}
