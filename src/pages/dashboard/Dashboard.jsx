import { useAuthStore } from '../../store/authStore'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import { useSucursales } from '../../hooks/useSucursales'
import { useCategorias, useProductos } from '../../hooks/useMenu'
import { Building2, UtensilsCrossed, Layers, TrendingUp } from 'lucide-react'

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '15' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, getSucursalId, sucursalActiva } = useAuthStore()
  const { data: sucursales = [] } = useSucursales()
  const { data: categorias = [] } = useCategorias()
  const { data: productos = [] } = useProductos()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <Layout>
      <Header
        title={`${greeting}, ${user?.name}`}
        subtitle={
          user?.sucursal?.nombre
            ? `Gestionando ${user.sucursal.nombre}`
            : sucursalActiva?.nombre
              ? `Gestionando ${sucursalActiva.nombre}`
              : 'Vista global de todas las sucursales'
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Sucursales"
          value={sucursales.length}
          icon={Building2}
          color="#6366f1"
          sub={`${sucursales.filter(s => s.activo).length} activas`}
        />
        <StatCard
          label="Categorías"
          value={categorias.length}
          icon={Layers}
          color="#f59e0b"
          sub="En el menú"
        />
        <StatCard
          label="Productos"
          value={productos.length}
          icon={UtensilsCrossed}
          color="#10b981"
          sub="Registrados"
        />
        <StatCard
          label="Pedidos hoy"
          value="—"
          icon={TrendingUp}
          color="#ef4444"
          sub="Próximamente"
        />
      </div>

      {/* Roles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">Tu acceso</p>
        <div className="flex flex-wrap gap-2">
          {user?.roles?.map(role => (
            <span key={role}
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: '#fef3c7', color: '#92400e' }}>
              {role}
            </span>
          ))}
          {user?.permissions?.slice(0, 6).map(p => (
            <span key={p}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: '#f1f5f9', color: '#64748b' }}>
              {p}
            </span>
          ))}
          {(user?.permissions?.length ?? 0) > 6 && (
            <span className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: '#f1f5f9', color: '#94a3b8' }}>
              +{user.permissions.length - 6} más
            </span>
          )}
        </div>
      </div>
    </Layout>
  )
}