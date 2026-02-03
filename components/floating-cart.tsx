"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrder } from "@/contexts/order-context"
import Link from "next/link"

export function FloatingCart() {
  const { getCartItemCount, getCartTotal } = useOrder()
  const itemCount = getCartItemCount()
  const total = getCartTotal()

  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Link href="/carrinho">
        <Button className="w-full h-14 text-base shadow-lg gap-3 justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-bold">
                {itemCount}
              </span>
            </div>
            <span>Ver Carrinho</span>
          </div>
          <span className="font-bold">R$ {total.toFixed(2)}</span>
        </Button>
      </Link>
    </div>
  )
}
