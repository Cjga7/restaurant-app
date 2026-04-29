import { Users, MapPin, Clock } from 'lucide-react'
import { getEstado } from './constants'

function MesaCard({ mesa, pedidoActivo, onClick }) {
  const ocupada = mesa.estado === 'ocupada' || mesa.estado === 'reservada'
  const bg = ocupada ? '#fee2e2' : '#d1fae5'
  const accent = ocupada ? '#ef4444' : '#10b981'
  const text = ocupada ? '#991b1b' : '#065f46'

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl"
          style={{ background: bg, color: text }}
        >
          {mesa.numero}
        </div>
        <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full"
          style={{ background: bg, color: text }}>
          {mesa.estado}
        </span>
      </div>

      <p className="font-semibold text-gray-900 text-sm">Mesa {mesa.numero}</p>

      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Users size={11} /> {mesa.capacidad}</span>
        {mesa.ubicacion && <span className="flex items-center gap-1"><MapPin size={11} /> {mesa.ubicacion}</span>}
      </div>

      {pedidoActivo ? (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Pedido activo</span>
            <span className="text-sm font-bold text-gray-900">Bs. {Number(pedidoActivo.total).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: getEstado(pedidoActivo.estado).dot }} />
            <span className="text-xs" style={{ color: getEstado(pedidoActivo.estado).text }}>
              {getEstado(pedidoActivo.estado).label}
            </span>
            {pedidoActivo.items?.length > 0 && (
              <span className="text-xs text-gray-400 ml-auto">
                {pedidoActivo.items.length} items
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">Sin pedido activo</span>
        </div>
      )}
    </button>
  )
}

export default function VistaMesas({ mesas, pedidos, onMesaClick }) {
  const mesasActivas = mesas.filter(m => m.estado !== 'inactiva')

  // Mapear pedidos activos por mesa
  const pedidosPorMesa = {}
  pedidos.forEach(p => {
    if (p.mesa_id && !['pagado', 'cancelado'].includes(p.estado)) {
      pedidosPorMesa[p.mesa_id] = p
    }
  })

  if (mesasActivas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
        <p className="text-sm text-gray-400">No hay mesas disponibles en esta sucursal.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {mesasActivas.map(mesa => (
        <MesaCard
          key={mesa.id}
          mesa={mesa}
          pedidoActivo={pedidosPorMesa[mesa.id]}
          onClick={() => onMesaClick(mesa, pedidosPorMesa[mesa.id])}
        />
      ))}
    </div>
  )
}