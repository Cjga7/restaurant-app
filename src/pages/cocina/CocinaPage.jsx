import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { usePedidos, useCambiarEstadoPedido } from '../../hooks/usePedidos'
import { usePedidosRealtime } from '../../hooks/usePedidosRealtime'
import { useAuthStore } from '../../store/authStore'
import { Clock, ChefHat, AlertCircle, Wifi } from 'lucide-react'

const ESTADOS_COCINA = [
  { value: 'enviado',         label: 'Por preparar',   bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', siguiente: 'en_preparacion' },
  { value: 'en_preparacion',  label: 'En preparación', bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', siguiente: 'listo' },
  { value: 'listo',           label: 'Listos',         bg: '#d1fae5', text: '#065f46', dot: '#10b981', siguiente: null },
]

const tiempoTranscurrido = (fecha) => {
  const ms = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'Recién'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  return `${h}h ${min % 60}m`
}

const colorTiempo = (fecha) => {
  const min = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000)
  if (min < 5)  return '#10b981'
  if (min < 15) return '#f59e0b'
  return '#ef4444'
}

function PedidoCard({ pedido, onAvanzar }) {
  const [, forceUpdate] = useState({})
  const estadoInfo = ESTADOS_COCINA.find(e => e.value === pedido.estado)

  useEffect(() => {
    const i = setInterval(() => forceUpdate({}), 30000)
    return () => clearInterval(i)
  }, [])

  const tiempo = tiempoTranscurrido(pedido.created_at)
  const colorT = colorTiempo(pedido.created_at)

  return (
    <div className="bg-white rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-lg transition-all"
      style={{ borderColor: estadoInfo.dot }}>

      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ background: estadoInfo.bg, color: estadoInfo.text }}>
        <div>
          <p className="text-xs font-medium opacity-80">PEDIDO</p>
          <p className="text-base font-bold">#{pedido.numero}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium opacity-80">
            {pedido.tipo === 'mesa' && pedido.mesa
              ? `Mesa ${pedido.mesa.numero}`
              : pedido.tipo === 'delivery'
              ? '🛵 Delivery'
              : '🥡 Llevar'}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <Clock size={12} />
            <span className="text-sm font-bold" style={{ color: colorT }}>{tiempo}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-5">
        {pedido.items?.length > 0 ? (
          <div className="space-y-2">
            {pedido.items.map(item => (
              <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                  style={{ background: '#f1f5f9', color: '#0f172a' }}>
                  {item.cantidad}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{item.producto_nombre}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-4">Sin items</p>
        )}

        {pedido.notas && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle size={13} style={{ color: '#92400e', marginTop: 2 }} />
              <p className="text-xs text-amber-900 font-medium">{pedido.notas}</p>
            </div>
          </div>
        )}
      </div>

      {estadoInfo.siguiente && (
        <button
          onClick={() => onAvanzar(pedido.id, estadoInfo.siguiente)}
          className="w-full py-3 text-sm font-bold text-white transition-all"
          style={{ background: estadoInfo.dot }}
        >
          {estadoInfo.siguiente === 'en_preparacion' && '👨‍🍳 Empezar a preparar'}
          {estadoInfo.siguiente === 'listo' && '✓ Marcar como listo'}
        </button>
      )}
    </div>
  )
}

function ColumnaEstado({ estado, pedidos, onAvanzar }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: estado.dot }} />
          <h2 className="text-base font-bold text-gray-900">{estado.label}</h2>
        </div>
        <span className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ background: estado.bg, color: estado.text }}>
          {pedidos.length}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {pedidos.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-300">
            <ChefHat size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p>Sin pedidos en esta etapa</p>
          </div>
        ) : (
          pedidos
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map(p => <PedidoCard key={p.id} pedido={p} onAvanzar={onAvanzar} />)
        )}
      </div>
    </div>
  )
}

export default function CocinaPage() {
  const { getSucursalId } = useAuthStore()
  const sucursalId = getSucursalId()

  const { data: pedidos = [], isLoading } = usePedidos({
    ...(sucursalId && { sucursal_id: sucursalId }),
    activos: true,
  })

  const cambiarEstado = useCambiarEstadoPedido()

  // Realtime
  usePedidosRealtime(sucursalId, () => {
    // Sonido de notificación opcional
  })

  const handleAvanzar = (id, nuevoEstado) => {
    cambiarEstado.mutate({ id, estado: nuevoEstado })
  }

  const porEstado = ESTADOS_COCINA.reduce((acc, e) => {
    acc[e.value] = pedidos.filter(p => p.estado === e.value)
    return acc
  }, {})

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <ChefHat size={20} color="white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
          </div>
          <p className="text-sm text-gray-500">
            {pedidos.filter(p => ['enviado', 'en_preparacion'].includes(p.estado)).length} pedidos pendientes
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <Wifi size={13} />
          <span>En tiempo real</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
          Cargando pedidos...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          style={{ minHeight: 'calc(100vh - 180px)' }}>
          {ESTADOS_COCINA.map(estado => (
            <ColumnaEstado
              key={estado.value}
              estado={estado}
              pedidos={porEstado[estado.value] ?? []}
              onAvanzar={handleAvanzar}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}