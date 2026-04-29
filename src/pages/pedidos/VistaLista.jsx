import { Armchair, Bike, ShoppingBag, Clock, User } from 'lucide-react'
import { getEstado, getTipo } from './constants'

const iconoTipo = (t) => t === 'delivery' ? Bike : t === 'llevar' ? ShoppingBag : Armchair

const hace = (fecha) => {
  const ms = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'Recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h ${min % 60}m`
  return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
}

function PedidoRow({ pedido, onClick }) {
  const e = getEstado(pedido.estado)
  const t = getTipo(pedido.tipo)
  const Icon = iconoTipo(pedido.tipo)

  return (
    <button
      onClick={() => onClick(pedido)}
      className="w-full bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm hover:border-gray-200 transition-all text-left"
    >
      <div className="flex items-center gap-4">
        {/* Indicador de tipo */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: e.bg, color: e.text }}>
          <Icon size={18} />
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900">#{pedido.numero}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 capitalize">{t.label}</span>
            {pedido.mesa && (
              <>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-600">Mesa {pedido.mesa.numero}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {pedido.cliente_nombre && (
              <span className="flex items-center gap-1">
                <User size={10} /> {pedido.cliente_nombre}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={10} /> {hace(pedido.created_at)}
            </span>
            <span>· {pedido.items?.length ?? 0} items</span>
          </div>
        </div>

        {/* Estado + Total */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: e.bg, color: e.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.dot }} />
            {e.label}
          </span>
          <span className="text-base font-bold text-gray-900 w-24 text-right">
            Bs. {Number(pedido.total).toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function VistaLista({ pedidos, onPedidoClick }) {
  if (pedidos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
        <p className="text-sm text-gray-400">No hay pedidos con los filtros actuales.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {pedidos.map(p => <PedidoRow key={p.id} pedido={p} onClick={onPedidoClick} />)}
    </div>
  )
}