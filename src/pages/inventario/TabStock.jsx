import { AlertTriangle, Package, TrendingUp } from 'lucide-react'
import { getCategoria } from './constants'

function StockRow({ stock, onMovimiento, onEditUmbrales }) {
  const item = stock.item
  const cat = getCategoria(item.categoria)
  const alerta = stock.alerta_bajo
  const pct = stock.stock_ideal > 0
    ? Math.min(100, (stock.stock_actual / stock.stock_ideal) * 100)
    : 0

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ background: cat.bg }}>
            {cat.icon}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{item.nombre}</p>
            <p className="text-xs text-gray-400">{cat.label} · {item.unidad}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          {alerta && <AlertTriangle size={13} style={{ color: '#ef4444' }} />}
          <span className={`text-sm font-semibold ${alerta ? 'text-red-600' : 'text-gray-900'}`}>
            {stock.stock_actual} {item.unidad}
          </span>
        </div>
        {stock.stock_ideal > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: alerta ? '#ef4444' : pct > 60 ? '#10b981' : '#f59e0b',
                }} />
            </div>
            <span className="text-xs text-gray-400">/ {stock.stock_ideal}</span>
          </div>
        )}
      </td>

      <td className="px-5 py-3 text-xs text-gray-500">
        Mín: {stock.stock_minimo}
        {stock.stock_ideal > 0 && <span> · Ideal: {stock.stock_ideal}</span>}
      </td>

      <td className="px-5 py-3 text-sm text-gray-600">
        {stock.precio_compra ? `Bs. ${Number(stock.precio_compra).toFixed(2)}` : '—'}
      </td>

      <td className="px-5 py-3 text-sm font-semibold text-gray-900">
        Bs. {Number(stock.valor_stock).toFixed(2)}
      </td>

      <td className="px-5 py-3">
        <div className="flex gap-1 justify-end">
          <button onClick={() => onMovimiento(stock)}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            Movimiento
          </button>
          <button onClick={() => onEditUmbrales(stock)}
            className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            Umbrales
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function TabStock({ stocks, isLoading, filtroCategoria, setFiltroCategoria, onMovimiento, onEditUmbrales }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        Cargando stock...
      </div>
    )
  }

  const conAlerta   = stocks.filter(s => s.alerta_bajo).length
  const valorTotal  = stocks.reduce((sum, s) => sum + Number(s.valor_stock ?? 0), 0)

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#ede9fe' }}>
            <Package size={18} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stocks.length}</p>
            <p className="text-xs text-gray-500">Items en stock</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: conAlerta > 0 ? '#fee2e2' : '#f1f5f9' }}>
            <AlertTriangle size={18} style={{ color: conAlerta > 0 ? '#ef4444' : '#94a3b8' }} />
          </div>
          <div>
            <p className={`text-xl font-bold ${conAlerta > 0 ? 'text-red-600' : 'text-gray-900'}`}>{conAlerta}</p>
            <p className="text-xs text-gray-500">Con alerta de bajo</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#d1fae5' }}>
            <TrendingUp size={18} style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">Bs. {valorTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Valor total del stock</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-500">Filtrar:</span>
        {[
          { value: null,          label: 'Todos' },
          { value: 'ingrediente', label: '🥩 Ingredientes' },
          { value: 'bebida',      label: '🥤 Bebidas' },
          { value: 'empaque',     label: '📦 Empaque' },
          { value: 'otro',        label: '📋 Otros' },
        ].map(f => (
          <button
            key={f.label}
            onClick={() => setFiltroCategoria(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              filtroCategoria === f.value
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {stocks.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No hay items en stock todavía. Registrá una entrada desde el tab "Insumos".
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Insumo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Stock actual</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Umbrales</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Precio compra</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Valor</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stocks.map(s => (
                <StockRow key={s.id} stock={s} onMovimiento={onMovimiento} onEditUmbrales={onEditUmbrales} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}