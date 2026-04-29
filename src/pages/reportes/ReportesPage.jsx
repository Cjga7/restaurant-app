import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import DateRangeSelector from './DateRangeSelector'
import { useAuthStore } from '../../store/authStore'
import {
  useResumen, useVentasPorDia, useProductosTop,
  useVentasPorMetodo, usePerformanceCajeros, useStockCritico,
} from '../../hooks/useReportes'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, ShoppingBag, Receipt, AlertTriangle,
  DollarSign, CreditCard, Award, Package,
} from 'lucide-react'

const fmt = (n) => `Bs. ${Number(n).toFixed(2)}`
const fmtFecha = (d) => new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })

const COLORES_METODOS = {
  efectivo:      '#10b981',
  tarjeta:       '#3b82f6',
  qr:            '#f59e0b',
  transferencia: '#8b5cf6',
  mixto:         '#ec4899',
}

const toIso = (d) => d.toISOString().split('T')[0]
const today  = toIso(new Date())
const last7  = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return toIso(d) })()
const last30 = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return toIso(d) })()

export default function ReportesPage() {
  const { getSucursalId } = useAuthStore()
  const sucursalId = getSucursalId()

  const [rango, setRango] = useState({ desde: last30, hasta: today })

  const params = {
    ...rango,
    ...(sucursalId && { sucursal_id: sucursalId }),
  }

  const { data: resumen,           isLoading: lResumen   } = useResumen(params)
  const { data: ventasDia = [],    isLoading: lVentasDia } = useVentasPorDia({ ...rango, ...(sucursalId && { sucursal_id: sucursalId }), desde: last7 })
  const { data: productos = [],    isLoading: lProductos } = useProductosTop({ ...params, limit: 10 })
  const { data: metodos = [],      isLoading: lMetodos   } = useVentasPorMetodo(params)
  const { data: cajeros = [],      isLoading: lCajeros   } = usePerformanceCajeros(params)
  const { data: stockCritico = [], isLoading: lStock     } = useStockCritico(sucursalId ? { sucursal_id: sucursalId } : {})

  return (
    <Layout>
      <Header
        title="Reportes"
        subtitle={`Análisis del ${fmtFecha(rango.desde)} al ${fmtFecha(rango.hasta)}`}
      />

      {/* Selector de fechas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <DateRangeSelector
          desde={rango.desde}
          hasta={rango.hasta}
          onChange={setRango}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Ventas totales"
          value={lResumen ? '—' : fmt(resumen?.ventas_totales ?? 0)}
          icon={DollarSign}
          color="#10b981"
          sub={`${resumen?.cantidad_ventas ?? 0} ventas`}
        />
        <KpiCard
          label="Ticket promedio"
          value={lResumen ? '—' : fmt(resumen?.ticket_promedio ?? 0)}
          icon={Receipt}
          color="#3b82f6"
          sub="Por venta"
        />
        <KpiCard
          label="Pedidos totales"
          value={lResumen ? '—' : (resumen?.pedidos_totales ?? 0)}
          icon={ShoppingBag}
          color="#f59e0b"
          sub={`${resumen?.pedidos_pagados ?? 0} pagados`}
        />
        <KpiCard
          label="Tasa cancelación"
          value={lResumen ? '—' : `${resumen?.tasa_cancelacion ?? 0}%`}
          icon={resumen?.tasa_cancelacion > 10 ? TrendingDown : TrendingUp}
          color={resumen?.tasa_cancelacion > 10 ? '#ef4444' : '#10b981'}
          sub={`${resumen?.pedidos_cancelados ?? 0} cancelados`}
        />
      </div>

      {/* Gráfico de ventas por día */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Ventas últimos 7 días</h3>
            <p className="text-xs text-gray-500 mt-0.5">Evolución diaria de los ingresos</p>
          </div>
        </div>

        {lVentasDia ? (
          <SkeletonChart />
        ) : ventasDia.length === 0 ? (
          <EmptyChart label="No hay ventas en el período" />
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={ventasDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fecha" tickFormatter={fmtFecha} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v) => fmt(v)}
                  labelFormatter={fmtFecha}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid: Productos top + Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Productos top */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} style={{ color: '#f59e0b' }} />
            <h3 className="text-base font-semibold text-gray-900">Top 10 productos</h3>
          </div>

          {lProductos ? (
            <SkeletonChart />
          ) : productos.length === 0 ? (
            <EmptyChart label="Sin datos en el período" />
          ) : (
            <div className="space-y-2">
              {productos.map((p, i) => {
                const max = Math.max(...productos.map(x => x.cantidad_vendida))
                const pct = (p.cantidad_vendida / max) * 100

                return (
                  <div key={p.producto_id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold w-5 text-gray-400">#{i + 1}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">{p.producto_nombre}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-sm font-bold text-gray-900">{p.cantidad_vendida}</span>
                        <span className="text-xs text-gray-400 ml-1">unid.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, #f59e0b, #ef4444)`,
                          }} />
                      </div>
                      <span className="text-xs text-gray-400 w-20 text-right">{fmt(p.total_recaudado)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Métodos de pago */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} style={{ color: '#3b82f6' }} />
            <h3 className="text-base font-semibold text-gray-900">Métodos de pago</h3>
          </div>

          {lMetodos ? (
            <SkeletonChart />
          ) : metodos.length === 0 ? (
            <EmptyChart label="Sin datos en el período" />
          ) : (
            <div className="grid grid-cols-2 gap-4 items-center">
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={metodos}
                      dataKey="total"
                      nameKey="metodo"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {metodos.map((m, i) => (
                        <Cell key={i} fill={COLORES_METODOS[m.metodo] ?? '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {metodos.map(m => (
                  <div key={m.metodo} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: COLORES_METODOS[m.metodo] ?? '#94a3b8' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 capitalize truncate">{m.metodo}</p>
                      <p className="text-xs text-gray-500">{m.cantidad} pagos</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{fmt(m.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance de cajeros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} style={{ color: '#8b5cf6' }} />
          <h3 className="text-base font-semibold text-gray-900">Performance de cajeros</h3>
        </div>

        {lCajeros ? (
          <SkeletonChart />
        ) : cajeros.length === 0 ? (
          <EmptyChart label="Sin actividad de cajeros en el período" />
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={cajeros} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="cajero_nombre" width={120}
                  tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Bar dataKey="total" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Stock crítico */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            <h3 className="text-base font-semibold text-gray-900">Stock crítico</h3>
          </div>
          {!lStock && stockCritico.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
              {stockCritico.length} {stockCritico.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {lStock ? (
          <SkeletonChart />
        ) : stockCritico.length === 0 ? (
          <div className="py-8 text-center">
            <Package size={28} style={{ color: '#10b981', margin: '0 auto 8px' }} />
            <p className="text-sm text-gray-600">Todo el inventario está al día ✓</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stockCritico.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={14} style={{ color: '#dc2626' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.item_nombre}</p>
                  <p className="text-xs text-gray-500">
                    {s.sucursal} · <span className="capitalize">{s.categoria}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-red-700">{s.stock_actual} {s.unidad}</p>
                  <p className="text-xs text-gray-500">Mín: {s.stock_minimo}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

// ─── Subcomponentes ───────────────────────────

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-slate-900 animate-spin" />
    </div>
  )
}

function EmptyChart({ label }) {
  return (
    <div className="py-12 text-center text-sm text-gray-400">{label}</div>
  )
}