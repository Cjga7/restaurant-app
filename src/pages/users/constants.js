export const ROLES_INFO = {
  super_admin: {
    label: 'Super Admin',
    descripcion: 'Acceso total al sistema, todas las sucursales',
    bg: '#ede9fe', text: '#4c1d95', dot: '#7c3aed', icon: '👑',
  },
  gerente_sucursal: {
    label: 'Gerente',
    descripcion: 'Administra una sucursal completa',
    bg: '#d1fae5', text: '#065f46', dot: '#10b981', icon: '👔',
  },
  cajero: {
    label: 'Cajero',
    descripcion: 'Procesa pagos y maneja la caja',
    bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', icon: '💰',
  },
  mozo: {
    label: 'Mozo',
    descripcion: 'Toma pedidos y gestiona mesas',
    bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', icon: '🍽️',
  },
  cocinero: {
    label: 'Cocinero',
    descripcion: 'Ve pedidos en cocina (KDS)',
    bg: '#dbeafe', text: '#1e3a8a', dot: '#3b82f6', icon: '👨‍🍳',
  },
}

export const getRolInfo = (rol) => ROLES_INFO[rol] ?? {
  label: rol, descripcion: '', bg: '#f1f5f9', text: '#334155', dot: '#94a3b8', icon: '👤',
}