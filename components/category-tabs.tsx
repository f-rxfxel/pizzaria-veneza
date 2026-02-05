"use client"

import { cn } from "@/lib/utils"
import { Pizza, Cake, Utensils, Wine, GlassWater, Search, X, Lollipop, CupSoda, Martini } from "lucide-react"
import { useRef, useEffect } from "react"

export type Category = "pizzas-salgadas" | "pizzas-doces" | "panquecas" | "bebidas" | "caipirinhas"

interface CategoryTabsProps {
  activeCategory: Category
  onCategoryChange: (category: Category) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

const categories = [
  { id: "pizzas-salgadas" as Category, label: "Pizzas Salgadas", shortLabel: "Salgadas", icon: Pizza },
  { id: "pizzas-doces" as Category, label: "Pizzas Doces", shortLabel: "Doces", icon: Lollipop },
  { id: "panquecas" as Category, label: "Panquecas", shortLabel: "Panquecas", icon: Utensils },
  { id: "bebidas" as Category, label: "Bebidas", shortLabel: "Bebidas", icon: CupSoda },
  { id: "caipirinhas" as Category, label: "Caipirinhas", shortLabel: "Drinks", icon: Martini },
]

export function CategoryTabs({ 
  activeCategory, 
  onCategoryChange, 
  searchQuery = "", 
  onSearchChange 
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Scroll active tab into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const button = activeRef.current
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: "smooth" })
    }
  }, [activeCategory])

  return (
    <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "w-full h-10 pl-10 pr-10 rounded-xl bg-muted/50 border border-transparent",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:border-primary/30 focus:bg-card",
                "transition-all"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex gap-1.5 px-3 py-2 min-w-max">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                ref={isActive ? activeRef : null}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "" : "opacity-70")} />
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
