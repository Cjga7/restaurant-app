export const METODOS = [
  { value: 'efectivo',      label: 'Efectivo',       icon: '💵', bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  { value: 'tarjeta',       label: 'Tarjeta',        icon: '💳', bg: '#dbeafe', text: '#1e3a8a', dot: '#3b82f6' },
  { value: 'qr',            label: 'QR',             icon: '📱', bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  { value: 'transferencia', label: 'Transferencia',  icon: '🏦', bg: '#ede9fe', text: '#4c1d95', dot: '#8b5cf6' },
  { value: 'mixto',         label: 'Pago mixto',     icon: '🔀', bg: '#f3e8ff', text: '#6b21a8', dot: '#a855f7' },
]

export const getMetodo = (v) => METODOS.find(m => m.value === v) ?? METODOS[0]