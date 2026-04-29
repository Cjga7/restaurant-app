import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import { useEmpleados, useCreateEmpleado, useUpdateEmpleado, useDeleteEmpleado } from '../../hooks/useEmpleados'
import { useSucursales } from '../../hooks/useSucursales'
import { useAuthStore } from '../../store/authStore'
import { useUsers } from '../../hooks/useUsers'
import {
  Plus, Pencil, Trash2, Search, Mail, Phone, MapPin,
  Calendar, User, Briefcase, DollarSign, Filter, KeyRound, ShieldCheck,
} from 'lucide-react'

const CARGOS = [
  { value: 'gerente',  label: 'Gerente',  color: '#6366f1', bg: '#ede9fe', text: '#4c1d95' },
  { value: 'cajero',   label: 'Cajero',   color: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  { value: 'mozo',     label: 'Mozo',     color: '#ef4444', bg: '#fee2e2', text: '#991b1b' },
  { value: 'cocinero', label: 'Cocinero', color: '#10b981', bg: '#d1fae5', text: '#065f46' },
  { value: 'ayudante', label: 'Ayudante', color: '#64748b', bg: '#f1f5f9', text: '#334155' },
]

const TURNOS = [
  { value: 'mañana',   label: 'Mañana' },
  { value: 'tarde',    label: 'Tarde' },
  { value: 'noche',    label: 'Noche' },
  { value: 'completo', label: 'Completo' },
]

const getCargo = (value) => CARGOS.find(c => c.value === value) ?? CARGOS[0]

const EMPTY_FORM = {
  sucursal_id: '',
  user_id: '',
  nombres: '',
  apellidos: '',
  ci: '',
  telefono: '',
  email: '',
  direccion: '',
  fecha_nacimiento: '',
  fecha_ingreso: new Date().toISOString().split('T')[0],
  cargo: 'mozo',
  turno: 'completo',
  salario: '',
  activo: true,
}

function Avatar({ empleado, size = 40 }) {
  const cargo = getCargo(empleado.cargo)
  const initials = `${empleado.nombres?.[0] ?? ''}${empleado.apellidos?.[0] ?? ''}`.toUpperCase()

  if (empleado.foto) {
    return (
      <img
        src={`http://127.0.0.1:8000/storage/${empleado.foto}`}
        alt={empleado.nombre_completo}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${cargo.color}20, ${cargo.color}40)`,
        color: cargo.color,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  )
}

function CargoBadge({ cargo }) {
  const c = getCargo(cargo)
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {c.label}
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

export default function EmpleadosPage() {
  const { hasPermission, isSuperAdmin, user, getSucursalId } = useAuthStore()
  const canManage = hasPermission('empleados.gestionar')

  const [search, setSearch]         = useState('')
  const [filtroCargo, setFiltroCargo] = useState(null)
  const [modal, setModal]           = useState(null) // 'form' | 'detail' | 'delete'
  const [editing, setEditing]       = useState(null)
  const [viewing, setViewing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile]     = useState(null)
  const [error, setError]           = useState('')

  const queryParams = {
    ...(filtroCargo && { cargo: filtroCargo }),
    ...(getSucursalId() && { sucursal_id: getSucursalId() }),
  }

  const { data: empleados = [], isLoading } = useEmpleados(queryParams)
const { data: sucursales = [] }           = useSucursales()
const { data: usuarios = [] }             = useUsers()

const createMut = useCreateEmpleado()
const updateMut = useUpdateEmpleado()
const deleteMut = useDeleteEmpleado()

// Filtrado por búsqueda local
const filtered = empleados.filter(emp => {
  const q = search.toLowerCase()
  return !q
    || emp.nombre_completo?.toLowerCase().includes(q)
    || emp.ci?.includes(q)
    || emp.email?.toLowerCase().includes(q)
})

// Usuarios disponibles para vincular: misma sucursal + no vinculados a otro empleado
const usuariosDisponibles = usuarios.filter(u => {
  if (form.sucursal_id && u.sucursal_id !== form.sucursal_id && u.roles?.[0] !== 'super_admin') {
    return false
  }
  const yaVinculado = empleados.some(e => e.user_id === u.id && e.id !== editing?.id)
  return !yaVinculado
})

  const openNew = () => {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      sucursal_id: isSuperAdmin() ? '' : (user?.sucursal_id ?? ''),
    })
    setFotoPreview(null)
    setFotoFile(null)
    setError('')
    setModal('form')
  }

  const openEdit = (emp) => {
    setEditing(emp)
    setForm({
      sucursal_id:      emp.sucursal_id,
      user_id:          emp.user_id ?? '',
      nombres:          emp.nombres,
      apellidos:        emp.apellidos,
      ci:               emp.ci,
      telefono:         emp.telefono ?? '',
      email:            emp.email ?? '',
      direccion:        emp.direccion ?? '',
      fecha_nacimiento: emp.fecha_nacimiento ?? '',
      fecha_ingreso:    emp.fecha_ingreso,
      cargo:            emp.cargo,
      turno:            emp.turno,
      salario:          emp.salario ?? '',
      activo:           emp.activo,
    })
    setFotoPreview(emp.foto ? `http://127.0.0.1:8000/storage/${emp.foto}` : null)
    setFotoFile(null)
    setError('')
    setModal('form')
  }

  const openDetail = (emp) => {
    setViewing(emp)
    setModal('detail')
  }

  const submitForm = () => {
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.ci.trim() || !form.sucursal_id)
      return setError('Nombres, apellidos, CI y sucursal son obligatorios.')

    const payload = { ...form, ...(fotoFile ? { foto: fotoFile } : {}) }
    const opts = {
      onSuccess: () => setModal(null),
      onError: (e) => setError(e.response?.data?.message ?? 'Error al guardar.'),
    }

    editing
      ? updateMut.mutate({ id: editing.id, data: payload }, opts)
      : createMut.mutate(payload, opts)
  }

  const isSaving = createMut.isPending || updateMut.isPending

  // Stats
  const stats = CARGOS.map(c => ({
    ...c,
    count: empleados.filter(e => e.cargo === c.value).length,
  }))

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <Header
          title="Empleados"
          subtitle={`${empleados.length} empleados registrados${filtroCargo ? ` · filtro: ${getCargo(filtroCargo).label}` : ''}`}
        />
        {canManage && (
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <Plus size={15} /> Nuevo empleado
          </button>
        )}
      </div>

      {/* Stats por cargo */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {stats.map(s => (
          <button
            key={s.value}
            onClick={() => setFiltroCargo(filtroCargo === s.value ? null : s.value)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              filtroCargo === s.value
                ? 'border-2 shadow-sm'
                : 'bg-white border-gray-100 hover:shadow-sm'
            }`}
            style={filtroCargo === s.value ? { background: s.bg, borderColor: s.color } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <p className="text-xs font-medium"
                style={{ color: filtroCargo === s.value ? s.text : '#6b7280' }}>
                {s.label}
              </p>
            </div>
            <p className="text-2xl font-bold" style={{ color: filtroCargo === s.value ? s.text : '#111827' }}>
              {s.count}
            </p>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, CI o email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>
        {filtroCargo && (
          <button onClick={() => setFiltroCargo(null)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando empleados...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#f8fafc' }}>
              <User size={22} style={{ color: '#cbd5e1' }} />
            </div>
            <p className="text-sm text-gray-500">
              {search || filtroCargo ? 'No se encontraron empleados con esos filtros.' : 'No hay empleados registrados aún.'}
            </p>
            {canManage && !search && !filtroCargo && (
              <button onClick={openNew}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2">
                Agregar el primero
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Empleado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">CI</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Cargo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Turno</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Contacto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  onClick={() => openDetail(emp)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar empleado={emp} size={38} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{emp.nombre_completo}</p>
                        {emp.sucursal && (
                          <p className="text-xs text-gray-400 truncate">{emp.sucursal.nombre}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
  <div className="flex items-center gap-2">
    <span className="text-gray-600 font-mono text-xs">{emp.ci}</span>
    {emp.user_id && (
      <span title="Tiene acceso al sistema"
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: '#d1fae5' }}>
        <KeyRound size={10} style={{ color: '#065f46' }} />
      </span>
    )}
  </div>
</td>
                  <td className="px-5 py-3"><CargoBadge cargo={emp.cargo} /></td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{emp.turno}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {emp.telefono && <p>{emp.telefono}</p>}
                    {emp.email && <p className="truncate max-w-[160px]">{emp.email}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      emp.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {emp.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canManage && (
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); openEdit(emp) }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setEditing(emp); setModal('delete') }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ───────── Modal: Detalle ───────── */}
      <Modal isOpen={modal === 'detail'} onClose={() => setModal(null)} title="Detalle del empleado" maxWidth="max-w-lg">
        {viewing && (
          <div>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
              <Avatar empleado={viewing} size={64} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base">{viewing.nombre_completo}</h3>
                <p className="text-sm text-gray-500 mt-0.5">CI: {viewing.ci}</p>
                <div className="flex gap-2 mt-2">
                  <CargoBadge cargo={viewing.cargo} />
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                    Turno {viewing.turno}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              
              {viewing.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={14} style={{ color: '#9ca3af' }} />
                  <span>{viewing.email}</span>
                </div>
              )}
              {viewing.telefono && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={14} style={{ color: '#9ca3af' }} />
                  <span>{viewing.telefono}</span>
                </div>
              )}
              {viewing.direccion && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={14} style={{ color: '#9ca3af' }} />
                  <span>{viewing.direccion}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={14} style={{ color: '#9ca3af' }} />
                <span>Ingreso: {new Date(viewing.fecha_ingreso).toLocaleDateString()}</span>
              </div>
              {viewing.salario && (
                <div className="flex items-center gap-3 text-gray-600">
                  <DollarSign size={14} style={{ color: '#9ca3af' }} />
                  <span>Salario: Bs. {Number(viewing.salario).toFixed(2)}</span>
                </div>
              )}
              {viewing.sucursal && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase size={14} style={{ color: '#9ca3af' }} />
                  <span>{viewing.sucursal.nombre}</span>
                </div>
              )}
            </div>
            {viewing.user_id && viewing.user && (
  <div className="mt-3 pt-3 border-t border-gray-100">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
      Acceso al sistema
    </p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: '#d1fae5' }}>
        <KeyRound size={14} style={{ color: '#065f46' }} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{viewing.user.name}</p>
        <p className="text-xs text-gray-500">{viewing.user.email}</p>
      </div>
    </div>
  </div>
)}
          </div>
        )}
      </Modal>

      {/* ───────── Modal: Formulario ───────── */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)}
        title={editing ? 'Editar empleado' : 'Nuevo empleado'} maxWidth="max-w-lg">
        <div className="space-y-4">

          {/* Foto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Foto</label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer group hover:border-slate-400 transition-all flex-shrink-0"
                onClick={() => document.getElementById('emp-foto').click()}
              >
                {fotoPreview ? (
                  <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={22} style={{ color: '#cbd5e1' }} />
                  </div>
                )}
                <input id="emp-foto" type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files[0]
                    if (!file) return
                    setFotoFile(file)
                    setFotoPreview(URL.createObjectURL(file))
                  }}
                />
              </div>
              <div className="text-xs text-gray-500">
                <p className="font-medium text-gray-700">Foto del empleado</p>
                <p>Click en el círculo para subir · JPG, PNG máx 2MB</p>
              </div>
            </div>
          </div>

          {/* Sucursal — solo Super Admin elige */}
          {isSuperAdmin() && (
            <SelectField label="Sucursal" required
              value={form.sucursal_id}
              onChange={e => setForm({ ...form, sucursal_id: Number(e.target.value) })}>
              <option value="">Seleccionar sucursal</option>
              {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </SelectField>
          )}

          {/* Nombres */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Nombres" required placeholder="Juan Carlos"
              value={form.nombres}
              onChange={e => setForm({ ...form, nombres: e.target.value })} />
            <InputField label="Apellidos" required placeholder="Pérez Quispe"
              value={form.apellidos}
              onChange={e => setForm({ ...form, apellidos: e.target.value })} />
          </div>

          {/* CI + fecha nac */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Cédula de identidad" required placeholder="1234567"
              value={form.ci}
              onChange={e => setForm({ ...form, ci: e.target.value })} />
            <InputField label="Fecha de nacimiento" type="date"
              value={form.fecha_nacimiento}
              onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} />
          </div>

          {/* Teléfono + Email */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Teléfono" placeholder="70123456"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })} />
            <InputField label="Email" type="email" placeholder="empleado@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <InputField label="Dirección" placeholder="Av. Principal 123"
            value={form.direccion}
            onChange={e => setForm({ ...form, direccion: e.target.value })} />

          {/* Cargo + Turno */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Cargo" required
              value={form.cargo}
              onChange={e => setForm({ ...form, cargo: e.target.value })}>
              {CARGOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </SelectField>
            <SelectField label="Turno"
              value={form.turno}
              onChange={e => setForm({ ...form, turno: e.target.value })}>
              {TURNOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </SelectField>
          </div>
{/* ── Acceso al sistema ── */}
<div className="border-t border-gray-100 pt-4 mt-2">
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
    <ShieldCheck size={13} />
    Acceso al sistema
  </p>

  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1.5">
      Usuario vinculado (opcional)
    </label>
    <select
      value={form.user_id}
      onChange={e => setForm({ ...form, user_id: e.target.value ? Number(e.target.value) : '' })}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
    >
      <option value="">Sin acceso al sistema</option>
      {usuariosDisponibles.map(u => (
        <option key={u.id} value={u.id}>
          {u.name} ({u.email}) · {u.roles?.[0] ?? 'sin rol'}
        </option>
      ))}
    </select>

    <p className="text-xs text-gray-400 mt-1.5">
      💡 Vinculá un usuario si este empleado necesita ingresar al sistema.
      Los usuarios deben crearse antes desde el módulo Usuarios.
    </p>
  </div>
</div>
          {/* Fecha ingreso + salario */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Fecha de ingreso" type="date" required
              value={form.fecha_ingreso}
              onChange={e => setForm({ ...form, fecha_ingreso: e.target.value })} />
            <InputField label="Salario (Bs.)" type="number" min="0" step="0.01" placeholder="2500.00"
              value={form.salario}
              onChange={e => setForm({ ...form, salario: e.target.value })} />
          </div>

          {editing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activo}
                onChange={e => setForm({ ...form, activo: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Empleado activo</span>
            </label>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(null)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={submitForm} disabled={isSaving}
              className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
              {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear empleado'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ───────── Modal: Eliminar ───────── */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Eliminar empleado">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminás a <span className="font-semibold text-gray-900">{editing?.nombre_completo}</span>?
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