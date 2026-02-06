"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Trash2,
  Plus,
  Save,
  X,
  Search,
  ShoppingBag,
  Pizza,
  Wine,
  CupSoda,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Order, CartItem, PizzaItem, PizzaSize } from "@/lib/menu-data"
import { menuData } from "@/lib/menu-data"
import { useOrder } from "@/contexts/order-context"
import { cn } from "@/lib/utils"

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

type AddItemTab = "items" | "menu"

// Flatten all menu items into a searchable list
type MenuItem = {
  id: string
  nome: string
  tipo: "pizza" | "panqueca" | "bebida" | "caipirinha"
  preco?: number
  precos?: { broto: number; media: number; grande: number }
  ingredientes?: string
  categoria: string
}

function getAllMenuItems(): MenuItem[] {
  const items: MenuItem[] = []

  for (const cat of menuData.categorias) {
    for (const pizza of cat.itens as PizzaItem[]) {
      items.push({
        id: pizza.id,
        nome: pizza.nome,
        tipo: "pizza",
        precos: pizza.precos,
        ingredientes: pizza.ingredientes,
        categoria: cat.nome,
      })
    }
  }

  for (const p of menuData.panquecas) {
    items.push({
      id: `panqueca-${p.nome}`,
      nome: p.nome,
      tipo: "panqueca",
      preco: p.preco,
      categoria: "Panquecas",
    })
  }

  for (const r of menuData.bebidas.refrigerantes) {
    items.push({
      id: `refri-${r.nome}`,
      nome: r.nome,
      tipo: "bebida",
      preco: r.preco,
      categoria: "Refrigerantes",
    })
  }

  for (const a of menuData.bebidas.agua) {
    items.push({
      id: `agua-${a.nome}`,
      nome: a.nome,
      tipo: "bebida",
      preco: a.preco,
      categoria: "Água",
    })
  }

  for (const c of menuData.bebidas.cervejas) {
    items.push({
      id: `cerveja-${c.nome}`,
      nome: c.nome,
      tipo: "bebida",
      preco: c.preco,
      categoria: "Cervejas",
    })
  }

  for (const sabor of menuData.bebidas.sucos_naturais.sabores) {
    items.push({
      id: `suco-${sabor}`,
      nome: `Suco de ${sabor}`,
      tipo: "bebida",
      preco: menuData.bebidas.sucos_naturais.preco_base,
      categoria: "Sucos Naturais",
    })
  }
  for (const suco of menuData.bebidas.sucos_naturais.sabores_especiais) {
    items.push({
      id: `suco-${suco.nome}`,
      nome: `Suco de ${suco.nome}`,
      tipo: "bebida",
      preco: suco.preco,
      categoria: "Sucos Naturais",
    })
  }

  for (const sabor of menuData.bebidas.del_valle.sabores) {
    items.push({
      id: `delvalle-${sabor}`,
      nome: `Del Valle ${sabor}`,
      tipo: "bebida",
      preco: menuData.bebidas.del_valle.preco,
      categoria: "Del Valle",
    })
  }

  for (const s of menuData.bebidas.sucos_lata) {
    items.push({
      id: `sucolata-${s.nome}`,
      nome: s.nome,
      tipo: "bebida",
      preco: s.preco,
      categoria: "Sucos Lata",
    })
  }

  return items
}

