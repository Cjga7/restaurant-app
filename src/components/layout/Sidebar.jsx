import { NavLink, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import {
  LayoutDashboard, Building2, UtensilsCrossed, Armchair,
  ClipboardList, CalendarDays, Users, Package,
  Wallet, BarChart3, LogOut, ChefHat, UserCog,
} from 'lucide-react'
const navItems = [
  { label: 'Dashboard',  path: '/dashboard',  permission: null,             icon: LayoutDashboard },
  { label: 'Sucursales', path: '/sucursales', permission: 'sucursales.ver', icon: Building2 },
  { label: 'Usuarios',   path: '/usuarios',   permission: 'usuarios.ver',   icon: UserCog },
  { label: 'Menú',       path: '/menu',        permission: 'menu.ver',       icon: UtensilsCrossed },
  { label: 'Mesas',      path: '/mesas',       permission: 'mesas.ver',      icon: Armchair },
  { label: 'Cocina (KDS)',  path: '/cocina',     permission: 'pedidos.gestionar', icon: ChefHat },
  { label: 'Pedidos',    path: '/pedidos',     permission: 'pedidos.ver',    icon: ClipboardList },
  { label: 'Reservas',   path: '/reservas',    permission: 'reservas.ver',   icon: CalendarDays },
  { label: 'Empleados',  path: '/empleados',   permission: 'empleados.ver',  icon: Users },
  { label: 'Inventario', path: '/inventario',  permission: 'inventario.ver', icon: Package },
  { label: 'Caja',       path: '/caja',        permission: 'caja.ver',       icon: Wallet },
  { label: 'Reportes',   path: '/reportes',    permission: 'reportes.ver',   icon: BarChart3 },
]

export default function Sidebar() {
  const { user, clearAuth, hasPermission } = useAuthStore()
  const navigate = useNavigate()

  const { mutate: logout } = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => { clearAuth(); navigate('/login') },
  })

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? 'U'

  const visibleItems = navItems.filter(
    item => !item.permission || hasPermission(item.permission)
  )

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: '#0f172a' }}>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          <ChefHat size={16} color="white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">RestaurantOS</p>
          <p className="text-xs mt-0.5 truncate max-w-[130px]"
            style={{ color: '#64748b' }}>
            {user?.sucursal?.nombre ?? 'Todas las sucursales'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'text-amber-400 border-l-2 border-amber-400 pl-[10px]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive ? { background: 'rgba(251,191,36,0.08)' } : {}}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ color: isActive ? '#fbbf24' : undefined }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: '#475569' }}>{user?.roles?.[0]}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors"
          style={{ color: '#475569' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}