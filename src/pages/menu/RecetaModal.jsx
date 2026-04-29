import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import { useRecetas, useSyncReceta } from '../../hooks/useRecetas'
import { useItems } from '../../hooks/useInventario'
import { getCategoria } from '../inventario/constants'
import { Plus, X, ChefHat, AlertCircle } from 'lucide-react'

export default function RecetaModal({ isOpen, onClose, producto }) {
  const { data: recetasActuales = [] } = useRecetas(producto?.id)
  const { data: items = [] }           = useItems()

  const [lineas, setLineas]     = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [error, setError]       = useState('')

  const syncMut = useSyncReceta()

  // Cargar recetas actuales cuando se abre
  useEffect(() => {
    if (isOpen && recetasActuales.length > 0) {
      setLineas(recetasActuales.map(r => ({
        item_id:  r.item_id,
        cantidad: r.cantidad,
        notas:    r.notas ?? '',
        item:     r.item,
      })))
    } else if (isOpen) {
      setLineas([])
    }
    setBusqueda('')
    setError('')
  }, [isOpen, recetasActuales.length])

  if (!producto) return null

  const itemsDisponibles = items.filter(i => {
    const yaAgregado = lineas.some(l => l.item_id === i.id)
    const matchBusqueda = !busqueda || i.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return !yaAgregado && matchBusqueda
  })

  const agregarItem = (item) => {
    setLineas([...lineas, { item_id: item.id, cantidad: 1, notas: '', item }])
    setBusqueda('')
  }

  const quitarItem = (itemId) => {
    setLineas(lineas.filter(l => l.item_id !== itemId))
  }

  const actualizarLinea = (itemId, campo, valor) => {
    setLineas(lineas.map(l => l.item_id === itemId ? { ...l, [campo]: valor } : l))
  }

  const handleSubmit = () => {
    if (lineas.some(l => !l.cantidad || l.cantidad <= 0))
      return setError('Todos los ingredientes deben tener cantidad mayor a 0.')

    syncMut.mutate(
      {
        productoId: producto.id,
        items: lineas.map(l => ({
          item_id:  l.item_id,
          cantidad: Number(l.cantidad),
          notas:    l.notas || null,
        })),
      },
      { onSuccess: onClose, onError: () => setError('Error al guardar la receta.') }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f59e0b20, #ef444420)' }}>
          <ChefHat size={20} style={{ color: '#b45309' }} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Receta de</p>
          <h2 className="text-base font-semibold text-gray-900">{producto.nombre}</h2>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-4 flex items-start gap-2">
        <AlertCircle size={14} style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
        <p className="text-xs text-blue-900 leading-relaxed">
          Definí qué ingredientes e insumos consume una unidad de este producto.
          Cuando se pague un pedido, el stock se descontará automáticamente.
        </p>
      </div>

      {/* Lista de líneas */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Ingredientes ({lineas.length})
        </p>

        {lineas.length === 0 ? (
          <div className="bg-gray-50 rounded-xl py-8 text-center text-sm text-gray-400">
            Sin ingredientes · Buscá insumos abajo para agregar
          </div>
        ) : (
          <div className="space-y-2">
            {lineas.map(linea => {
              const cat = getCategoria(linea.item?.categoria)
              return (
                <div key={linea.item_id}
                  className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: cat.bg }}>
                    {cat.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {linea.item?.nombre}
                    </p>
                    <p className="text-xs text-gray-400">{cat.label}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={linea.cantidad}
                      onChange={e => actualizarLinea(linea.item_id, 'cantidad', e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                    <span className="text-xs text-gray-500 w-10">{linea.item?.unidad}</span>
                  </div>

                  <button
                    onClick={() => quitarItem(linea.item_id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Buscador para agregar */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Agregar ingrediente
        </p>

        <input
          type="text"
          placeholder="Buscar insumo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
        />

        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {itemsDisponibles.slice(0, 20).map(item => {
            const cat = getCategoria(item.categoria)
            return (
              <button
                key={item.id}
                onClick={() => agregarItem(item)}
                className="flex items-center gap-2 text-left bg-white border border-gray-100 hover:border-slate-900 rounded-xl p-2 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: cat.bg }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate group-hover:text-slate-900">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-gray-400">{item.unidad}</p>
                </div>
                <Plus size={12} style={{ color: '#94a3b8' }} />
              </button>
            )
          })}
          {itemsDisponibles.length === 0 && (
            <p className="col-span-2 text-xs text-gray-400 text-center py-4">
              {busqueda ? 'No se encontraron insumos' : 'Todos los insumos ya están agregados'}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={syncMut.isPending}
          className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
          {syncMut.isPending ? 'Guardando...' : 'Guardar receta'}
        </button>
      </div>
    </Modal>
  )
}