"use client"

import { useState, useEffect, useMemo } from "react"
import { Minus, Plus, CircleDot } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import type { CartItem, PizzaSize, Borda, Adicional, PizzaItem } from "@/lib/menu-data"
import { menuData } from "@/lib/menu-data"
import { useOrder } from "@/contexts/order-context"
import { cn } from "@/lib/utils"

interface EditCartItemModalProps {
  item: CartItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

const sizeLabels: Record<PizzaSize, string> = {
  broto: "Broto",
  media: "Média",
  grande: "Grande",
}

// Get all pizzas from menu data
const getAllPizzas = (): PizzaItem[] => {
  const pizzas: PizzaItem[] = []
  for (const categoria of menuData.categorias) {
    if (categoria.nome.includes("Pizza")) {
      pizzas.push(...(categoria.itens as PizzaItem[]))
    }
  }
  return pizzas
}

export function EditCartItemModal({ item, open, onOpenChange }: EditCartItemModalProps) {
  const { updateCartItem } = useOrder()
  const allPizzas = useMemo(() => getAllPizzas(), [])
  
  // State for pizza editing
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(item.tamanho || "media")
  const [selectedBorda, setSelectedBorda] = useState<Borda>(item.borda || menuData.bordas[0])
  const [selectedAdicionais, setSelectedAdicionais] = useState<Adicional[]>(item.adicionais || [])
  const [observacoes, setObservacoes] = useState(item.observacoes || "")
  const [quantidade, setQuantidade] = useState(item.quantidade)
  const [isHalfHalf, setIsHalfHalf] = useState(item.isHalfHalf || false)
  const [secondHalfPizza, setSecondHalfPizza] = useState<PizzaItem | null>(
    item.segundaMetade ? allPizzas.find(p => p.nome === item.segundaMetade?.nome) || null : null
  )

  // Find original pizza from name (for price calculation)
  const originalPizzaName = item.isHalfHalf 
    ? item.nome.split(" / ")[0] 
    : item.nome
  const originalPizza = allPizzas.find(p => p.nome === originalPizzaName)

  // Select de todos os sabores de pizza (Geral)
  const [selectedGeneralPizza, setSelectedGeneralPizza] = useState<string>("")

  // Reset state when item changes
  useEffect(() => {
    if (open) {
      setSelectedSize(item.tamanho || "media")
      setSelectedBorda(item.borda || menuData.bordas[0])
      setSelectedAdicionais(item.adicionais || [])
      setObservacoes(item.observacoes || "")
      setQuantidade(item.quantidade)
      setIsHalfHalf(item.isHalfHalf || false)
      setSecondHalfPizza(
        item.segundaMetade ? allPizzas.find(p => p.nome === item.segundaMetade?.nome) || null : null
      )
    }
  }, [open, item, allPizzas])

  const calculatePrice = () => {
    if (item.tipo !== "pizza" || !originalPizza) {
      return item.precoUnitario * quantidade
    }

    let basePrice = originalPizza.precos[selectedSize]
    
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

  const handleSave = () => {
    if (item.tipo === "pizza" && originalPizza) {
      let basePrice = originalPizza.precos[selectedSize]
      
      if (isHalfHalf && secondHalfPizza) {
        const secondPrice = secondHalfPizza.precos[selectedSize]
        basePrice = Math.max(basePrice, secondPrice)
      }
      
      const precoUnitario = basePrice + selectedBorda.preco + selectedAdicionais.reduce((sum, a) => sum + a.preco, 0)
      
      updateCartItem(item.id, {
        nome: isHalfHalf && secondHalfPizza 
          ? `${originalPizza.nome} / ${secondHalfPizza.nome}` 
          : originalPizza.nome,
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
      })
    } else {
      // For non-pizza items, just update observacoes and quantidade
      updateCartItem(item.id, {
        observacoes: observacoes || undefined,
        quantidade,
        precoTotal: item.precoUnitario * quantidade,
      })
    }
    onOpenChange(false)
  }

  // For non-pizza items, show a simpler form
  if (item.tipo !== "pizza") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {item.nome}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Observações */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Observacoes</Label>
              <Textarea
                placeholder="Ex: Sem gelo, bem gelado..."
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar - R$ {(item.precoUnitario * quantidade).toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Full pizza editing form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar {originalPizza?.nome || item.nome}</DialogTitle>
          {originalPizza && (
            <p className="text-sm text-muted-foreground">{originalPizza.ingredientes}</p>
          )}
        </DialogHeader>

        {/* Select de todos os sabores de pizza (Geral) apenas para panquecas do tipo correto */}
        {item.tipo === "panqueca" && item.nome === "Sabores de Pizza (Geral)" && (
          <div className="mb-4">
            <Label className="text-base font-semibold">Sabores de Pizza (Geral)</Label>
            <Select
              value={selectedGeneralPizza}
              onValueChange={(value) => setSelectedGeneralPizza(value)}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Selecione um sabor de pizza" />
              </SelectTrigger>
              <SelectContent>
                {allPizzas.map((pizza) => (
                  <SelectItem key={pizza.id} value={pizza.id}>
                    {pizza.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGeneralPizza && (
              <p className="text-xs text-muted-foreground mt-1">
                {allPizzas.find((p) => p.id === selectedGeneralPizza)?.ingredientes}
              </p>
            )}
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Half-Half Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <CircleDot className="h-5 w-5 text-primary" />
              <Label htmlFor="half-half-edit" className="font-medium">
                Pizza Meio a Meio
              </Label>
            </div>
            <Switch
              id="half-half-edit"
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
                    .filter((p) => p.nome !== originalPizza?.nome)
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
          {originalPizza && (
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
                      id={`edit-${size}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`edit-${size}`}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                        "hover:bg-muted/50"
                      )}
                    >
                      <span className="font-medium">{sizeLabels[size]}</span>
                      <span className="text-sm text-muted-foreground">
                        R$ {originalPizza.precos[size].toFixed(2)}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

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
                    id={`edit-borda-${borda.nome}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`edit-borda-${borda.nome}`}
                    className={cn(
                      "flex items-center justify-between rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                      "hover:bg-muted/50"
                    )}
                  >
                    <span className="text-sm">{borda.nome}</span>
                    <span className="text-sm text-muted-foreground">
                      {borda.preco > 0 ? `+R$ ${borda.preco.toFixed(2)}` : "Gratis"}
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

          {/* Observacoes */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Observacoes</Label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={isHalfHalf && !secondHalfPizza}
          >
            Salvar - R$ {calculatePrice().toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
