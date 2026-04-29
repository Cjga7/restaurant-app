import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getCategoria } from './constants'

export default function TabItems({ items, isLoading, canManage, onCreate, onEdit, onDelete, onMovimiento }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        Cargando insumos...
      </div>
    )
  }

  return (
    <>
      {canManage && (
        <div className="flex justify-end mb-4">
          <button onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <Plus size={15} /> Nuevo insumo
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No hay insumos registrados todavía.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Categoría</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Unidad</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Vinculado a menú</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => {
                const cat = getCategoria(item.categoria)
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                          style={{ background: cat.bg }}>
                          {cat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{item.nombre}</p>
                          {item.descripcion && (
                            <p className="text-xs text-gray-400 truncate max-w-md">{item.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: cat.bg, color: cat.text }}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{item.unidad}</td>
                    <td className="px-5 py-3 text-xs">
                      {item.producto_menu
                        ? <span className="text-blue-600 font-medium">{item.producto_menu.nombre}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onMovimiento(item)}
                          className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          Movimiento
                        </button>
                        {canManage && (
                          <>
                            <button onClick={() => onEdit(item)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100 transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => onDelete(item)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}