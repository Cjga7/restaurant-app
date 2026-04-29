import { useState, useMemo } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import { useNavigate } from 'react-router-dom'
import { useMesas } from '../../hooks/useMesas'
import { useSucursales } from '../../hooks/useSucursales'
import { useAuthStore } from '../../store/authStore'
import {
  Plus, Pencil, Trash2, Calendar, Clock, Users, Phone, Mail,
  MessageSquare, CheckCircle2, XCircle, User, Armchair,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { UserCheck } from 'lucide-react'
import { useReservas, useCreateReserva, useUpdateReserva, useDeleteReserva, useCambiarEstadoReserva, useClienteLlego } from '../../hooks/useReservas'
const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  { value: 'confirmada', label: 'Confirmada', bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  { value: 'completada', label: 'Completada', bg: '#dbeafe', text: '#1e3a8a', dot: '#3b82f6' },
  { value: 'cancelada', label: 'Cancelada', bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  { value: 'no_asistio', label: 'No asistió', bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
]

const getEstado = (v) => ESTADOS.find(e => e.value === v) ?? ESTADOS[0]

const EMPTY_FORM = {
  sucursal_id: '',
  mesa_id: '',
  cliente_nombre: '',
  cliente_telefono: '',
  cliente_email: '',
  cantidad_personas: 2,
  fecha_hora: '',
  estado: 'pendiente',
  notas: '',
}


const formatFecha = (f) => new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
const formatHora = (f) => new Date(f).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })
const toInputDate = (d) => d.toISOString().split('T')[0]
// ── Componentes auxiliares ───────────────────────
function EstadoBadge({ estado }) {
  const e = getEstado(estado)
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: e.bg, color: e.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.dot }} />
      {e.label}
    </span>
  )
}

function InputField({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
        {...props}
      />
    </div>
  )
}

function SelectField({ label, required, children, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// Tarjeta individual de reserva
function ReservaCard({ reserva, canManage, onEdit, onDelete, onCambiarEstado, onClienteLlego, navigate }) {
  const e = getEstado(reserva.estado)
  const isPast = new Date(reserva.fecha_hora) < new Date()
  const personas = reserva.cantidad_personas

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: e.bg, color: e.text }}
          >
            {personas}p
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{reserva.cliente_nombre}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <Phone size={11} />
              <span>{reserva.cliente_telefono}</span>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => onEdit(reserva)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={() => onDelete(reserva)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Info fecha/hora/mesa */}
      <div className="flex items-center gap-4 py-3 mb-3 border-y border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar size={12} style={{ color: '#94a3b8' }} />
          <span>{formatFecha(reserva.fecha_hora)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock size={12} style={{ color: '#94a3b8' }} />
          <span>{formatHora(reserva.fecha_hora)}</span>
        </div>
        {reserva.mesa && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 ml-auto">
            <Armchair size={12} style={{ color: '#94a3b8' }} />
            <span>Mesa {reserva.mesa.numero}</span>
          </div>
        )}
      </div>

      {reserva.notas && (
        <div className="flex items-start gap-2 mb-3">
          <MessageSquare size={12} style={{ color: '#cbd5e1', marginTop: 2, flexShrink: 0 }} />
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{reserva.notas}</p>
        </div>
      )}

      {/* Footer: estado + acciones rápidas */}
      <div className="flex items-center justify-between">
        <EstadoBadge estado={reserva.estado} />

        {canManage && reserva.estado === 'confirmada' && isPast && (
  <button onClick={() => onCambiarEstado(reserva.id, 'completada')}
    className="text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
  >
    Marcar como completada
  </button>
)}
        {canManage && reserva.estado === 'confirmada' && (
          <button
            onClick={() => onClienteLlego(reserva)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white' }}
          >
            <UserCheck size={12} />
            Cliente llegó
          </button>
        )}
      </div>
    </div>
  )
}

