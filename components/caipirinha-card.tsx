"use client"

import { useState } from "react"
import { Plus, Minus, Wine } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { CartItem } from "@/lib/menu-data"
import { menuData } from "@/lib/menu-data"
import { useOrder } from "@/contexts/order-context"
import { cn } from "@/lib/utils"

interface CaipirinhaCardProps {
  filteredBases?: string[]
  filteredFrutas?: string[]
}

export function CaipirinhaCard({ filteredBases, filteredFrutas }: CaipirinhaCardProps = {}) {
  const { addToCart } = useOrder()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const bases = filteredBases || menuData.caipirinhas.bases
  const frutas = filteredFrutas || menuData.caipirinhas.frutas
  
  const [selectedBase, setSelectedBase] = useState(bases[0])
  const [selectedFruta, setSelectedFruta] = useState(frutas[0])
  const [quantidade, setQuantidade] = useState(1)
  const [observacoes, setObservacoes] = useState("")

  const preco = menuData.caipirinhas.preco

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `caipirinha-${selectedBase}-${selectedFruta}-${Date.now()}`,
      tipo: "caipirinha",
      nome: `Caipirinha de ${selectedFruta} (${selectedBase})`,
      quantidade,
      precoUnitario: preco,
      precoTotal: preco * quantidade,
      observacoes: observacoes || undefined,
    }

    addToCart(cartItem)
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setSelectedBase(bases[0])
    setSelectedFruta(frutas[0])
    setQuantidade(1)
    setObservacoes("")
  }

  return (
    <>
      <Card
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group col-span-full"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
                <Wine className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Caipirinhas</h3>
                <p className="text-sm text-muted-foreground">
                  Monte sua caipirinha escolhendo base e fruta
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {bases.slice(0, 3).map((base) => (
                    <span
                      key={base}
                      className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {base}
                    </span>
                  ))}
                  {bases.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{bases.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-secondary">
                R$ {preco.toFixed(2)}
              </span>
              <Button
                size="icon"
                className="shrink-0 h-12 w-12 rounded-full group-hover:scale-110 transition-transform bg-secondary hover:bg-secondary/90"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Monte sua Caipirinha</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Escolha a base e a fruta da sua caipirinha
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Base Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Base</Label>
              <RadioGroup
                value={selectedBase}
                onValueChange={setSelectedBase}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {bases.map((base) => (
                  <div key={base}>
                    <RadioGroupItem
                      value={base}
                      id={`base-${base}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`base-${base}`}
                      className={cn(
                        "flex items-center justify-center rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all text-center",
                        "peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/10",
                        "hover:bg-muted/50"
                      )}
                    >
                      <span className="font-medium">{base}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Fruta Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Fruta</Label>
              <RadioGroup
                value={selectedFruta}
                onValueChange={setSelectedFruta}
                className="grid grid-cols-2 gap-2"
              >
                {frutas.map((fruta) => (
                  <div key={fruta}>
                    <RadioGroupItem
                      value={fruta}
                      id={`fruta-${fruta}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`fruta-${fruta}`}
                      className={cn(
                        "flex items-center justify-center rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all text-center",
                        "peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/10",
                        "hover:bg-muted/50"
                      )}
                    >
                      <span className="font-medium">{fruta}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

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

            {/* Preview */}
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-center font-medium text-foreground">
                Caipirinha de {selectedFruta} ({selectedBase})
              </p>
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
