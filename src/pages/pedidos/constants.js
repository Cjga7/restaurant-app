export const ESTADOS = [
  { value: 'abierto',         label: 'Abierto',         bg: '#f1f5f9', text: '#334155', dot: '#64748b' },
  { value: 'enviado',         label: 'Enviado',         bg: '#dbeafe', text: '#1e3a8a', dot: '#3b82f6' },
  { value: 'en_preparacion',  label: 'En preparación',  bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  { value: 'listo',           label: 'Listo',           bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  { value: 'entregado',       label: 'Entregado',       bg: '#ede9fe', text: '#4c1d95', dot: '#8b5cf6' },
  { value: 'pagado',          label: 'Pagado',          bg: '#f0f9ff', text: '#075985', dot: '#0ea5e9' },
  { value: 'cancelado',       label: 'Cancelado',       bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
]

export const TIPOS = [
  { value: 'mesa',     label: 'Mesa',        icon: '🪑' },
  { value: 'delivery', label: 'Delivery',    icon: '🛵' },
  { value: 'llevar',   label: 'Para llevar', icon: '🥡' },
]

export const getEstado = (v) => ESTADOS.find(e => e.value === v) ?? ESTADOS[0]
export const getTipo   = (v) => TIPOS.find(t => t.value === v) ?? TIPOS[0]

// Flujo normal de estados
export const SIGUIENTE_ESTADO = {
  abierto:         'enviado',
  enviado:         'en_preparacion',
  en_preparacion:  'listo',
  listo:           'entregado',
  entregado:       'pagado',
}

export const LABEL_SIGUIENTE = {
  abierto:         'Enviar a cocina',
  enviado:         'Marcar en preparación',
  en_preparacion:  'Marcar como listo',
  listo:           'Marcar entregado',
  entregado:       'Cobrar',
}