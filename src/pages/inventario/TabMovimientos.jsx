import { getTipoMov, getCategoria } from './constants'
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'

const ICONOS = { entrada: ArrowDown, salida: ArrowUp, ajuste: RefreshCw }

const formatDateTime = (d) => {
  const f = new Date(d)
  return f.toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function TabMovimientos({ movimientos, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        Cargando historial...
      </div>
    )
  }

  if (movimientos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        No hay movimientos registrados todavía.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Tipo</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Insumo</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Cantidad</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Stock</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Motivo</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Usuario</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {movimientos.map(m => {
            const t = getTipoMov(m.tipo)
            const cat = m.item ? getCategoria(m.item.categoria) : null
            const Icon = ICONOS[m.tipo]

            return (
              <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-xs text-gray-500">{formatDateTime(m.created_at)}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: t.bg, color: t.text }}>
                    <Icon size={11} />
                    {t.label}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {cat && (
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                        style={{ background: cat.bg }}>{cat.icon}</span>
                    )}
                    <span className="text-sm font-medium text-gray-900">{m.item?.nombre ?? '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-semibold text-sm"
                  style={{ color: t.text }}>
                  {m.tipo === 'entrada' && '+'}
                  {m.tipo === 'salida' && '−'}
                  {m.cantidad} {m.item?.unidad ?? ''}
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {m.stock_anterior} → <span className="font-semibold text-gray-900">{m.stock_nuevo}</span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-600 capitalize">
                  {m.motivo?.replace('_', ' ') ?? '—'}
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {m.user?.name ?? 'Sistema'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}