export const CATEGORIAS = [
  { value: 'ingrediente', label: 'Ingrediente', bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', icon: '🥩' },
  { value: 'bebida',      label: 'Bebida',      bg: '#dbeafe', text: '#1e3a8a', dot: '#3b82f6', icon: '🥤' },
  { value: 'empaque',     label: 'Empaque',     bg: '#f1f5f9', text: '#334155', dot: '#64748b', icon: '📦' },
  { value: 'otro',        label: 'Otro',        bg: '#ede9fe', text: '#4c1d95', dot: '#8b5cf6', icon: '📋' },
]

export const UNIDADES = [
  { value: 'kg',       label: 'Kilogramos (kg)' },
  { value: 'g',        label: 'Gramos (g)' },
  { value: 'litro',    label: 'Litros (L)' },
  { value: 'ml',       label: 'Mililitros (ml)' },
  { value: 'unidad',   label: 'Unidad' },
  { value: 'caja',     label: 'Caja' },
  { value: 'paquete',  label: 'Paquete' },
  { value: 'botella',  label: 'Botella' },
  { value: 'lata',     label: 'Lata' },
]

export const TIPOS_MOVIMIENTO = [
  { value: 'entrada', label: 'Entrada', bg: '#d1fae5', text: '#065f46', dot: '#10b981', icon: '↓' },
  { value: 'salida',  label: 'Salida',  bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', icon: '↑' },
  { value: 'ajuste',  label: 'Ajuste',  bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', icon: '⇅' },
]

export const MOTIVOS = [
  { value: 'compra',            label: 'Compra' },
  { value: 'consumo',           label: 'Consumo' },
  { value: 'merma',             label: 'Merma' },
  { value: 'descarte',          label: 'Descarte / vencido' },
  { value: 'robo',              label: 'Robo / pérdida' },
  { value: 'devolucion',        label: 'Devolución' },
  { value: 'transferencia',     label: 'Transferencia' },
  { value: 'inventario_fisico', label: 'Inventario físico' },
  { value: 'otro',              label: 'Otro' },
]

export const getCategoria = (v) => CATEGORIAS.find(c => c.value === v) ?? CATEGORIAS[0]
export const getTipoMov   = (v) => TIPOS_MOVIMIENTO.find(t => t.value === v) ?? TIPOS_MOVIMIENTO[0]
export const getUnidad    = (v) => UNIDADES.find(u => u.value === v)?.label?.split(' ')[0] ?? v