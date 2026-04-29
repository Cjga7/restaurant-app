import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import { useUsers, useRoles, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers'
import { useSucursales } from '../../hooks/useSucursales'
import { useAuthStore } from '../../store/authStore'
import { getRolInfo, ROLES_INFO } from './constants'
import { Plus, Pencil, Trash2, Search, Mail, Shield, KeyRound, Eye, EyeOff } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  sucursal_id: '',
  rol: 'mozo',
  activo: true,
}

function Avatar({ user, size = 38 }) {
  const rol = user.roles?.[0]
  const info = getRolInfo(rol)
  const initials = user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  return (
    <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${info.dot}30, ${info.dot}60)`,
        color: info.dot,
        fontSize: size * 0.35,
      }}>
      {initials}
    </div>
  )
}

function RolBadge({ rol }) {
  const info = getRolInfo(rol)
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: info.bg, color: info.text }}>
      <span>{info.icon}</span>
      {info.label}
    </span>
  )
}

export default function UsersPage() {
  const { user: currentUser, hasPermission, isSuperAdmin } = useAuthStore()
  const canManage = hasPermission('usuarios.gestionar')

  const [search, setSearch]         = useState('')
  const [filtroRol, setFiltroRol]   = useState(null)
  const [modal, setModal]           = useState(null) // form | delete | password
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [showPwd, setShowPwd]       = useState(false)
  const [error, setError]           = useState('')

  const { data: usuarios = [], isLoading } = useUsers(filtroRol ? { rol: filtroRol } : {})
  const { data: roles = [] }               = useRoles()
  const { data: sucursales = [] }          = useSucursales()

  const createMut = useCreateUser()
  const updateMut = useUpdateUser()
  const deleteMut = useDeleteUser()

  // Filtrado por búsqueda local
  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase()
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  // Stats por rol
  const stats = Object.keys(ROLES_INFO).map(rolKey => ({
    rol: rolKey,
    info: ROLES_INFO[rolKey],
    count: usuarios.filter(u => u.roles?.[0] === rolKey).length,
  }))

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowPwd(false)
    setError('')
    setModal('form')
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({
      name:        user.name,
      email:       user.email,
      password:    '', // siempre vacío en edit
      sucursal_id: user.sucursal_id ?? '',
      rol:         user.roles?.[0] ?? 'mozo',
      activo:      user.activo ?? true,
    })
    setShowPwd(false)
    setError('')
    setModal('form')
  }

  const submitForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.rol)
      return setError('Nombre, email y rol son obligatorios.')

    if (!editing && !form.password)
      return setError('La contraseña es obligatoria al crear un usuario.')

    if (form.password && form.password.length < 6)
      return setError('La contraseña debe tener al menos 6 caracteres.')

    if (form.rol !== 'super_admin' && !form.sucursal_id)
      return setError('Los usuarios con este rol deben tener una sucursal asignada.')

    const data = {
      ...form,
      sucursal_id: form.rol === 'super_admin' ? null : Number(form.sucursal_id),
    }

    // No mandar password vacío en update
    if (editing && !data.password) delete data.password

    const opts = {
      onSuccess: () => setModal(null),
      onError: (e) => setError(e.response?.data?.message ?? 'Error al guardar.'),
    }

    editing
      ? updateMut.mutate({ id: editing.id, data }, opts)
      : createMut.mutate(data, opts)
  }

  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <Header
          title="Usuarios"
          subtitle={`${usuarios.length} usuarios del sistema${filtroRol ? ` · filtro: ${getRolInfo(filtroRol).label}` : ''}`}
        />
        {canManage && (
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <Plus size={15} /> Nuevo usuario
          </button>
        )}
      </div>

      {/* Stats por rol */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {stats.map(s => (
          <button
            key={s.rol}
            onClick={() => setFiltroRol(filtroRol === s.rol ? null : s.rol)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              filtroRol === s.rol
                ? 'border-2 shadow-sm'
                : 'bg-white border-gray-100 hover:shadow-sm'
            }`}
            style={filtroRol === s.rol ? { background: s.info.bg, borderColor: s.info.dot } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{s.info.icon}</span>
              <p className="text-xs font-medium"
                style={{ color: filtroRol === s.rol ? s.info.text : '#6b7280' }}>
                {s.info.label}
              </p>
            </div>
            <p className="text-2xl font-bold"
              style={{ color: filtroRol === s.rol ? s.info.text : '#111827' }}>
              {s.count}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>
        {filtroRol && (
          <button onClick={() => setFiltroRol(null)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {search || filtroRol ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Usuario</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Rol</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Sucursal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => {
                const esActual = u.id === currentUser?.id
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{u.name}</p>
                            {esActual && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Vos</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail size={10} />
                            <span className="truncate">{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <RolBadge rol={u.roles?.[0]} />
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {u.sucursal?.nombre ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        u.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {canManage && (
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(u)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100 transition-colors">
                            <Pencil size={13} />
                          </button>
                          {!esActual && (
                            <button onClick={() => { setEditing(u); setModal('delete') }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ────── Modal: Formulario ────── */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'} maxWidth="max-w-lg">
        <div className="space-y-4">

          {/* Nombre + email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Nombre completo <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="Juan Pérez"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder="usuario@restaurant.test"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Contraseña {!editing && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {editing && (
              <p className="text-xs text-gray-400 mt-1">Solo completá si querés cambiar la contraseña</p>
            )}
          </div>

          {/* Rol — selector visual */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Shield size={12} className="inline mr-1" />
              Rol del usuario <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {roles.map(rolName => {
                const info = getRolInfo(rolName)
                const active = form.rol === rolName

                // Solo super admin puede asignar rol super_admin
                if (rolName === 'super_admin' && !isSuperAdmin()) return null

                return (
                  <button
                    key={rolName}
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      rol: rolName,
                      sucursal_id: rolName === 'super_admin' ? '' : form.sucursal_id,
                    })}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                    style={active
                      ? { background: info.bg, borderColor: info.dot }
                      : { background: 'white', borderColor: '#e5e7eb' }}
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: active ? info.text : '#111827' }}>
                        {info.label}
                      </p>
                      <p className="text-xs" style={{ color: active ? info.text : '#6b7280' }}>
                        {info.descripcion}
                      </p>
                    </div>
                    {active && (
                      <span className="text-lg" style={{ color: info.dot }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sucursal — solo si NO es super admin */}
          {form.rol !== 'super_admin' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Sucursal asignada <span className="text-red-400">*</span>
              </label>
              <select
                value={form.sucursal_id}
                onChange={e => setForm({ ...form, sucursal_id: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          )}

          {form.rol === 'super_admin' && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
              <p className="text-xs text-violet-900">
                👑 Los super administradores tienen acceso a todas las sucursales del sistema.
              </p>
            </div>
          )}

          {/* Activo */}
          {editing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activo}
                onChange={e => setForm({ ...form, activo: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Usuario activo</span>
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
              {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ────── Modal: Eliminar ────── */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Eliminar usuario">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminás a <span className="font-semibold text-gray-900">{editing?.name}</span>?
          El usuario perderá acceso al sistema permanentemente.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setModal(null)}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => deleteMut.mutate(editing.id, {
              onSuccess: () => setModal(null),
              onError: (e) => alert(e.response?.data?.message ?? 'Error al eliminar.'),
            })}
            disabled={deleteMut.isPending}
            className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
            {deleteMut.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}