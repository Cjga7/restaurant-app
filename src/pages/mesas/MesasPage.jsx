import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import { useMesas, useCreateMesa, useUpdateMesa, useDeleteMesa, useCambiarEstadoMesa } from '../../hooks/useMesas'
import { useSucursales } from '../../hooks/useSucursales'
import { useAuthStore } from '../../store/authStore'
import { Plus, Users, MapPin, Pencil, Trash2, ChevronDown } from 'lucide-react'

const ESTADOS = [
  { value: 'disponible', label: 'Disponible', bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  { value: 'ocupada',    label: 'Ocupada',    bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  { value: 'reservada',  label: 'Reservada',  bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  { value: 'inactiva',   label: 'Inactiva',   bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
]

const getEstado = (value) => ESTADOS.find(e => e.value === value) ?? ESTADOS[0]

const EMPTY_FORM = { sucursal_id: '', numero: '', capacidad: 4, ubicacion: '', estado: 'disponible' }

function EstadoBadge({ estado }) {
  const e = getEstado(estado)
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: e.bg, color: e.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.dot }} />
      {e.label}
    </span>
  )
}

function EstadoDropdown({ mesaId, estadoActual }) {
  const [open, setOpen] = useState(false)
  const cambiar = useCambiarEstadoMesa()
  const e = getEstado(estadoActual)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all hover:opacity-80"
        style={{ background: e.bg, color: e.text }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.dot }} />
        {e.label}
        <ChevronDown size={11} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', left: 0, top: '100%', marginTop: 4,
            zIndex: 50, minWidth: 140,
            background: 'white', borderRadius: 12,
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '4px 0',
          }}>
            {ESTADOS.map(est => (
              <button
                key={est.value}
                onClick={() => {
                  cambiar.mutate({ id: mesaId, estado: est.value })
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                style={{ color: est.text, fontWeight: est.value === estadoActual ? 600 : 400 }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: est.dot }} />
                {est.label}
                {est.value === estadoActual && <span className="ml-auto" style={{ color: '#9ca3af' }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MesaCard({ mesa, canManage, onEdit, onDelete }) {
  const e = getEstado(mesa.estado)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-visible hover:shadow-md transition-all group">

      {/* Top color strip */}
<div className="h-1.5 w-full rounded-t-2xl" style={{ background: e.dot }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: e.bg, color: e.text }}>
              {mesa.numero}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Mesa {mesa.numero}</p>
              {mesa.sucursal && (
                <p className="text-xs text-gray-400 mt-0.5">{mesa.sucursal.nombre}</p>
              )}
            </div>
          </div>

          {canManage && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => onEdit(mesa)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100 transition-colors">
                <Pencil size={13} />
              </button>
              <button onClick={() => onDelete(mesa)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={13} />
            <span>{mesa.capacidad} personas</span>
          </div>
          {mesa.ubicacion && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={13} />
              <span>{mesa.ubicacion}</span>
            </div>
          )}
        </div>

        {/* Estado */}
        {canManage
          ? <EstadoDropdown mesaId={mesa.id} estadoActual={mesa.estado} />
          : <EstadoBadge estado={mesa.estado} />
        }
      </div>
    </div>
  )
}

export default function MesasPage() {
  const { hasPermission, isSuperAdmin, user, getSucursalId } = useAuthStore()
  const canManage = hasPermission('mesas.gestionar')

  const [filtroEstado, setFiltroEstado] = useState(null)
  const [modal, setModal]               = useState(null)
  const [editing, setEditing]           = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [error, setError]               = useState('')

  const sucursalId = getSucursalId()
  const { data: mesas = [], isLoading } = useMesas({
    ...(filtroEstado ? { estado: filtroEstado } : {}),
    ...(sucursalId ? { sucursal_id: sucursalId } : {}),
  })
  const { data: sucursales = [] }       = useSucursales()

  const createMesa = useCreateMesa()
  const updateMesa = useUpdateMesa()
  const deleteMesa = useDeleteMesa()

const openNew = () => {
  setEditing(null)
  setForm({
    ...EMPTY_FORM,
    sucursal_id: isSuperAdmin() ? '' : (user?.sucursal_id ?? ''),
  })
  setError('')
  setModal('form')
}

  const openEdit = (mesa) => {
    setEditing(mesa)
    setForm({
      sucursal_id: mesa.sucursal_id,
      numero:      mesa.numero,
      capacidad:   mesa.capacidad,
      ubicacion:   mesa.ubicacion ?? '',
      estado:      mesa.estado,
    })
    setError('')
    setModal('form')
  }

  const handleSubmit = () => {
    if (!form.numero.trim() || !form.sucursal_id)
      return setError('El número y la sucursal son obligatorios.')

    const opts = { onSuccess: () => setModal(null), onError: (e) => setError(e.response?.data?.message ?? 'Error al guardar.') }

    editing
      ? updateMesa.mutate({ id: editing.id, data: form }, opts)
      : createMesa.mutate(form, opts)
  }

  const isSaving = createMesa.isPending || updateMesa.isPending

  // Stats
  const stats = ESTADOS.map(e => ({
    ...e,
    count: mesas.filter(m => m.estado === e.value).length,
  }))

  return (
    <Layout>
      <Header title="Mesas" subtitle={`${mesas.length} mesas registradas`} />
      {canManage && (
        <div className="flex justify-end mb-4">
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <Plus size={15} /> Nueva mesa
          </button>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(e => (
          <button
            key={e.value}
            onClick={() => setFiltroEstado(filtroEstado === e.value ? null : e.value)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              filtroEstado === e.value
                ? 'border-2 shadow-sm'
                : 'bg-white border-gray-100 hover:shadow-sm'
            }`}
            style={filtroEstado === e.value
              ? { background: e.bg, borderColor: e.dot }
              : {}}
          >
            <p className="text-2xl font-bold" style={{ color: filtroEstado === e.value ? e.text : '#111827' }}>
              {e.count}
            </p>
            <p className="text-xs mt-0.5 font-medium"
              style={{ color: filtroEstado === e.value ? e.text : '#6b7280' }}>
              {e.label}
            </p>
          </button>
        ))}
      </div>

      {/* Filtro activo */}
      {filtroEstado && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Filtrando por:</span>
          <EstadoBadge estado={filtroEstado} />
          <button onClick={() => setFiltroEstado(null)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
            Limpiar filtro
          </button>
        </div>
      )}

      {/* Grid de mesas */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-20">
          <p className="text-sm text-gray-400">Cargando mesas...</p>
        </div>
      ) : mesas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-gray-500">
            {filtroEstado ? 'No hay mesas con ese estado.' : 'No hay mesas registradas aún.'}
          </p>
          {canManage && !filtroEstado && (
            <button onClick={openNew}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2">
              Crear la primera
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mesas.map(mesa => (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={(m) => { setEditing(m); setModal('delete') }}
            />
          ))}
        </div>
      )}

      {/* Modal formulario */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)}
        title={editing ? 'Editar mesa' : 'Nueva mesa'}>
        <div className="space-y-4">

          {/* Sucursal — solo Super Admin puede elegir */}
          {isSuperAdmin() ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Sucursal <span className="text-red-400">*</span>
              </label>
              <select
                value={form.sucursal_id}
                onChange={e => setForm({ ...form, sucursal_id: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          ) : (
            // Para roles no super admin, usa la sucursal del usuario directamente
            null
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Número <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.numero}
                onChange={e => setForm({ ...form, numero: e.target.value })}
                placeholder="1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Capacidad</label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.capacidad}
                onChange={e => setForm({ ...form, capacidad: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Ubicación</label>
            <input
              type="text"
              value={form.ubicacion}
              onChange={e => setForm({ ...form, ubicacion: e.target.value })}
              placeholder="Interior, Terraza, VIP..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Estado</label>
            <select
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
            >
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(null)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={isSaving}
              className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
              {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear mesa'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal eliminar */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Eliminar mesa">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminás la <span className="font-semibold text-gray-900">Mesa {editing?.numero}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setModal(null)}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => deleteMesa.mutate(editing.id, { onSuccess: () => setModal(null) })}
            disabled={deleteMesa.isPending}
            className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
            {deleteMesa.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}