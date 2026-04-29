import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import { useSucursales } from '../../hooks/useSucursales'
import { useStock, useTransferir } from '../../hooks/useInventario'
import { getCategoria } from './constants'
import { ArrowRight, Building2 } from 'lucide-react'

export default function TransferenciaModal({ isOpen, onClose, itemPreseleccionado }) {
  const { data: sucursales = [] } = useSucursales()

  const [origenId, setOrigenId]   = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [itemId, setItemId]       = useState('')
  const [cantidad, setCantidad]   = useState('')
  const [notas, setNotas]         = useState('')
  const [error, setError]         = useState('')

  // Stock de la sucursal origen (para mostrar disponible)
  const { data: stockOrigen = [] } = useStock(
    origenId ? { sucursal_id: Number(origenId) } : {}
  )

  const mut = useTransferir()

  useEffect(() => {
    if (isOpen) {
      setOrigenId('')
      setDestinoId('')
      setItemId(itemPreseleccionado?.id ?? '')
      setCantidad('')
      setNotas('')
      setError('')
    }
  }, [isOpen, itemPreseleccionado])

  const itemsDisponibles = stockOrigen.filter(s => s.stock_actual > 0)
  const stockSeleccionado = stockOrigen.find(s => s.item_id === Number(itemId))
  const maxDisponible     = stockSeleccionado?.stock_actual ?? 0
  const item              = stockSeleccionado?.item

  const handleSubmit = () => {
    if (!origenId || !destinoId) return setError('Seleccioná las sucursales.')
    if (origenId === destinoId)  return setError('Origen y destino deben ser diferentes.')
    if (!itemId)                 return setError('Seleccioná un insumo.')
    if (!cantidad || Number(cantidad) <= 0) return setError('Cantidad requerida.')
    if (Number(cantidad) > maxDisponible)
      return setError(`Solo hay ${maxDisponible} ${item?.unidad} disponibles.`)

    mut.mutate({
      sucursal_origen_id:  Number(origenId),
      sucursal_destino_id: Number(destinoId),
      item_id:             Number(itemId),
      cantidad:            Number(cantidad),
      notas:               notas || null,
    }, {
      onSuccess: () => onClose(),
      onError: (e) => setError(e.response?.data?.message ?? 'Error en la transferencia.'),
    })
  }

  const sucursalOrigen  = sucursales.find(s => s.id === Number(origenId))
  const sucursalDestino = sucursales.find(s => s.id === Number(destinoId))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transferir stock entre sucursales" maxWidth="max-w-lg">

      {/* Visualización del flujo */}
      {origenId && destinoId && origenId !== destinoId && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Desde</p>
            <div className="flex items-center gap-2">
              <Building2 size={14} style={{ color: '#6366f1' }} />
              <p className="text-sm font-semibold text-gray-900 truncate">{sucursalOrigen?.nombre}</p>
            </div>
          </div>

          <ArrowRight size={20} style={{ color: '#94a3b8' }} className="flex-shrink-0" />

          <div className="flex-1 min-w-0 text-right">
            <p className="text-xs text-gray-500 mb-1">Hacia</p>
            <div className="flex items-center gap-2 justify-end">
              <p className="text-sm font-semibold text-gray-900 truncate">{sucursalDestino?.nombre}</p>
              <Building2 size={14} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
      )}

      {/* Selección de sucursales */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Sucursal origen <span className="text-red-400">*</span>
          </label>
          <select value={origenId}
            onChange={e => { setOrigenId(e.target.value); setItemId('') }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white">
            <option value="">Seleccionar</option>
            {sucursales.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Sucursal destino <span className="text-red-400">*</span>
          </label>
          <select value={destinoId}
            onChange={e => setDestinoId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white">
            <option value="">Seleccionar</option>
            {sucursales.filter(s => s.id !== Number(origenId)).map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selección de item */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Insumo a transferir <span className="text-red-400">*</span>
        </label>
        <select value={itemId}
          onChange={e => setItemId(e.target.value)}
          disabled={!origenId}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white disabled:bg-gray-50 disabled:text-gray-400">
          <option value="">{origenId ? 'Seleccionar insumo' : 'Elegí primero la sucursal origen'}</option>
          {itemsDisponibles.map(s => {
            const cat = getCategoria(s.item?.categoria)
            return (
              <option key={s.item_id} value={s.item_id}>
                {cat.icon} {s.item?.nombre} — {s.stock_actual} {s.item?.unidad} disponibles
              </option>
            )
          })}
        </select>
        {origenId && itemsDisponibles.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">La sucursal origen no tiene insumos con stock.</p>
        )}
      </div>

      {/* Cantidad */}
      {itemId && item && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Cantidad a transferir <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number" min="0.001" step="0.001" max={maxDisponible}
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
              {item.unidad}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-500">Máximo disponible: <span className="font-semibold">{maxDisponible} {item.unidad}</span></p>
            <button onClick={() => setCantidad(maxDisponible)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Usar todo
            </button>
          </div>
        </div>
      )}

      {/* Notas */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas</label>
        <textarea rows={2} placeholder="Motivo o detalles de la transferencia..."
          value={notas}
          onChange={e => setNotas(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none" />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={mut.isPending}
          className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
          {mut.isPending ? 'Transfiriendo...' : 'Confirmar transferencia'}
        </button>
      </div>
    </Modal>
  )
}