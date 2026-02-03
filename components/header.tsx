
"use client"

import React from "react"
import { Pizza, ShoppingCart, ClipboardList, User, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useOrder } from "@/contexts/order-context"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Header() {
  const { getCartItemCount, getCartTotal, orders } = useOrder()
  const cartCount = getCartItemCount()
  const cartTotal = getCartTotal()
  const ordersCount = orders.filter(order => order.status !== "entregue" && order.status !== "pronto").length

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      {/* Main Header */}
      <div className="flex h-14 items-center justify-between px-3 gap-2">
        <Link href="/" className="flex items-center shrink-0">
          <div className="relative h-8 w-24">
            <Image 
              src="/logo-veneza.png" 
              alt="Pizzaria Veneza" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/pedidos">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <ClipboardList className="h-5 w-5" />
              {ordersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-[10px] flex items-center justify-center font-bold border-2 border-background">
                  {ordersCount > 9 ? "9+" : ordersCount}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/carrinho">
            <Button 
              variant="default" 
              size="sm" 
              className={cn(
                "relative gap-1.5 h-9 transition-all bg-secondary hover:bg-secondary/90",
                cartCount > 0 ? "pl-3 pr-3" : "px-3"
              )}
            >
              <div className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-secondary-foreground text-[10px] flex items-center justify-center font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              {cartCount > 0 && (
                <span className="font-semibold text-sm hidden xs:inline">
                  R$ {cartTotal.toFixed(2)}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
