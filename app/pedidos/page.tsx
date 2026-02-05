"use client"

import React, { useState, useRef } from "react"
import {
  ArrowLeft,
  Clock,
  ChefHat,
  CheckCircle2,
  Truck,
  ClipboardList,
  Printer,
  Pencil,
  ChevronRight,
  GripVertical,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useOrder } from "@/contexts/order-context"
import { Header } from "@/components/header"
import { ReceiptModal } from "@/components/receipt-modal"
import { EditOrderModal } from "@/components/edit-order-modal"
import type { Order, OrderStatus } from "@/lib/menu-data"
import { cn } from "@/lib/utils"

const statusConfig: Record<OrderStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; borderColor: string }> = {
  pendente: { 
    label: "Pendente", 
    icon: Clock, 
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800"
  },
  em_preparo: { 
    label: "Em Preparo", 
    icon: ChefHat, 
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  pronto: { 
    label: "Pronto", 
    icon: CheckCircle2, 
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800"
  },
  entregue: { 
    label: "Entregue", 
    icon: Truck, 
    color: "bg-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    borderColor: "border-gray-200 dark:border-gray-800"
  },
}

const statusOrder: OrderStatus[] = ["pendente", "em_preparo", "pronto", "entregue"]

const sizeLabels: Record<string, string> = {
  broto: "Broto",
  media: "Média",
  grande: "Grande",
}

function KanbanColumn({ 
  status, 
  orders, 
  onAdvance,
  onPrint,
  onEdit,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
}: { 
  status: OrderStatus
  orders: Order[]
  onAdvance: (orderId: string, newStatus: OrderStatus) => void
  onPrint: (order: Order) => void
  onEdit: (order: Order) => void
  onDragStart: (orderId: string) => void
  onDragEnd: () => void
  onDrop: (status: OrderStatus) => void
  isDragOver: boolean
  onDragOver: (e: React.DragEvent, status: OrderStatus) => void
  onDragLeave: () => void
}) {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const currentIndex = statusOrder.indexOf(status)
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null

  const handlePrintDirect = (order: Order) => {
    const printWindow = window.open("", "", "width=400,height=600")
    if (!printWindow) return

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            margin: 0 auto;
            padding: 8mm;
          }
          .header { text-align: center; margin-bottom: 12px; }
          .header img { height: 60px; width: auto; object-fit: contain; }
          .order-id { font-weight: bold; font-size: 14px; text-align: center; }
          .order-date { font-size: 10px; color: #666; text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .item { margin: 8px 0; }
          .item-name { font-weight: bold; }
          .item-details { font-size: 11px; color: #666; }
          .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 12px; }
          .footer { text-align: center; margin-top: 16px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo-veneza.png" />
        </div>
        <div class="order-id">${order.id}</div>
        <div class="order-date">${order.createdAt.toLocaleString("pt-BR")}</div>
        ${order.mesa ? `<div class="item-details">Mesa: ${order.mesa}</div>` : ""}
        ${order.cliente ? `<div class="item-details">Cliente: ${order.cliente}</div>` : ""}
        <div class="divider"></div>
        ${order.items.map(item => `
          <div class="item">
            <div class="item-name">${item.quantidade}x ${item.nome}</div>
            ${item.tamanho ? `<div class="item-details">${sizeLabels[item.tamanho]}</div>` : ""}
            ${item.borda ? `<div class="item-details">Borda: ${item.borda.nome}</div>` : ""}
            ${item.adicionais && item.adicionais.length > 0 ? `<div class="item-details">+ ${item.adicionais.map(a => a.nome).join(", ")}</div>` : ""}
            ${item.observacoes ? `<div class="item-details" style="color: #c41e3a; font-style: italic;">Obs: ${item.observacoes}</div>` : ""}
            <div style="text-align: right; font-size: 11px;">R$ ${item.precoTotal.toFixed(2)}</div>
          </div>
        `).join("")}
        <div class="divider"></div>
        <div class="total">R$ ${order.total.toFixed(2)}</div>
      </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)

    // Move order to "em_preparo" status
    if (status !== "em_preparo" && status !== "pronto" && status !== "entregue") {
      onAdvance(order.id, "em_preparo")
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-col flex-1 min-w-[280px] max-w-[350px] rounded-xl border-2 h-full transition-all duration-200",
        config.borderColor,
        config.bgColor,
        isDragOver && "ring-2 ring-primary ring-offset-2 scale-[1.02]"
      )}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(status)
      }}
    >
      {/* Column Header */}
      <div className={cn(
        "flex items-center gap-2 p-3 border-b-2",
        config.borderColor
      )}>
        <div className={cn("p-1.5 rounded-lg", config.color)}>
          <StatusIcon className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-semibold text-foreground">{config.label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {orders.length}
        </Badge>
      </div>

      {/* Orders List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum pedido
          </div>
        ) : (
          orders.map((order) => (
            <Card 
              key={order.id} 
              className="shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move"
                onDragStart(order.id)
              }}
              onDragEnd={onDragEnd}
            >
              <CardContent className="p-3">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-sm">{order.id}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Customer Info */}
                {(order.mesa || order.cliente) && (
                  <div className="flex flex-wrap gap-2 mb-2 text-xs">
                    {order.mesa && (
                      <Badge variant="outline" className="text-xs">
                        Mesa {order.mesa}
                      </Badge>
                    )}
                    {order.cliente && (
                      <span className="text-muted-foreground">{order.cliente}</span>
                    )}
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-xs text-muted-foreground flex justify-between">
                      <span className="truncate flex-1">
                        {item.quantidade}x {item.nome}
                        {item.tamanho && ` (${sizeLabels[item.tamanho]})`}
                      </span>
                      <span className="ml-2">R$ {item.precoTotal.toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{order.items.length - 3} itens
                    </span>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-2 border-t border-border">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold text-secondary">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => onEdit(order)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => handlePrintDirect(order)}
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Imprimir
                  </Button>
                </div>

                {/* Advance Button */}
                {nextStatus && (
                  <Button
                    size="sm"
                    className="w-full mt-2 h-9 bg-secondary hover:bg-secondary/90"
                    onClick={() => onAdvance(order.id, nextStatus)}
                  >
                    <span>Mover para {statusConfig[nextStatus].label}</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function OrdersContent() {
  const { orders, updateOrderStatus, getOrderById } = useOrder()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<OrderStatus | null>(null)

  const selectedOrder = selectedOrderId ? getOrderById(selectedOrderId) : null

  const handleDragStart = (orderId: string) => {
    setDraggingOrderId(orderId)
  }

  const handleDragEnd = () => {
    setDraggingOrderId(null)
    setDragOverStatus(null)
  }

  const handleDragOver = (e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault()
    if (dragOverStatus !== status) {
      setDragOverStatus(status)
    }
  }

  const handleDragLeave = () => {
    setDragOverStatus(null)
  }

  const handleDrop = (newStatus: OrderStatus) => {
    if (draggingOrderId) {
      updateOrderStatus(draggingOrderId, newStatus)
      setDraggingOrderId(null)
      setDragOverStatus(null)
    }
  }

  const handlePrint = (order: Order) => {
    setSelectedOrderId(order.id)
    setReceiptOpen(true)
  }

  const handleEdit = (order: Order) => {
    setSelectedOrderId(order.id)
    setEditOpen(true)
  }

  const handleAdvance = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
  }

  // Group orders by status
  const ordersByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status)
    return acc
  }, {} as Record<OrderStatus, Order[]>)

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ClipboardList className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Nenhum pedido ainda
        </h2>
        <p className="text-muted-foreground mb-6">
          Os pedidos finalizados aparecerão aqui
        </p>
        <Link href="/">
          <Button size="lg">Fazer Pedido</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Kanban Board */}
      <div className="flex-1 p-4 overflow-x-auto">
        <div className="flex gap-4 h-full">
          {statusOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              orders={ordersByStatus[status]}
              onAdvance={handleAdvance}
              onPrint={handlePrint}
              onEdit={handleEdit}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDragOver={dragOverStatus === status}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <>
          <ReceiptModal
            order={selectedOrder}
            open={receiptOpen}
            onOpenChange={setReceiptOpen}
          />
          <EditOrderModal
            order={selectedOrder}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        </>
      )}
    </div>
  )
}

export default function PedidosPage() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Painel de Pedidos</h1>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <OrdersContent />
      </div>
    </div>
  )
}
