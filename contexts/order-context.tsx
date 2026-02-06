"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { CartItem, Order, OrderStatus } from "@/lib/menu-data"

interface OrderContextType {
  cart: CartItem[]
  orders: Order[]
  mesa: string
  cliente: string
  setMesa: (mesa: string) => void
  setCliente: (cliente: string) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
  createOrder: () => Order | null
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  deleteOrder: (orderId: string) => void
  deleteOrderItem: (orderId: string, itemId: string) => void
  updateOrderItem: (orderId: string, itemId: string, updates: Partial<CartItem>) => void
  getOrderById: (orderId: string) => Order | undefined
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [mesa, setMesa] = useState("")
  const [cliente, setCliente] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load orders and cart from localStorage on mount
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem("pizzaria-orders")
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders).map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
        }))
        setOrders(parsedOrders)
      }

      const storedCart = localStorage.getItem("pizzaria-cart")
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart)
        setCart(parsedCart)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("pizzaria-orders", JSON.stringify(orders))
      } catch (error) {
        console.error("Erro ao salvar pedidos:", error)
      }
    }
  }, [orders, isLoaded])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("pizzaria-cart", JSON.stringify(cart))
      } catch (error) {
        console.error("Erro ao salvar carrinho:", error)
      }
    }
  }, [cart, isLoaded])

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => [...prev, item])
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const updateCartItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantidade: quantity, precoTotal: item.precoUnitario * quantity }
          : item
      )
    )
  }, [removeFromCart])

  const updateCartItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, ...updates }
          // Recalculate total if precoUnitario or quantidade changed
          if (updates.precoUnitario !== undefined || updates.quantidade !== undefined) {
            updatedItem.precoTotal = updatedItem.precoUnitario * updatedItem.quantidade
          }
          return updatedItem
        }
        return item
      })
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.precoTotal, 0)
  }, [cart])

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantidade, 0)
  }, [cart])

  const createOrder = useCallback(() => {
    if (cart.length === 0) return null

    const newOrder: Order = {
      id: `PED-${Date.now().toString(36).toUpperCase()}`,
      mesa: mesa || undefined,
      cliente: cliente || undefined,
      items: [...cart],
      total: getCartTotal(),
      status: "pendente",
      createdAt: new Date(),
    }

    setOrders((prev) => {
      const updated = [...prev, newOrder]
      try {
        localStorage.setItem("pizzaria-orders", JSON.stringify(updated))
      } catch (error) {
        console.error("Erro ao salvar pedido:", error)
      }
      return updated
    })
    clearCart()
    return newOrder
  }, [cart, mesa, cliente, getCartTotal, clearCart])

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    )
  }, [])

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, ...updates }
          // Recalculate total if items changed
          if (updates.items) {
            updatedOrder.total = updates.items.reduce((sum, item) => sum + item.precoTotal, 0)
          }
          return updatedOrder
        }
        return order
      })
    )
  }, [])

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
  }, [])

  const deleteOrderItem = useCallback((orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newItems = order.items.filter((item) => item.id !== itemId)
          return {
            ...order,
            items: newItems,
            total: newItems.reduce((sum, item) => sum + item.precoTotal, 0),
          }
        }
        return order
      })
    )
  }, [])

  const updateOrderItem = useCallback((orderId: string, itemId: string, updates: Partial<CartItem>) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newItems = order.items.map((item) => {
            if (item.id === itemId) {
              const updatedItem = { ...item, ...updates }
              // Recalculate item total if quantity changed
              if (updates.quantidade !== undefined) {
                updatedItem.precoTotal = updatedItem.precoUnitario * updates.quantidade
              }
              return updatedItem
            }
            return item
          })
          return {
            ...order,
            items: newItems,
            total: newItems.reduce((sum, item) => sum + item.precoTotal, 0),
          }
        }
        return order
      })
    )
  }, [])

  const getOrderById = useCallback(
    (orderId: string) => {
      return orders.find((order) => order.id === orderId)
    },
    [orders]
  )

  return (
    <OrderContext.Provider
      value={{
        cart,
        orders,
        mesa,
        cliente,
        setMesa,
        setCliente,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        updateCartItem,
        clearCart,
        getCartTotal,
        getCartItemCount,
        createOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        deleteOrderItem,
        updateOrderItem,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider")
  }
  return context
}
