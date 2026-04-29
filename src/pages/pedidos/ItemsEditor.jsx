import { Minus, Plus, Trash2 } from 'lucide-react'
import { useAddItem, useUpdateItem, useDeleteItem } from '../../hooks/usePedidos'
import { useState } from 'react'

export default function ItemsEditor({ pedido, productos, canEdit }) {
  const addMut    = useAddItem()
  const updateMut = useUpdateItem()
  const deleteMut = useDeleteItem()

  const [busqueda, setBusqueda] = useState('')

  const items = pedido.items ?? []

  const productosFiltrados = productos.filter(p => {
    if (!busqueda) return true
    return p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  })

  return (
    <div>
      {/* Lista de items del pedido */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Items ({items.length})
        </p>

        {items.length === 0 ? (
          <div className="bg-gray-50 rounded-xl py-8 text-center text-sm text-gray-400">
            Sin items · Agregá productos del menú abajo
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.producto_nombre}</p>
                  <p className="text-xs text-gray-400">Bs. {Number(item.precio_unitario).toFixed(2)} c/u</p>
                </div>

                {canEdit ? (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
                    <button
                      onClick={() => item.cantidad > 1
                        ? updateMut.mutate({ id: pedido.id, itemId: item.id, cantidad: item.cantidad - 1 })
                        : deleteMut.mutate({ id: pedido.id, itemId: item.id })
                      }
                      disabled={updateMut.isPending}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-900 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.cantidad}</span>
                    <button
                      onClick={() => updateMut.mutate({ id: pedido.id, itemId: item.id, cantidad: item.cantidad + 1 })}
                      disabled={updateMut.isPending}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-900 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-600">×{item.cantidad}</span>
                )}

                <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                  Bs. {Number(item.subtotal).toFixed(2)}
                </span>

                {canEdit && (
                  <button
                    onClick={() => deleteMut.mutate({ id: pedido.id, itemId: item.id })}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-5">
        <span className="text-sm text-gray-600">Total</span>
        <span className="text-xl font-bold text-gray-900">Bs. {Number(pedido.total).toFixed(2)}</span>
      </div>

      {/* Agregar productos */}
      {canEdit && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Agregar productos
          </p>

          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {productosFiltrados.map(prod => (
              <button
                key={prod.id}
                onClick={() => addMut.mutate({ id: pedido.id, data: { producto_id: prod.id, cantidad: 1 } })}
                disabled={addMut.isPending}
                className="text-left bg-white border border-gray-100 hover:border-slate-900 rounded-xl p-2.5 transition-all disabled:opacity-50 group"
              >
                <p className="text-xs font-medium text-gray-900 line-clamp-1 group-hover:text-slate-900">
                  {prod.nombre}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{prod.categoria?.nombre}</p>
                  <p className="text-xs font-bold text-gray-900">Bs. {Number(prod.precio_base).toFixed(2)}</p>
                </div>
              </button>
            ))}
            {productosFiltrados.length === 0 && (
              <p className="col-span-2 text-xs text-gray-400 text-center py-4">No se encontraron productos</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}