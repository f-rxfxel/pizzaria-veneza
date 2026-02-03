"use client"

import { useState } from "react"
import { ArrowLeft, Trash2, Minus, Plus, Printer, ShoppingBag, Pencil } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useOrder } from "@/contexts/order-context"
import { Header } from "@/components/header"
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
import { ReceiptModal } from "@/components/receipt-modal"
import { EditCartItemModal } from "@/components/edit-cart-item-modal"
import type { CartItem } from "@/lib/menu-data"

function CartContent() {
  const {
    cart,
    mesa,
    cliente,
    setMesa,
    setCliente,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    createOrder,
  } = useOrder()

  const [showReceipt, setShowReceipt] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<ReturnType<typeof createOrder>>(null)
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)

  const handleFinishOrder = () => {
    const order = createOrder()
    if (order) {
      setCurrentOrder(order)
      setShowReceipt(true)
      // Limpar identificação após criar o pedido
      setMesa("")
      setCliente("")
    }
  }

  const total = getCartTotal()

  const sizeLabels: Record<string, string> = {
    broto: "Broto",
    media: "Média",
    grande: "Grande",
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Seu carrinho está vazio
        </h2>
        <p className="text-muted-foreground mb-6">
          Adicione itens do cardápio para começar seu pedido
        </p>
        <div className="flex gap-3">
          <Link href="/">
            <Button size="lg">Ver Cardápio</Button>
          </Link>
          <Link href="/pedidos">
            <Button size="lg" variant="outline">Ver Pedidos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 py-4 space-y-4 pb-32">
        {/* Identification Form */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Identificação do Pedido</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Mesa</label>
                <input
                  type="text"
                  placeholder="Ex: 01, 02, Balcão..."
                  value={mesa}
                  onChange={(e) => setMesa(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Cliente</label>
                <input
                  type="text"
                  placeholder="Nome do cliente..."
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info Display */}
        {(mesa || cliente) && (
          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                {mesa && (
                  <div>
                    <span className="text-sm text-muted-foreground">Mesa</span>
                    <p className="font-bold text-foreground">{mesa}</p>
                  </div>
                )}
                {cliente && (
                  <div>
                    <span className="text-sm text-muted-foreground">Cliente</span>
                    <p className="font-bold text-foreground">{cliente}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{item.nome}</h3>
                      {item.tamanho && (
                        <Badge variant="secondary" className="text-xs">
                          {sizeLabels[item.tamanho]}
                        </Badge>
                      )}
                    </div>

                    {item.borda && (
                      <p className="text-sm text-muted-foreground">
                        Borda: {item.borda.nome}
                      </p>
                    )}

                    {item.adicionais && item.adicionais.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        + {item.adicionais.map((a) => a.nome).join(", ")}
                      </p>
                    )}

                    {item.observacoes && (
                      <p className="text-sm text-primary italic mt-1">
                        Obs: {item.observacoes}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground mt-1">
                      R$ {item.precoUnitario.toFixed(2)} cada
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantidade - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-medium">
                        {item.quantidade}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantidade + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="font-bold text-foreground">
                      R$ {item.precoTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clear Cart */}
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Carrinho
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar carrinho?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os itens serão removidos. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearCart}>Limpar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">
              R$ {total.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full h-14 text-lg"
            onClick={handleFinishOrder}
          >
            <Printer className="h-5 w-5 mr-2" />
            Finalizar Pedido
          </Button>
        </div>
      </div>

      {/* Receipt Modal */}
      {currentOrder && (
        <ReceiptModal
          order={currentOrder}
          open={showReceipt}
          onOpenChange={setShowReceipt}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditCartItemModal
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </>
  )
}

export default function CarrinhoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Carrinho</h1>
        </div>
      </div>
      <CartContent />
    </div>
  )
}
