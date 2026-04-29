import { useAuthStore } from '../../store/authStore'
import { useSucursales } from '../../hooks/useSucursales'
import { Building2, ChevronDown, Globe } from 'lucide-react'
import { useState } from 'react'

export default function Header({ title, subtitle }) {
  const { isSuperAdmin, sucursalActiva, setSucursalActiva } = useAuthStore()
  const { data: sucursales = [] } = useSucursales({ enabled: isSuperAdmin() })
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Selector de sucursal — solo Super Admin */}
      {isSuperAdmin() && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            {sucursalActiva ? (
              <>
                <Building2 size={15} style={{ color: '#6366f1' }} />
                <span>{sucursalActiva.nombre}</span>
              </>
            ) : (
              <>
                <Globe size={15} style={{ color: '#10b981' }} />
                <span>Todas las sucursales</span>
              </>
            )}
            <ChevronDown size={14} style={{ color: '#9ca3af' }} />
          </button>

          {open && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                onClick={() => setOpen(false)}
              />
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6,
                zIndex: 50, minWidth: 220,
                background: 'white', borderRadius: 14,
                border: '1px solid #f1f5f9',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                padding: '6px 0',
              }}>
                {/* Opción global */}
                <button
                  onClick={() => { setSucursalActiva(null); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                  style={{ fontWeight: !sucursalActiva ? 600 : 400 }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#d1fae5' }}>
                    <Globe size={13} style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p className="text-gray-900 text-xs font-medium">Todas las sucursales</p>
                    <p className="text-gray-400 text-xs">Vista global</p>
                  </div>
                  {!sucursalActiva && <span className="ml-auto text-indigo-500 text-xs">✓</span>}
                </button>

                <div className="border-t border-gray-50 my-1" />

                {/* Lista de sucursales */}
                {sucursales.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSucursalActiva(s); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                    style={{ fontWeight: sucursalActiva?.id === s.id ? 600 : 400 }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold flex-shrink-0"
                      style={{ background: '#ede9fe', color: '#6366f1' }}>
                      {s.nombre[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-xs font-medium truncate">{s.nombre}</p>
                      <p className="text-gray-400 text-xs truncate">{s.ciudad ?? 'Sin ciudad'}</p>
                    </div>
                    {sucursalActiva?.id === s.id && (
                      <span className="ml-auto text-indigo-500 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}