function AddItemSection({ onAddItem }: { onAddItem: (item: CartItem) => void }) {
  const allMenuItems = useMemo(() => getAllMenuItems(), [])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPizzaSize, setSelectedPizzaSize] = useState<PizzaSize>("media")

  const categories = useMemo(() => {
    const cats = new Set(allMenuItems.map((i) => i.categoria))
    return ["all", ...Array.from(cats)]
  }, [allMenuItems])

  const filtered = useMemo(() => {
    let result = allMenuItems
    if (selectedCategory !== "all") {
      result = result.filter((i) => i.categoria === selectedCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.nome.toLowerCase().includes(q) ||
          i.ingredientes?.toLowerCase().includes(q) ||
          i.categoria.toLowerCase().includes(q)
      )
    }
    return result
  }, [allMenuItems, search, selectedCategory])

  const categoryIcons: Record<string, React.ReactNode> = {
    "Pizzas Salgadas": <Pizza className="h-3 w-3" />,
    "Pizzas Doces": <Pizza className="h-3 w-3" />,
    "Refrigerantes": <CupSoda className="h-3 w-3" />,
    "Cervejas": <Wine className="h-3 w-3" />,
    "Panquecas": <UtensilsCrossed className="h-3 w-3" />,
  }

  const handleQuickAdd = (menuItem: MenuItem) => {
    const price = menuItem.tipo === "pizza"
      ? menuItem.precos![selectedPizzaSize]
      : menuItem.preco!

    const newItem: CartItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tipo: menuItem.tipo,
      nome: menuItem.nome,
      tamanho: menuItem.tipo === "pizza" ? selectedPizzaSize : undefined,
      quantidade: 1,
      precoUnitario: price,
      precoTotal: price,
    }

    onAddItem(newItem)
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar no cardápio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs transition-all",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => setSelectedCategory(cat)}
          >
            {categoryIcons[cat]}
            {cat === "all" ? "Todos" : cat}
          </Badge>
        ))}
      </div>

      {/* Pizza size selector */}
      {(selectedCategory === "all" ||
        selectedCategory === "Pizzas Salgadas" ||
        selectedCategory === "Pizzas Doces") && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Tamanho pizza:</span>
          <div className="flex gap-1">
            {(["broto", "media", "grande"] as PizzaSize[]).map((size) => (
              <Badge
                key={size}
                variant={selectedPizzaSize === size ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  selectedPizzaSize === size
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => setSelectedPizzaSize(size)}
              >
                {sizeLabels[size]}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="h-60 overflow-y-auto pr-1">
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum item encontrado
            </div>
          ) : (
            filtered.map((menuItem) => {
              const price =
                menuItem.tipo === "pizza"
                  ? menuItem.precos![selectedPizzaSize]
                  : menuItem.preco!

              return (
                <div
                  key={menuItem.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all group"
                >
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {menuItem.nome}
                      </span>
                      {menuItem.tipo === "pizza" && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {sizeLabels[selectedPizzaSize]}
                        </Badge>
                      )}
                    </div>
                    {menuItem.ingredientes && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {menuItem.ingredientes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap shrink-0">
                    R$ {price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 min-w-8 p-0 shrink-0"
                    onClick={() => handleQuickAdd(menuItem)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export function EditOrderModal({ order, open, onOpenChange }: EditOrderModalProps) {
  const { updateOrder } = useOrder()
  const [editedItems, setEditedItems] = useState<CartItem[]>([...order.items])
  const [mesa, setMesa] = useState(order.mesa || "")
  const [cliente, setCliente] = useState(order.cliente || "")
  const [activeTab, setActiveTab] = useState<AddItemTab>("items")
  const [expandedObs, setExpandedObs] = useState<string | null>(null)

  // Reset state when order changes or modal opens
  useEffect(() => {
    if (open) {
      setEditedItems([...order.items])
      setMesa(order.mesa || "")
      setCliente(order.cliente || "")
      setActiveTab("items")
      setExpandedObs(null)
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

  const handleAddItem = (item: CartItem) => {
    setEditedItems((prev) => [...prev, item])
    setActiveTab("items")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Editar Pedido
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs font-mono">
                  {order.id}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {order.createdAt.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info - Compact */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="relative">
              <Input
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
                placeholder="Nº da mesa"
                className="h-9 text-sm pl-14"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                Mesa
              </span>
            </div>
            <div className="relative">
              <Input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome"
                className="h-9 text-sm pl-16"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                Cliente
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AddItemTab)} className="flex flex-col h-full">
            <div className="px-6 pt-3 shrink-0">
              <TabsList className="w-full grid grid-cols-2 h-9">
                <TabsTrigger value="items" className="text-sm gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Itens ({editedItems.length})
                </TabsTrigger>
                <TabsTrigger value="menu" className="text-sm gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Item
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Items Tab */}
            <TabsContent value="items" className="flex-1 overflow-hidden mt-0 px-6 py-3">
              <ScrollArea className="h-full pr-2">
                {editedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Nenhum item no pedido
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("menu")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 pb-2">
                    {editedItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md"
                      >
                        {/* Item main row */}
                        <div className="flex items-center gap-3 p-3">
                          {/* Quantity control - compact */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <span className="w-7 h-7 flex items-center justify-center text-sm font-bold bg-primary/10 text-primary rounded-lg">
                              {item.quantidade}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantidade <= 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Item info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-sm">{item.nome}</span>
                              {item.tamanho && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {sizeLabels[item.tamanho]}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                              {item.borda && item.borda.preco > 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                  Borda: {item.borda.nome}
                                </span>
                              )}
                              {item.adicionais && item.adicionais.length > 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                  + {item.adicionais.map((a) => a.nome).join(", ")}
                                </span>
                              )}
                              {item.isHalfHalf && item.segundaMetade && (
                                <span className="text-[11px] text-muted-foreground">
                                  ½ {item.segundaMetade.nome}
                                </span>
                              )}
                            </div>
                            {item.observacoes && (
                              <p className="text-[11px] text-primary italic mt-0.5 truncate">
                                {item.observacoes}
                              </p>
                            )}
                            <span className="text-xs text-muted-foreground">
                              R$ {item.precoUnitario.toFixed(2)} un.
                            </span>
                          </div>

                          {/* Price + Actions */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-bold text-sm text-primary">
                              R$ {item.precoTotal.toFixed(2)}
                            </span>
                            <div className="flex gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setExpandedObs(
                                    expandedObs === item.id ? null : item.id
                                  )
                                }
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover item?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Deseja remover &quot;{item.nome}&quot; do pedido?
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
                          </div>
                        </div>

                        {/* Expanded observations */}
                        {expandedObs === item.id && (
                          <div className="px-3 pb-3 pt-0 border-t border-border/50">
                            <Textarea
                              value={item.observacoes || ""}
                              onChange={(e) =>
                                handleObservationChange(item.id, e.target.value)
                              }
                              placeholder="Ex: Sem cebola, bem passada..."
                              className="h-16 text-sm mt-2 resize-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Add Item Tab */}
            <TabsContent value="menu" className="flex-1 overflow-hidden mt-0 px-6 py-3">
              <AddItemSection onAddItem={handleAddItem} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 shrink-0 bg-muted/30">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total</span>
              <Badge variant="secondary" className="text-xs">
                {editedItems.length} {editedItems.length === 1 ? "item" : "itens"}
              </Badge>
            </div>
            <span className="text-2xl font-bold text-primary">
              R$ {calculateTotal().toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={editedItems.length === 0}
              className="flex-2"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