// ──────── Página principal ────────────────────────────────
export default function ReservasPage() {
  const { hasPermission, isSuperAdmin, user, getSucursalId } = useAuthStore()
  const canManage = hasPermission('reservas.gestionar')

  const [fechaSel, setFechaSel] = useState(toInputDate(new Date()))
  const [filtroEstado, setFiltroEstado] = useState(null)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

const navigate = useNavigate()
const llegoMut = useClienteLlego()

const handleClienteLlego = (reserva) => {
  if (!confirm(`¿Confirmás que llegó ${reserva.cliente_nombre} (${reserva.cantidad_personas} personas)?\n\nSe creará un pedido para la Mesa ${reserva.mesa?.numero}.`)) return

  llegoMut.mutate(reserva.id, {
    onSuccess: ({ pedido }) => {
      // Redirigir al pedido recién creado
      navigate('/pedidos')
    },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al registrar la llegada.'),
  })
}
  const queryParams = {
    ...(fechaSel && { fecha: fechaSel }),
    ...(filtroEstado && { estado: filtroEstado }),
    ...(getSucursalId() && { sucursal_id: getSucursalId() }),
  }

  const { data: reservas = [], isLoading } = useReservas(queryParams)
  const { data: mesas = [] } = useMesas(getSucursalId() ? { sucursal_id: getSucursalId() } : {})
  const { data: sucursales = [] } = useSucursales()

  const createMut = useCreateReserva()
  const updateMut = useUpdateReserva()
  const deleteMut = useDeleteReserva()
  const estadoMut = useCambiarEstadoReserva()

  // Stats por estado (de las reservas filtradas por fecha)
  const stats = useMemo(() => ESTADOS.map(e => ({
    ...e,
    count: reservas.filter(r => r.estado === e.value).length,
  })), [reservas])

  const changeDay = (delta) => {
    const d = new Date(fechaSel)
    d.setDate(d.getDate() + delta)
    setFechaSel(toInputDate(d))
  }

  const openNew = () => {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      sucursal_id: isSuperAdmin() ? '' : (user?.sucursal_id ?? ''),
      fecha_hora: `${fechaSel}T20:00`,
    })
    setError('')
    setModal('form')
  }

  const openEdit = (reserva) => {
    setEditing(reserva)
    // Convertir ISO a formato datetime-local
    const f = new Date(reserva.fecha_hora)
    const local = new Date(f.getTime() - f.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

    setForm({
      sucursal_id: reserva.sucursal_id,
      mesa_id: reserva.mesa_id ?? '',
      cliente_nombre: reserva.cliente_nombre,
      cliente_telefono: reserva.cliente_telefono,
      cliente_email: reserva.cliente_email ?? '',
      cantidad_personas: reserva.cantidad_personas,
      fecha_hora: local,
      estado: reserva.estado,
      notas: reserva.notas ?? '',
    })
    setError('')
    setModal('form')
  }

  const submitForm = () => {
    if (!form.cliente_nombre.trim() || !form.cliente_telefono.trim() || !form.fecha_hora || !form.sucursal_id)
      return setError('Cliente, teléfono, fecha/hora y sucursal son obligatorios.')

    // Convertir datetime-local a formato backend
    const payload = {
      ...form,
      fecha_hora: form.fecha_hora.replace('T', ' ') + ':00',
      mesa_id: form.mesa_id || null,
    }

    const opts = {
      onSuccess: () => setModal(null),
      onError: (e) => setError(e.response?.data?.message ?? 'Error al guardar.'),
    }

    editing
      ? updateMut.mutate({ id: editing.id, data: payload }, opts)
      : createMut.mutate(payload, opts)
  }

  const isSaving = createMut.isPending || updateMut.isPending

  // Mesas disponibles para reservar (disponibles + la actual si está editando)
  const mesasDisponibles = mesas.filter(m =>
    m.estado === 'disponible' || m.estado === 'reservada' || m.id === editing?.mesa_id
  )

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <Header
          title="Reservas"
          subtitle={`${reservas.length} reservas${fechaSel ? ` para el ${formatFecha(fechaSel)}` : ''}`}
        />
        {canManage && (
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <Plus size={15} /> Nueva reserva
          </button>
        )}
      </div>

      {/* Selector de fecha */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center justify-between">
        <button
          onClick={() => changeDay(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="flex items-center gap-3">
          <Calendar size={16} style={{ color: '#6366f1' }} />
          <input
            type="date"
            value={fechaSel}
            onChange={e => setFechaSel(e.target.value)}
            className="border-none bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
          />
          <button
            onClick={() => setFechaSel(toInputDate(new Date()))}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Hoy
          </button>
        </div>

        <button
          onClick={() => changeDay(1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      {/* Stats por estado */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {stats.map(s => (
          <button
            key={s.value}
            onClick={() => setFiltroEstado(filtroEstado === s.value ? null : s.value)}
            className={`rounded-2xl border p-4 text-left transition-all ${filtroEstado === s.value
              ? 'border-2 shadow-sm'
              : 'bg-white border-gray-100 hover:shadow-sm'
              }`}
            style={filtroEstado === s.value ? { background: s.bg, borderColor: s.dot } : {}}
          >
            <p className="text-2xl font-bold"
              style={{ color: filtroEstado === s.value ? s.text : '#111827' }}>
              {s.count}
            </p>
            <p className="text-xs mt-0.5 font-medium"
              style={{ color: filtroEstado === s.value ? s.text : '#6b7280' }}>
              {s.label}
            </p>
          </button>
        ))}
      </div>

      {/* Grid de reservas */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center text-sm text-gray-400">
          Cargando reservas...
        </div>
      ) : reservas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#f8fafc' }}>
            <Calendar size={22} style={{ color: '#cbd5e1' }} />
          </div>
          <p className="text-sm text-gray-500">No hay reservas para este día.</p>
          {canManage && (
            <button onClick={openNew}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2">
              Crear una reserva
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reservas.map(r => (
            <ReservaCard
              key={r.id}
              reserva={r}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={(r) => { setEditing(r); setModal('delete') }}
              onCambiarEstado={(id, estado) => estadoMut.mutate({ id, estado })}
              onClienteLlego={handleClienteLlego}
            />
          ))}
        </div>
      )}

      {/* ────── Modal: Formulario ────── */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)}
        title={editing ? 'Editar reserva' : 'Nueva reserva'} maxWidth="max-w-lg">
        <div className="space-y-4">

          {isSuperAdmin() && (
            <SelectField label="Sucursal" required
              value={form.sucursal_id}
              onChange={e => setForm({ ...form, sucursal_id: Number(e.target.value) })}>
              <option value="">Seleccionar sucursal</option>
              {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </SelectField>
          )}

          {/* Cliente */}
          <div className="pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos del cliente</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <InputField label="Nombre" required placeholder="Carlos Mamani"
                value={form.cliente_nombre}
                onChange={e => setForm({ ...form, cliente_nombre: e.target.value })} />
              <InputField label="Teléfono" required placeholder="70123456"
                value={form.cliente_telefono}
                onChange={e => setForm({ ...form, cliente_telefono: e.target.value })} />
            </div>
            <InputField label="Email" type="email" placeholder="cliente@email.com"
              value={form.cliente_email}
              onChange={e => setForm({ ...form, cliente_email: e.target.value })} />
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Fecha y hora" required type="datetime-local"
              value={form.fecha_hora}
              onChange={e => setForm({ ...form, fecha_hora: e.target.value })} />
            <InputField label="Cantidad de personas" required type="number" min="1" max="50"
              value={form.cantidad_personas}
              onChange={e => setForm({ ...form, cantidad_personas: Number(e.target.value) })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Mesa (opcional)"
              value={form.mesa_id}
              onChange={e => setForm({ ...form, mesa_id: e.target.value })}>
              <option value="">Sin asignar</option>
              {mesasDisponibles.map(m => (
                <option key={m.id} value={m.id}>
                  Mesa {m.numero} · {m.capacidad}p {m.ubicacion ? `(${m.ubicacion})` : ''}
                </option>
              ))}
            </SelectField>

            <SelectField label="Estado"
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value })}>
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </SelectField>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas</label>
            <textarea rows={2} placeholder="Alergias, ocasión especial, preferencias..."
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(null)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={submitForm} disabled={isSaving}
              className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
              {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear reserva'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ────── Modal: Eliminar ────── */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Eliminar reserva">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminás la reserva de <span className="font-semibold text-gray-900">{editing?.cliente_nombre}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setModal(null)}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => deleteMut.mutate(editing.id, { onSuccess: () => setModal(null) })}
            disabled={deleteMut.isPending}
            className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
            {deleteMut.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}