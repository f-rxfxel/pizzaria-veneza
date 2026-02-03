"use client"

import { useState, useEffect } from "react"
import { Trash2, Minus, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Order, CartItem } from "@/lib/menu-data"
import { useOrder } from "@/contexts/order-context"

interface EditOrderModalProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

const sizeLabels: Record<string, string> = {
  broto: "Broto",
  media: "Média",
  grande: "Grande",
}

export function EditOrderModal({ order, open, onOpenChange }: EditOrderModalProps) {
  const { updateOrder } = useOrder()
  const [editedItems, setEditedItems] = useState<CartItem[]>([...order.items])
  const [mesa, setMesa] = useState(order.mesa || "")
  const [cliente, setCliente] = useState(order.cliente || "")

  // Reset state when order changes or modal opens
  useEffect(() => {
    if (open) {
      setEditedItems([...order.items])
      setMesa(order.mesa || "")
      setCliente(order.cliente || "")
    }
  }, [open, order])

  const handleQuantityChange = (itemId: string, delta: number) => {
    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantidade + delta)
          return {
            ...item,
            quantidade: newQuantity,
            precoTotal: item.precoUnitario * newQuantity,
          }
        }
        return item
      })
    )
  }

  const handleObservationChange = (itemId: string, observacoes: string) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, observacoes } : item
      )
    )
  }

  const handleDeleteItem = (itemId: string) => {
    setEditedItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const calculateTotal = () => {
    return editedItems.reduce((sum, item) => sum + item.precoTotal, 0)
  }

  const handleSave = () => {
    updateOrder(order.id, {
      items: editedItems,
      mesa: mesa || undefined,
      cliente: cliente || undefined,
      total: calculateTotal(),
    })
    onOpenChange(false)
  }

  const hasChanges = () => {
    if (mesa !== (order.mesa || "")) return true
    if (cliente !== (order.cliente || "")) return true
    if (editedItems.length !== order.items.length) return true
    
    return editedItems.some((editedItem, index) => {
      const originalItem = order.items[index]
      if (!originalItem) return true
      if (editedItem.quantidade !== originalItem.quantidade) return true
      if (editedItem.observacoes !== originalItem.observacoes) return true
      return false
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Editar Pedido {order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mesa">Mesa</Label>
              <Input
                id="mesa"
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
                placeholder="Nº da mesa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Itens do Pedido</Label>
            
            {editedItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum item no pedido
              </div>
            ) : (
              <div className="space-y-3">
                {editedItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{item.nome}</span>
                          {item.tamanho && (
                            <Badge variant="outline" className="text-xs">
                              {sizeLabels[item.tamanho]}
                            </Badge>
                          )}
                        </div>
                        {item.borda && (
                          <p className="text-xs text-muted-foreground">
                            Borda: {item.borda.nome}
                          </p>
                        )}
                        {item.adicionais && item.adicionais.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            + {item.adicionais.map((a) => a.nome).join(", ")}
                          </p>
                        )}
                        {item.meioAMeio && (
                          <p className="text-xs text-muted-foreground">
                            Meio a meio: {item.meioAMeio.nome}
                          </p>
                        )}
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deseja remover "{item.nome}" do pedido?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantidade <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantidade}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="font-bold text-primary">
                        R$ {item.precoTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Observations */}
                    <div className="space-y-1">
                      <Label htmlFor={`obs-${item.id}`} className="text-xs">
                        Observações
                      </Label>
                      <Textarea
                        id={`obs-${item.id}`}
                        value={item.observacoes || ""}
                        onChange={(e) =>
                          handleObservationChange(item.id, e.target.value)
                        }
                        placeholder="Ex: Sem cebola, bem passada..."
                        className="h-16 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-secondary">
              R$ {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={editedItems.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
