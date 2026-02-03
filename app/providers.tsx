"use client"

import { OrderProvider } from "@/contexts/order-context"
import { ToastProvider } from "@/components/cart-toast"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OrderProvider>
      <ToastProvider>{children}</ToastProvider>
    </OrderProvider>
  )
}
