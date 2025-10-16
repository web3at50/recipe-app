/**
 * PrintButton Component
 *
 * Client component that triggers the browser's native print dialog
 * using window.print() JavaScript API.
 *
 * Features:
 * - Responsive text (hidden on mobile, visible on desktop)
 * - WCAG 2.0+ accessible (keyboard + screen reader support)
 * - Uses lucide-react Printer icon
 * - Integrates with existing shadcn/ui Button component
 *
 * @param variant - Button variant (default: outline)
 * @param size - Button size (default: default)
 * @param showText - Show text label (default: true)
 * @param className - Additional CSS classes
 */
'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface PrintButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
}

export function PrintButton({
  variant = 'outline',
  size = 'default',
  showText = true,
  className = ''
}: PrintButtonProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrint}
      aria-label="Print this recipe"
      className={className}
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      {showText && (
        <>
          <span className="hidden sm:inline ml-2">Print Recipe</span>
          <span className="sm:hidden ml-2">Print</span>
        </>
      )}
    </Button>
  )
}
