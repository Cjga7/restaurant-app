import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import { TIPOS_MOVIMIENTO, MOTIVOS, getCategoria } from './constants'
import { useRegistrarMovimiento } from '../../hooks/useInventario'
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'

const ICONOS = { entrada: ArrowDown, salida: ArrowUp, ajuste: RefreshCw }

export default function MovimientoModal({ isOpen, onClose, stock, sucursalId }) {
  const [tipo, setTipo]         = useState('entrada')
  const [cantidad, setCantidad] = useState('')
  const [precio, setPrecio]     = useState('')
  const [motivo, setMotivo]     = useState('')
  const [notas, setNotas]       = useState('')
  const [error, setError]       = useState('')

  const mut = useRegistrarMovimiento()

  useEffect(() => {
    if (isOpen) {
      setTipo('entrada')
      setCantidad('')
      setPrecio(stock?.precio_compra ?? '')
      setMotivo('')
      setNotas('')
      setError('')
    }
  }, [isOpen, stock])

  if (!stock && !sucursalId) return null

  const item = stock?.item
  const cat  = item ? getCategoria(item.categoria) : null
  const stockActual = stock?.stock_actual ?? 0

  const calcularNuevoStock = () => {
    const c = Number(cantidad) || 0
    if (tipo === 'entrada') return stockActual + c
    if (tipo === 'salida')  return Math.max(0, stockActual - c)
    if (tipo === 'ajuste')  return c
    return stockActual
  }

  const handleSubmit = () => {
    if (!cantidad || Number(cantidad) < 0) return setError('Cantidad requerida.')
    if (tipo === 'salida' && Number(cantidad) > stockActual)
      return setError(`Stock insuficiente. Solo hay ${stockActual} ${item.unidad}.`)

    mut.mutate({
      sucursal_id: sucursalId,
      item_id: item.id,
      tipo,
      cantidad: Number(cantidad),
      precio_unitario: precio ? Number(precio) : null,
      motivo: motivo || null,
      notas: notas || null,
    }, {
      onSuccess: () => onClose(),
      onError: (e) => setError(e.response?.data?.message ?? 'Error al registrar.'),
    })
  }

  const nuevoStock = calcularNuevoStock()
  const Icon = ICONOS[tipo]

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={`Movimiento · ${item?.nombre ?? ''}`}
      maxWidth="max-w-lg">

      {/* Info del item */}
      {item && (
        <div className="bg-gray-50 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: cat.bg }}>
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.nombre}</p>
            <p className="text-xs text-gray-500">
              Stock actual: <span className="font-semibold">{stockActual} {item.unidad}</span>
            </p>
          </div>
        </div>
      )}

      {/* Selector de tipo */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {TIPOS_MOVIMIENTO.map(t => {
          const TIcon = ICONOS[t.value]
          const active = tipo === t.value
          return (
            <button
              key={t.value}
              onClick={() => setTipo(t.value)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all"
              style={active
                ? { background: t.bg, borderColor: t.dot, color: t.text }
                : { background: 'white', borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              <TIcon size={16} />
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Ayuda según tipo */}
      <p className="text-xs text-gray-500 mb-4 bg-blue-50 rounded-xl px-3 py-2">
        {tipo === 'entrada' && '📦 Ingreso de stock (ej: compra, devolución).'}
        {tipo === 'salida'  && '📤 Salida de stock (ej: consumo, merma, descarte).'}
        {tipo === 'ajuste'  && '⚖️ Corrección tras inventario físico. La cantidad es el stock final correcto.'}
      </p>

      {/* Cantidad + precio */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {tipo === 'ajuste' ? 'Stock final correcto' : 'Cantidad'} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number" min="0" step="0.01"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
              {item?.unidad}
            </span>
          </div>
        </div>

        {tipo === 'entrada' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Precio unitario</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Bs.</span>
              <input
                type="number" min="0" step="0.01"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Motivo */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Motivo</label>
        <select
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
        >
          <option value="">Sin especificar</option>
          {MOTIVOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Notas */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas</label>
        <textarea
          rows={2}
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Observaciones..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none"
        />
      </div>

      {/* Preview del resultado */}
      {cantidad && item && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 mb-4 border border-slate-200">
          <p className="text-xs text-gray-500 mb-2">Resultado de la operación</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">{stockActual} {item.unidad}</span>
            <Icon size={14} style={{ color: getTipoMovColor(tipo) }} />
            <span className="text-lg font-bold text-slate-900">{nuevoStock} {item.unidad}</span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={mut.isPending}
          className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
          {mut.isPending ? 'Registrando...' : 'Registrar movimiento'}
        </button>
      </div>
    </Modal>
  )
}

function getTipoMovColor(tipo) {
  if (tipo === 'entrada') return '#10b981'
  if (tipo === 'salida') return '#ef4444'
  return '#f59e0b'
}