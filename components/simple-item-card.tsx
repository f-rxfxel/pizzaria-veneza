"use client"

import React from "react"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { menuData } from "@/lib/menu-data"
import type { CartItem } from "@/lib/menu-data"
import { useOrder } from "@/contexts/order-context"

interface SimpleItemCardProps {
  nome: string
  preco: number
  tipo: "panqueca" | "bebida"
  descricao?: string
}

export function SimpleItemCard({ nome, preco, tipo, descricao }: SimpleItemCardProps) {
  const { addToCart } = useOrder()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [observacoes, setObservacoes] = useState("")
  // Select para panqueca de pizza
  const [selectedGeneralPizza, setSelectedGeneralPizza] = useState("")
  // Select para del valle
  const [selectedDelValleFlavor, setSelectedDelValleFlavor] = useState("")


  const handleAddToCart = () => {
    let finalNome = nome
    let finalObs = observacoes
    if (tipo === "panqueca" && nome === "Sabores de Pizza (Geral)" && selectedGeneralPizza) {
      const pizza = menuData.categorias.flatMap(c => c.itens).find(p => p.id === selectedGeneralPizza)
      if (pizza) {
        finalNome = `Panqueca sabor ${pizza.nome}`
        finalObs = pizza.ingredientes + (observacoes ? ` | ${observacoes}` : "")
      }
    }
    if (tipo === "bebida" && nome.includes("Del Valle") && selectedDelValleFlavor) {
      finalNome = `Del Valle ${selectedDelValleFlavor} (450ml)`
    }
    const cartItem: CartItem = {
      id: `${tipo}-${finalNome}-${Date.now()}`,
      tipo,
      nome: finalNome,
      quantidade,
      precoUnitario: preco,
      precoTotal: preco * quantidade,
      observacoes: finalObs || undefined,
    }

    addToCart(cartItem)
    setQuantidade(1)
    setObservacoes("")
    setSelectedGeneralPizza("")
    setSelectedDelValleFlavor("")
    setIsDialogOpen(false)
  }

  return (
    <>
      <Card
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{nome}</h3>
              {descricao && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {descricao}
                </p>
              )}
              <p className="text-secondary font-bold mt-1">
                R$ {preco.toFixed(2)}
              </p>
            </div>
            <Button
              size="icon"
              className="shrink-0 h-12 w-12 rounded-full group-hover:scale-110 transition-transform bg-secondary hover:bg-secondary/90"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{nome}</DialogTitle>
            {descricao && (
              <p className="text-sm text-muted-foreground">{descricao}</p>
            )}
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center p-4 rounded-lg bg-secondary/10">
              <span className="text-2xl font-bold text-secondary">
                R$ {preco.toFixed(2)}
              </span>
            </div>

            {/* Select de sabores de pizza para panqueca especial */}
            {tipo === "panqueca" && nome === "Sabores de Pizza (Geral)" && (
              <div className="mb-4">
                <Label className="text-base font-semibold">Sabores de Pizza (Geral)</Label>
                <Select
                  value={selectedGeneralPizza}
                  onValueChange={setSelectedGeneralPizza}
                >
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Selecione um sabor de pizza" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuData.categorias
                      .flatMap((c) => c.itens)
                      .map((pizza: any) => (
                        <SelectItem key={pizza.id} value={pizza.id}>
                          {pizza.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedGeneralPizza && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {menuData.categorias
                      .flatMap((c) => c.itens)
                      .find((p: any) => p.id === selectedGeneralPizza)?.ingredientes}
                  </p>
                )}
              </div>
            )}

            {/* Select de sabores para Del Valle */}
            {tipo === "bebida" && nome.includes("Del Valle") && (
              <div className="mb-4">
                <Label className="text-base font-semibold">Sabor</Label>
                <Select
                  value={selectedDelValleFlavor}
                  onValueChange={setSelectedDelValleFlavor}
                >
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Selecione um sabor" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuData.bebidas.del_valle.sabores.map((sabor) => (
                      <SelectItem key={sabor} value={sabor}>
                        {sabor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Observações */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Observações</Label>
              <Textarea
                placeholder="Alguma observação especial?"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="font-semibold">Quantidade</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{quantidade}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setQuantidade(quantidade + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddToCart} className="flex-1 bg-secondary hover:bg-secondary/90">
              Adicionar • R$ {(preco * quantidade).toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
