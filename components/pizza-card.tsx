"use client"

import { useState } from "react"
import { Plus, CircleDot, Minus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PizzaItem, PizzaSize, Borda, Adicional, CartItem } from "@/lib/menu-data"
import { menuData } from "@/lib/menu-data"
import { useOrder } from "@/contexts/order-context"
import { useToast } from "@/components/cart-toast"
import { cn } from "@/lib/utils"

interface PizzaCardProps {
  pizza: PizzaItem
  allPizzas?: PizzaItem[]
}

const sizeLabels: Record<PizzaSize, string> = {
  broto: "Broto",
  media: "Média",
  grande: "Grande",
}

export function PizzaCard({ pizza, allPizzas = [] }: PizzaCardProps) {
  const { addToCart } = useOrder()
  const { showToast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("media")
  const [selectedBorda, setSelectedBorda] = useState<Borda>(menuData.bordas[0])
  const [selectedAdicionais, setSelectedAdicionais] = useState<Adicional[]>([])
  const [observacoes, setObservacoes] = useState("")
  const [quantidade, setQuantidade] = useState(1)
  const [isHalfHalf, setIsHalfHalf] = useState(false)
  const [secondHalfPizza, setSecondHalfPizza] = useState<PizzaItem | null>(null)

  const calculatePrice = () => {
    let basePrice = pizza.precos[selectedSize]
    
    if (isHalfHalf && secondHalfPizza) {
      const secondPrice = secondHalfPizza.precos[selectedSize]
      basePrice = Math.max(basePrice, secondPrice)
    }
    
    const bordaPrice = selectedBorda.preco
    const adicionaisPrice = selectedAdicionais.reduce((sum, a) => sum + a.preco, 0)
    return (basePrice + bordaPrice + adicionaisPrice) * quantidade
  }

  const handleAdicionalToggle = (adicional: Adicional) => {
    setSelectedAdicionais((prev) => {
      const exists = prev.find((a) => a.nome === adicional.nome)
      if (exists) {
        return prev.filter((a) => a.nome !== adicional.nome)
      }
      return [...prev, adicional]
    })
  }

  const handleAddToCart = () => {
    const basePrice = pizza.precos[selectedSize]
    let finalBasePrice = basePrice
    
    if (isHalfHalf && secondHalfPizza) {
      const secondPrice = secondHalfPizza.precos[selectedSize]
      finalBasePrice = Math.max(basePrice, secondPrice)
    }
    
    const precoUnitario = finalBasePrice + selectedBorda.preco + selectedAdicionais.reduce((sum, a) => sum + a.preco, 0)
    
    const cartItem: CartItem = {
      id: `${pizza.id}-${Date.now()}`,
      tipo: "pizza",
      nome: isHalfHalf && secondHalfPizza 
        ? `${pizza.nome} / ${secondHalfPizza.nome}` 
        : pizza.nome,
      tamanho: selectedSize,
      borda: selectedBorda.preco > 0 ? selectedBorda : undefined,
      adicionais: selectedAdicionais.length > 0 ? selectedAdicionais : undefined,
      observacoes: observacoes || undefined,
      quantidade,
      precoUnitario,
      precoTotal: precoUnitario * quantidade,
      isHalfHalf,
      segundaMetade: isHalfHalf && secondHalfPizza ? {
        nome: secondHalfPizza.nome,
        ingredientes: secondHalfPizza.ingredientes
      } : undefined
    }

    addToCart(cartItem)
    showToast(`${pizza.nome} adicionada ao carrinho`)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setSelectedSize("media")
    setSelectedBorda(menuData.bordas[0])
    setSelectedAdicionais([])
    setObservacoes("")
    setQuantidade(1)
    setIsHalfHalf(false)
    setSecondHalfPizza(null)
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setIsDialogOpen(true)}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-normal">
                  #{pizza.id}
                </Badge>
                <h3 className="font-semibold text-foreground truncate">{pizza.nome}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {pizza.ingredientes}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  B: R$ {pizza.precos.broto.toFixed(2)}
                </span>
                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  M: R$ {pizza.precos.media.toFixed(2)}
                </span>
                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  G: R$ {pizza.precos.grande.toFixed(2)}
                </span>
              </div>
            </div>
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{pizza.nome}</DialogTitle>
            <p className="text-sm text-muted-foreground">{pizza.ingredientes}</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Half-Half Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CircleDot className="h-5 w-5 text-primary" />
                <Label htmlFor="half-half" className="font-medium">
                  Pizza Meio a Meio
                </Label>
              </div>
              <Switch
                id="half-half"
                checked={isHalfHalf}
                onCheckedChange={setIsHalfHalf}
              />
            </div>

            {/* Second Half Selection */}
            {isHalfHalf && (
              <div className="space-y-2">
                <Label>Segunda Metade</Label>
                <Select
                  value={secondHalfPizza?.id || ""}
                  onValueChange={(value) => {
                    const found = allPizzas.find((p) => p.id === value)
                    setSecondHalfPizza(found || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sabor" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPizzas
                      .filter((p) => p.id !== pizza.id)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {secondHalfPizza && (
                  <p className="text-xs text-muted-foreground">
                    {secondHalfPizza.ingredientes}
                  </p>
                )}
              </div>
            )}

            {/* Size Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tamanho</Label>
              <RadioGroup
                value={selectedSize}
                onValueChange={(value) => setSelectedSize(value as PizzaSize)}
                className="grid grid-cols-3 gap-2"
              >
                {(["broto", "media", "grande"] as PizzaSize[]).map((size) => (
                  <div key={size}>
                    <RadioGroupItem
                      value={size}
                      id={size}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={size}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                        "hover:bg-muted/50"
                      )}
                    >
                      <span className="font-medium">{sizeLabels[size]}</span>
                      <span className="text-sm text-muted-foreground">
                        R$ {pizza.precos[size].toFixed(2)}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Borda Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Borda</Label>
              <RadioGroup
                value={selectedBorda.nome}
                onValueChange={(value) => {
                  const borda = menuData.bordas.find((b) => b.nome === value)
                  if (borda) setSelectedBorda(borda)
                }}
                className="grid grid-cols-2 gap-2"
              >
                {menuData.bordas.map((borda) => (
                  <div key={borda.nome}>
                    <RadioGroupItem
                      value={borda.nome}
                      id={`borda-${borda.nome}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`borda-${borda.nome}`}
                      className={cn(
                        "flex items-center justify-between rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                        "hover:bg-muted/50"
                      )}
                    >
                      <span className="text-sm">{borda.nome}</span>
                      <span className="text-sm text-muted-foreground">
                        {borda.preco > 0 ? `+R$ ${borda.preco.toFixed(2)}` : "Grátis"}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Adicionais */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Adicionais</Label>
              <div className="grid grid-cols-2 gap-2">
                {menuData.adicionais.map((adicional) => (
                  <div
                    key={adicional.nome}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      selectedAdicionais.find((a) => a.nome === adicional.nome)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:bg-muted/50"
                    )}
                    onClick={() => handleAdicionalToggle(adicional)}
                  >
                    <Checkbox
                      checked={!!selectedAdicionais.find((a) => a.nome === adicional.nome)}
                      onCheckedChange={() => handleAdicionalToggle(adicional)}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm block truncate">{adicional.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        +R$ {adicional.preco.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Observações</Label>
              <Textarea
                placeholder="Ex: Sem cebola, bem assada..."
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
            <Button 
              onClick={handleAddToCart} 
              className="flex-1 bg-secondary hover:bg-secondary/90"
              disabled={isHalfHalf && !secondHalfPizza}
            >
              Adicionar • R$ {calculatePrice().toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
