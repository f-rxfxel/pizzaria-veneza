"use client"

import { useState, useMemo, useEffect } from "react"
import { CategoryTabs, type Category } from "./category-tabs"
import { PizzaCard } from "./pizza-card"
import { SimpleItemCard } from "./simple-item-card"
import { CaipirinhaCard } from "./caipirinha-card"
import { FloatingCart } from "./floating-cart"
import { menuData } from "@/lib/menu-data"
import { Search } from "lucide-react"

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("pizzas-salgadas")
  const [searchQuery, setSearchQuery] = useState("")

  const pizzasSalgadas = menuData.categorias.find((c) => c.nome === "Pizzas Salgadas")?.itens || []
  const pizzasDoces = menuData.categorias.find((c) => c.nome === "Pizzas Doces")?.itens || []
  const allPizzas = [...pizzasSalgadas, ...pizzasDoces]

  // Filter pizzas based on search query
  const filteredSalgadas = useMemo(() => {
    if (!searchQuery) return pizzasSalgadas
    const query = searchQuery.toLowerCase()
    return pizzasSalgadas.filter(
      (p) => p.nome.toLowerCase().includes(query) || p.ingredientes.toLowerCase().includes(query)
    )
  }, [pizzasSalgadas, searchQuery])

  const filteredDoces = useMemo(() => {
    if (!searchQuery) return pizzasDoces
    const query = searchQuery.toLowerCase()
    return pizzasDoces.filter(
      (p) => p.nome.toLowerCase().includes(query) || p.ingredientes.toLowerCase().includes(query)
    )
  }, [pizzasDoces, searchQuery])

  // Filter panquecas
  const filteredPanquecas = useMemo(() => {
    if (!searchQuery) return menuData.panquecas
    const query = searchQuery.toLowerCase()
    return menuData.panquecas.filter((p) => p.nome.toLowerCase().includes(query))
  }, [searchQuery])

  // Filter bebidas
  const filteredBebidas = useMemo(() => {
    if (!searchQuery) return menuData.bebidas
    const query = searchQuery.toLowerCase()
    
    const sucosFiltrados = menuData.bebidas.sucos_naturais.sabores.filter((s) => 
      s.toLowerCase().includes(query) || `suco de ${s}`.toLowerCase().includes(query)
    )
    const sucosEspeciaisFiltrados = menuData.bebidas.sucos_naturais.sabores_especiais.filter((s) => 
      s.nome.toLowerCase().includes(query) || `suco de ${s.nome}`.toLowerCase().includes(query)
    )
    const refrigerantesFiltrados = menuData.bebidas.refrigerantes.filter((r) => 
      r.nome.toLowerCase().includes(query)
    )
    const aguaFiltrada = menuData.bebidas.agua.filter((a) => 
      a.nome.toLowerCase().includes(query)
    )
    const cervejasFiltradas = menuData.bebidas.cervejas.filter((c) => 
      c.nome.toLowerCase().includes(query)
    )
    const sucosLataFiltrados = menuData.bebidas.sucos_lata.filter((s) => 
      s.nome.toLowerCase().includes(query)
    )

    return {
      sucos_naturais: {
        ...menuData.bebidas.sucos_naturais,
        sabores: sucosFiltrados,
        sabores_especiais: sucosEspeciaisFiltrados
      },
      refrigerantes: refrigerantesFiltrados,
      agua: aguaFiltrada,
      cervejas: cervejasFiltradas,
      sucos_lata: sucosLataFiltrados
    }
  }, [searchQuery])

  // Filter caipirinhas
  const filteredCaipirinhas = useMemo(() => {
    if (!searchQuery) return { bases: menuData.caipirinhas.bases, frutas: menuData.caipirinhas.frutas }
    const query = searchQuery.toLowerCase()
    
    const basesFiltradas = menuData.caipirinhas.bases.filter((base) => 
      base.toLowerCase().includes(query) || `caipirinha ${base}`.toLowerCase().includes(query)
    )
    const frutasFiltradas = menuData.caipirinhas.frutas.filter((fruta) => 
      fruta.toLowerCase().includes(query) || `caipirinha ${fruta}`.toLowerCase().includes(query)
    )

    return {
      bases: basesFiltradas,
      frutas: frutasFiltradas
    }
  }, [searchQuery])

  // Helper functions to check if categories have results
  const hasBebidasResults = useMemo(() => {
    return filteredBebidas.sucos_naturais.sabores.length > 0 ||
           filteredBebidas.sucos_naturais.sabores_especiais.length > 0 ||
           filteredBebidas.refrigerantes.length > 0 ||
           filteredBebidas.agua.length > 0 ||
           filteredBebidas.cervejas.length > 0 ||
           filteredBebidas.sucos_lata.length > 0
  }, [filteredBebidas])

  const hasCaipirinhasResults = useMemo(() => {
    return filteredCaipirinhas.bases.length > 0 || filteredCaipirinhas.frutas.length > 0
  }, [filteredCaipirinhas])

  // Auto-navigate to category with results when searching
  useEffect(() => {
    if (!searchQuery) return

    // Check if current category has results
    let currentHasResults = false
    switch (activeCategory) {
      case "pizzas-salgadas":
        currentHasResults = filteredSalgadas.length > 0
        break
      case "pizzas-doces":
        currentHasResults = filteredDoces.length > 0
        break
      case "panquecas":
        currentHasResults = filteredPanquecas.length > 0
        break
      case "bebidas":
        currentHasResults = hasBebidasResults
        break
      case "caipirinhas":
        currentHasResults = hasCaipirinhasResults
        break
    }

    // If current category has results, stay on it
    if (currentHasResults) return

    // Find first category with results and switch to it
    if (filteredSalgadas.length > 0) {
      setActiveCategory("pizzas-salgadas")
    } else if (filteredDoces.length > 0) {
      setActiveCategory("pizzas-doces")
    } else if (filteredPanquecas.length > 0) {
      setActiveCategory("panquecas")
    } else if (hasBebidasResults) {
      setActiveCategory("bebidas")
    } else if (hasCaipirinhasResults) {
      setActiveCategory("caipirinhas")
    }
  }, [searchQuery, activeCategory, filteredSalgadas, filteredDoces, filteredPanquecas, hasBebidasResults, hasCaipirinhasResults])

  return (
    <div className="min-h-screen bg-background pb-24">
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat)
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="px-3 py-3">
        {activeCategory === "pizzas-salgadas" && (
          <>
            {searchQuery && filteredSalgadas.length === 0 ? (
              <EmptySearch query={searchQuery} onClear={() => setSearchQuery("")} />
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSalgadas.map((pizza) => (
                  <PizzaCard key={pizza.id} pizza={pizza} allPizzas={allPizzas} />
                ))}
              </div>
            )}
          </>
        )}

        {activeCategory === "pizzas-doces" && (
          <>
            {searchQuery && filteredDoces.length === 0 ? (
              <EmptySearch query={searchQuery} onClear={() => setSearchQuery("")} />
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDoces.map((pizza) => (
                  <PizzaCard key={pizza.id} pizza={pizza} allPizzas={allPizzas} />
                ))}
              </div>
            )}
          </>
        )}

        {activeCategory === "panquecas" && (
          <div className="space-y-3">
            {searchQuery && filteredPanquecas.length === 0 ? (
              <EmptySearch query={searchQuery} onClear={() => setSearchQuery("")} />
            ) : (
              <>
                <div className="p-3 rounded-xl bg-secondary/5 border border-secondary/10">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-secondary">Dica:</span> Fazemos panquecas de todos os sabores de pizza!
                  </p>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPanquecas.map((item) => (
                    <SimpleItemCard
                      key={item.nome}
                      nome={item.nome}
                      preco={item.preco}
                      tipo="panqueca"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeCategory === "bebidas" && (
          <div className="space-y-5">
            {searchQuery && 
             filteredBebidas.sucos_naturais.sabores.length === 0 && 
             filteredBebidas.sucos_naturais.sabores_especiais.length === 0 && 
             filteredBebidas.refrigerantes.length === 0 && 
             filteredBebidas.agua.length === 0 && 
             filteredBebidas.cervejas.length === 0 && 
             filteredBebidas.sucos_lata.length === 0 ? (
              <EmptySearch query={searchQuery} onClear={() => setSearchQuery("")} />
            ) : (
              <>
                {/* Sucos Naturais */}
                {(filteredBebidas.sucos_naturais.sabores.length > 0 || filteredBebidas.sucos_naturais.sabores_especiais.length > 0) && (
                  <section>
                    <SectionHeader title="Sucos Naturais" subtitle="520ml" />
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredBebidas.sucos_naturais.sabores.map((sabor) => (
                        <SimpleItemCard
                          key={sabor}
                          nome={`Suco de ${sabor}`}
                          preco={menuData.bebidas.sucos_naturais.preco_base}
                          tipo="bebida"
                        />
                      ))}
                      {filteredBebidas.sucos_naturais.sabores_especiais.map((suco) => (
                        <SimpleItemCard
                          key={suco.nome}
                          nome={`Suco de ${suco.nome}`}
                          preco={suco.preco}
                          tipo="bebida"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Refrigerantes */}
                {filteredBebidas.refrigerantes.length > 0 && (
                  <section>
                    <SectionHeader title="Refrigerantes" />
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredBebidas.refrigerantes.map((item) => (
                        <SimpleItemCard
                          key={item.nome}
                          nome={item.nome}
                          preco={item.preco}
                          tipo="bebida"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Agua */}
                {filteredBebidas.agua.length > 0 && (
                  <section>
                    <SectionHeader title="Agua" />
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredBebidas.agua.map((item) => (
                        <SimpleItemCard
                          key={item.nome}
                          nome={item.nome}
                          preco={item.preco}
                          tipo="bebida"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Cervejas */}
                {filteredBebidas.cervejas.length > 0 && (
                  <section>
                    <SectionHeader title="Cervejas" />
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredBebidas.cervejas.map((item) => (
                        <SimpleItemCard
                          key={item.nome}
                          nome={item.nome}
                          preco={item.preco}
                          tipo="bebida"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Sucos de Lata e Cha */}
                {filteredBebidas.sucos_lata.length > 0 && (
                  <section>
                    <SectionHeader title="Sucos de Lata e Cha" />
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredBebidas.sucos_lata.map((item) => (
                        <SimpleItemCard
                          key={item.nome}
                          nome={item.nome}
                          preco={item.preco}
                          tipo="bebida"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {activeCategory === "caipirinhas" && (
          <>
            {searchQuery && filteredCaipirinhas.bases.length === 0 && filteredCaipirinhas.frutas.length === 0 ? (
              <EmptySearch query={searchQuery} onClear={() => setSearchQuery("")} />
            ) : (
              <div className="grid gap-2.5">
                <CaipirinhaCard 
                  filteredBases={filteredCaipirinhas.bases.length > 0 ? filteredCaipirinhas.bases : undefined}
                  filteredFrutas={filteredCaipirinhas.frutas.length > 0 ? filteredCaipirinhas.frutas : undefined}
                />
              </div>
            )}
          </>
        )}
      </main>

      <FloatingCart />
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-2.5">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {subtitle && <span className="text-xs text-muted-foreground">({subtitle})</span>}
    </div>
  )
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum resultado</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Nao encontramos pizzas para "{query}"
      </p>
      <button
        onClick={onClear}
        className="text-sm text-primary font-medium hover:underline"
      >
        Limpar busca
      </button>
    </div>
  )
}
