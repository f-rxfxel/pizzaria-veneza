"use client"

import { useRef, useEffect } from "react"
import { Printer, Download, CheckCircle, Pizza } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Order } from "@/lib/menu-data"
import Link from "next/link"

interface ReceiptModalProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

const sizeLabels: Record<string, string> = {
  broto: "Broto",
  media: "Média",
  grande: "Grande",
}

export function ReceiptModal({ order, open, onOpenChange }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML
      const originalContent = document.body.innerHTML
      
      document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
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
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .item { margin: 8px 0; }
            .item-name { font-weight: bold; }
            .item-details { font-size: 11px; color: #666; }
            .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 12px; }
            .footer { text-align: center; margin-top: 16px; font-size: 10px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `
      
      window.print()
      
      document.body.innerHTML = originalContent
      location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-6 w-6" />
            Pedido Finalizado!
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div
          ref={receiptRef}
          className="bg-white text-black p-6 rounded-lg border shadow-inner font-mono text-sm"
        >
          <div className="header text-center mb-4">
            <div className="flex justify-center mb-2">
              <img src="/logo-veneza.png" alt="Pizzaria Veneza" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
            </div>
          </div>

          <div className="divider border-t border-dashed border-gray-400 my-3" />

          <div className="mb-3">
            <p><strong>Pedido:</strong> {order.id}</p>
            <p><strong>Data:</strong> {order.createdAt.toLocaleString("pt-BR")}</p>
            {order.mesa && <p><strong>Mesa:</strong> {order.mesa}</p>}
            {order.cliente && <p><strong>Cliente:</strong> {order.cliente}</p>}
          </div>

          <div className="divider border-t border-dashed border-gray-400 my-3" />

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={item.id} className="item">
                <div className="flex justify-between">
                  <span className="item-name font-bold">
                    {item.quantidade}x {item.nome}
                  </span>
                  <span>R$ {item.precoTotal.toFixed(2)}</span>
                </div>
                {item.tamanho && (
                  <div className="item-details text-xs text-gray-600">
                    Tamanho: {sizeLabels[item.tamanho]}
                  </div>
                )}
                {item.borda && (
                  <div className="item-details text-xs text-gray-600">
                    Borda: {item.borda.nome} (+R$ {item.borda.preco.toFixed(2)})
                  </div>
                )}
                {item.adicionais && item.adicionais.length > 0 && (
                  <div className="item-details text-xs text-gray-600">
                    Adicionais: {item.adicionais.map((a) => a.nome).join(", ")}
                  </div>
                )}
                {item.observacoes && (
                  <div className="item-details text-xs text-gray-600 italic">
                    Obs: {item.observacoes}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="divider border-t border-dashed border-gray-400 my-3" />

          <div className="total text-right text-lg font-bold">
            TOTAL: R$ {order.total.toFixed(2)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={handlePrint} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Recibo
          </Button>
          <Link href="/pedidos" className="w-full">
            <Button variant="outline" className="w-full bg-transparent">
              Ver Todos os Pedidos
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
