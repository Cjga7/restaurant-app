import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import AbrirCajaModal from './AbrirCajaModal'
import CerrarCajaModal from './CerrarCajaModal'
import CobrarModal from './CobrarModal'
import { useMiSesion, useSesiones, usePagos, useSesionesActivas } from '../../hooks/useCaja'
import { usePedidos } from '../../hooks/usePedidos'
import { useAuthStore } from '../../store/authStore'
import { getMetodo } from './constants'
import {
  Unlock, Lock, DollarSign, Wallet, Receipt, ChevronRight,
  TrendingUp, Clock, History, CheckCircle2, Users,Printer,
} from 'lucide-react'
import ReciboModal from './ReciboModal'
const fmtHora = (d) => new Date(d).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
const fmtFechaHora = (d) => new Date(d).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function CajaPage() {
  const { hasPermission, user, getSucursalId } = useAuthStore()
  const canManage = hasPermission('caja.gestionar')
  const sucursalId = getSucursalId()
const [verRecibo, setVerRecibo] = useState(null) // { pago, pedido }
  const [tab, setTab] = useState('activa') // activa | historial-pagos | historial-sesiones
  const [abrirOpen, setAbrirOpen] = useState(false)
  const [cerrarOpen, setCerrarOpen] = useState(false)
  const [cobrandoPedido, setCobrandoPedido] = useState(null)

  const { data: miSesionRaw, isLoading: loadingSesion } = useMiSesion(sucursalId)
  // Tratar como "sin sesión" si la respuesta es null, undefined u objeto vacío
const miSesion = miSesionRaw && miSesionRaw.id ? miSesionRaw : null
  const { data: sesionesActivas = [] } = useSesionesActivas(sucursalId)

  // Otras sesiones que NO son del usuario actual
  const otrasSesiones = sesionesActivas.filter(s => s.cajero_id !== user?.id)

  // Pedidos listos para cobrar: estado "entregado" o "listo" y NO pagados
  const { data: pedidosPorCobrar = [] } = usePedidos({
    ...(sucursalId && { sucursal_id: sucursalId }),
    activos: true,
  })
  const pedidosCobrables = pedidosPorCobrar.filter(p =>
    ['listo', 'entregado'].includes(p.estado) && !['pagado', 'cancelado'].includes(p.estado)
  )

  const { data: todasLasSesiones = [] } = useSesiones(
    sucursalId ? { sucursal_id: sucursalId } : {}
  )
  const { data: todosPagos = [] } = usePagos({ limit: 50 })

  // ─── Tab: Historial de pagos ───
  if (tab === 'historial-pagos') {
    return (
      <Layout>
        <Header title="Historial de pagos" subtitle={`Últimos ${todosPagos.length} pagos`} />
        <Tabs tab={tab} setTab={setTab} />
        <HistorialPagos pagos={todosPagos} onVerRecibo={setVerRecibo} />
      </Layout>
    )
  }

  // ─── Tab: Historial de sesiones ───
  if (tab === 'historial-sesiones') {
    return (
      <Layout>
        <Header title="Historial de sesiones" subtitle={`${todasLasSesiones.length} sesiones registradas`} />
        <Tabs tab={tab} setTab={setTab} />
        <HistorialSesiones sesiones={todasLasSesiones} />
      </Layout>
    )
  }

  // ─── Tab: Sesión activa ───
  return (
    <Layout>
      <Header
        title="Caja"
        subtitle={miSesion ? `Sesión abierta por ${miSesion.cajero?.name ?? user?.name}` : 'Sin sesión activa'}
      />

      <Tabs tab={tab} setTab={setTab} />

      {loadingSesion ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-slate-900 animate-spin" />
          <p className="text-sm text-gray-400">Cargando sesión de caja...</p>
        </div>
      ) : !miSesion ? (
        <>
          {/* Monitor de cajas activas (super admin / gerente) */}
          {otrasSesiones.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Users size={16} style={{ color: '#6366f1' }} />
                    Cajas activas en la sucursal
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Otros cajeros tienen turnos abiertos
                  </p>
                </div>
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {otrasSesiones.length} {otrasSesiones.length === 1 ? 'cajero' : 'cajeros'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {otrasSesiones.map(s => <CajaActivaCard key={s.id} sesion={s} />)}
              </div>
            </div>
          )}

          {/* Estado: sin sesión propia */}
          <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#f1f5f9' }}>
              <Wallet size={28} style={{ color: '#94a3b8' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900 mb-1">No tenés una sesión de caja abierta</p>
              <p className="text-sm text-gray-500">Abrí caja para empezar a cobrar pedidos</p>
            </div>
            {canManage && (
              <button onClick={() => setAbrirOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <Unlock size={15} /> Abrir mi caja
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Resumen de la sesión activa */}
          <SesionActivaCard sesion={miSesion} onCerrar={() => setCerrarOpen(true)} canManage={canManage} />

          {/* Monitor de OTROS cajeros activos (debajo de la propia sesión) */}
          {otrasSesiones.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Users size={16} style={{ color: '#6366f1' }} />
                    Otros cajeros activos
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Otros turnos abiertos en la sucursal
                  </p>
                </div>
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {otrasSesiones.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {otrasSesiones.map(s => <CajaActivaCard key={s.id} sesion={s} />)}
              </div>
            </div>
          )}

          {/* Pedidos por cobrar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Pedidos por cobrar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Pedidos listos o entregados pendientes de pago</p>
              </div>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                {pedidosCobrables.length}
              </span>
            </div>

            {pedidosCobrables.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
                <CheckCircle2 size={28} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                <p className="text-sm text-gray-600">Todos los pedidos están al día ✓</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {pedidosCobrables.map(p => (
                  <PedidoPorCobrar key={p.id} pedido={p} onCobrar={() => setCobrandoPedido(p)} />
                ))}
              </div>
            )}
          </div>

          {/* Últimos pagos de la sesión */}
          {miSesion.pagos?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Pagos de este turno</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-2 text-xs font-semibold text-gray-600 uppercase">Hora</th>
                      <th className="text-left px-5 py-2 text-xs font-semibold text-gray-600 uppercase">Pedido</th>
                      <th className="text-left px-5 py-2 text-xs font-semibold text-gray-600 uppercase">Método</th>
                      <th className="text-right px-5 py-2 text-xs font-semibold text-gray-600 uppercase">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...miSesion.pagos].reverse().map(pago => {
                      const m = getMetodo(pago.metodo)
                      return (
                        <tr key={pago.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-2 text-xs text-gray-500">{fmtHora(pago.created_at)}</td>
                          <td className="px-5 py-2 text-sm font-medium text-gray-900">#{pago.pedido?.numero}</td>
                          <td className="px-5 py-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: m.bg, color: m.text }}>
                              {m.icon} {m.label}
                            </span>
                          </td>
                          <td className="px-5 py-2 text-right font-bold text-gray-900">
                            Bs. {Number(pago.monto_total).toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <AbrirCajaModal isOpen={abrirOpen} onClose={() => setAbrirOpen(false)} sucursalId={sucursalId} />
      <CerrarCajaModal isOpen={cerrarOpen} onClose={() => setCerrarOpen(false)} sesion={miSesion} />
      <CobrarModal isOpen={!!cobrandoPedido} onClose={() => setCobrandoPedido(null)} pedido={cobrandoPedido} />
        <ReciboModal
  isOpen={!!verRecibo}
  onClose={() => setVerRecibo(null)}
  pago={verRecibo?.pago}
  pedido={verRecibo?.pedido}
  mostrarExito={false}
/>
    </Layout>
  )
}

// ─── Subcomponentes ───────────────────────────

function Tabs({ tab, setTab }) {
  return (
    <div className="inline-flex bg-white border border-gray-100 rounded-xl p-1 mb-5">
      {[
        { v: 'activa', label: 'Sesión actual', icon: Wallet },
        { v: 'historial-pagos', label: 'Pagos', icon: Receipt },
        { v: 'historial-sesiones', label: 'Sesiones', icon: History },
      ].map(t => {
        const Icon = t.icon
        const active = tab === t.v
        return (
          <button key={t.v}
            onClick={() => setTab(t.v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
            <Icon size={14} /> {t.label}
          </button>
        )
      })}
    </div>
  )
}

function SesionActivaCard({ sesion, onCerrar, canManage }) {
  const efectivo = sesion.pagos?.reduce((s, p) => s + Number(p.monto_efectivo ?? 0), 0) ?? 0
  const tarjeta = sesion.pagos?.reduce((s, p) => s + Number(p.monto_tarjeta ?? 0), 0) ?? 0
  const qr = sesion.pagos?.reduce((s, p) => s + Number(p.monto_qr ?? 0), 0) ?? 0
  const total = efectivo + tarjeta + qr
  const esperado = Number(sesion.monto_inicial) + efectivo

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)', transform: 'translate(30%, -30%)' }} />

      <div className="relative flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Sesión abierta</span>
          </div>
          <p className="text-xs text-slate-400">
            Abierta a las {fmtHora(sesion.fecha_apertura)} ·
            Inicial: <span className="font-semibold text-slate-200">Bs. {Number(sesion.monto_inicial).toFixed(2)}</span>
          </p>
        </div>

        {canManage && (
          <button onClick={onCerrar}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all">
            <Lock size={13} /> Cerrar caja
          </button>
        )}
      </div>

      <div className="relative grid grid-cols-4 gap-3">
        <StatMini label="Total vendido" value={total} icon={TrendingUp} color="#10b981" />
        <StatMini label="Efectivo" value={efectivo} icon={DollarSign} color="#fbbf24" />
        <StatMini label="Tarjeta" value={tarjeta} icon={Receipt} color="#3b82f6" />
        <StatMini label="Efectivo esperado" value={esperado} icon={Wallet} color="#a855f7" highlight />
      </div>

      <div className="relative mt-4 flex items-center gap-2 text-xs text-slate-400">
        <Receipt size={12} />
        <span>{sesion.pagos?.length ?? 0} pagos procesados</span>
      </div>
    </div>
  )
}

function StatMini({ label, value, icon: Icon, color, highlight }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-white/10 border border-white/20' : 'bg-white/5'}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} style={{ color }} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">
        <span className="text-xs text-slate-400 font-normal mr-1">Bs.</span>
        {Number(value).toFixed(2)}
      </p>
    </div>
  )
}

function CajaActivaCard({ sesion }) {
  const efectivo = sesion.pagos?.reduce((s, p) => s + Number(p.monto_efectivo ?? 0), 0) ?? 0
  const tarjeta = sesion.pagos?.reduce((s, p) => s + Number(p.monto_tarjeta ?? 0), 0) ?? 0
  const qr = sesion.pagos?.reduce((s, p) => s + Number(p.monto_qr ?? 0), 0) ?? 0
  const total = efectivo + tarjeta + qr
  const initials = sesion.cajero?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all">
      {/* Cabecera con avatar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f130, #8b5cf660)',
            color: '#4c1d95',
          }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{sesion.cajero?.name}</p>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-700 font-medium">Caja abierta</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{fmtHora(sesion.fecha_apertura)}</span>
          </div>
        </div>
      </div>

      {/* Stats de la sesión */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Inicial</p>
          <p className="text-sm font-bold text-gray-900">Bs. {Number(sesion.monto_inicial).toFixed(0)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2">
          <p className="text-xs text-green-700">Vendido</p>
          <p className="text-sm font-bold text-green-800">Bs. {total.toFixed(0)}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2">
          <p className="text-xs text-amber-700">Efectivo</p>
          <p className="text-sm font-bold text-amber-800">Bs. {efectivo.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
        <span>{sesion.pagos?.length ?? 0} pagos procesados</span>
      </div>
    </div>
  )
}

function PedidoPorCobrar({ pedido, onCobrar }) {
  return (
    <button onClick={onCobrar}
      className="bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-amber-300 transition-all group w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">#{pedido.numero}</p>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">
            {pedido.tipo === 'mesa' && pedido.mesa ? `Mesa ${pedido.mesa.numero}` : pedido.tipo}
            {pedido.cliente_nombre && ` · ${pedido.cliente_nombre}`}
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 capitalize">
          {pedido.estado}
        </span>
      </div>

      <div className="flex items-end justify-between pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">{pedido.items?.length ?? 0} items</span>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-bold text-gray-900">Bs. {Number(pedido.total).toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold group-hover:bg-green-100 transition-colors">
        Cobrar <ChevronRight size={13} />
      </div>
    </button>
  )
}

function HistorialPagos({ pagos, onVerRecibo }) {
  if (pagos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        No hay pagos registrados todavía.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
  <tr className="border-b border-gray-100 bg-gray-50/50">
    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Pedido</th>
    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Método</th>
    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Cajero</th>
    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Monto</th>
    <th className="px-5 py-3"></th>
  </tr>
</thead>
        <tbody className="divide-y divide-gray-50">
          {pagos.map(pago => {
            const m = getMetodo(pago.metodo)
            return (
              <tr key={pago.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-xs text-gray-500">{fmtFechaHora(pago.created_at)}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900">#{pago.pedido?.numero}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: m.bg, color: m.text }}>
                    {m.icon} {m.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-600">{pago.cajero?.name ?? '—'}</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">
                  Bs. {Number(pago.monto_total).toFixed(2)}
                </td>
                <td className="px-5 py-3 text-right">
  <button
    onClick={() => onVerRecibo({ pago, pedido: pago.pedido })}
    className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 ml-auto"
  >
    <Printer size={11} /> Recibo
  </button>
</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function HistorialSesiones({ sesiones }) {
  if (sesiones.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        No hay sesiones registradas todavía.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sesiones.map(s => {
        const activa = s.estado === 'abierta'
        const dif = Number(s.diferencia ?? 0)

        return (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {activa ? <Unlock size={11} /> : <Lock size={11} />}
                    {activa ? 'Abierta' : 'Cerrada'}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-sm font-medium text-gray-700">{s.cajero?.name ?? '—'}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {fmtFechaHora(s.fecha_apertura)}
                  {s.fecha_cierre && ` → ${fmtFechaHora(s.fecha_cierre)}`}
                </p>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {s.pagos?.length ?? 0} pagos
              </span>
            </div>

            {!activa && (
              <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-400">Inicial</p>
                  <p className="text-sm font-semibold">Bs. {Number(s.monto_inicial).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Esperado</p>
                  <p className="text-sm font-semibold">Bs. {Number(s.monto_esperado ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Real</p>
                  <p className="text-sm font-semibold">Bs. {Number(s.monto_real ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Diferencia</p>
                  <p className={`text-sm font-bold ${Math.abs(dif) < 0.01 ? 'text-green-700' : dif > 0 ? 'text-blue-700' : 'text-red-700'
                    }`}>
                    {dif > 0 ? '+' : ''}Bs. {dif.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}