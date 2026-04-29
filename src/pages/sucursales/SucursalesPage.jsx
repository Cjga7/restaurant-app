import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import {
  useSucursales,
  useCreateSucursal,
  useUpdateSucursal,
  useDeleteSucursal,
} from '../../hooks/useSucursales'
import { useAuthStore } from '../../store/authStore'

const EMPTY_FORM = {
  nombre: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  email: '',
  activo: true,
}

export default function SucursalesPage() {
  const { hasPermission } = useAuthStore()
  const { data: sucursales = [], isLoading } = useSucursales()

  const createMutation = useCreateSucursal()
  const updateMutation = useUpdateSucursal()
  const deleteMutation = useDeleteSucursal()

  const [modalOpen, setModalOpen]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // sucursal a eliminar
  const [editing, setEditing]           = useState(null)   // sucursal en edición
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [error, setError]               = useState('')

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (sucursal) => {
    setEditing(sucursal)
    setForm({
      nombre:    sucursal.nombre,
      direccion: sucursal.direccion ?? '',
      ciudad:    sucursal.ciudad ?? '',
      telefono:  sucursal.telefono ?? '',
      email:     sucursal.email ?? '',
      activo:    sucursal.activo,
    })
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleSubmit = () => {
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: form },
        { onSuccess: closeModal, onError: () => setError('Error al actualizar.') }
      )
    } else {
      createMutation.mutate(form, {
        onSuccess: closeModal,
        onError: () => setError('Error al crear la sucursal.'),
      })
    }
  }

  const handleDelete = () => {
    deleteMutation.mutate(deleteConfirm.id, {
      onSuccess: () => setDeleteConfirm(null),
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Layout>
      <Header
        title="Sucursales"
        subtitle={`${sucursales.length} ${sucursales.length === 1 ? 'sucursal registrada' : 'sucursales registradas'}`}
      />
      {hasPermission('sucursales.crear') && (
        <div className="flex justify-end mb-4">
          <button
            onClick={openCreate}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nueva sucursal
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            Cargando sucursales...
          </div>
        ) : sucursales.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No hay sucursales registradas aún.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Nombre</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Ciudad</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Teléfono</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Estado</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sucursales.map(sucursal => (
                <tr key={sucursal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{sucursal.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sucursal.direccion ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{sucursal.ciudad ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{sucursal.telefono ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sucursal.activo
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {sucursal.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      {hasPermission('sucursales.editar') && (
                        <button
                          onClick={() => openEdit(sucursal)}
                          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          Editar
                        </button>
                      )}
                      {hasPermission('sucursales.eliminar') && (
                        <button
                          onClick={() => setDeleteConfirm(sucursal)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear / editar */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar sucursal' : 'Nueva sucursal'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Sucursal Centro"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Av. Principal 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ciudad</label>
              <input
                type="text"
                value={form.ciudad}
                onChange={e => setForm({ ...form, ciudad: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Cochabamba"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
              <input
                type="text"
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="4412345"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="sucursal@restaurant.test"
            />
          </div>

          {editing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={e => setForm({ ...form, activo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="activo" className="text-sm text-gray-600">Sucursal activa</label>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={closeModal}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear sucursal'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmar eliminar */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Eliminar sucursal"
      >
        <p className="text-sm text-gray-600 mb-5">
          ¿Estás seguro que querés eliminar{' '}
          <span className="font-medium text-gray-900">{deleteConfirm?.nombre}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}