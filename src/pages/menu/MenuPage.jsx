import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import RecetaModal from './RecetaModal'
import {
  useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria,
  useProductos, useCreateProducto, useUpdateProducto, useDeleteProducto,
} from '../../hooks/useMenu'
import { useAuthStore } from '../../store/authStore'
import { Plus, Pencil, Trash2, UtensilsCrossed, Layers, MoreVertical, ChefHat } from 'lucide-react'
// Paleta de colores para cards de productos
const PALETTES = [
  { bg: '#fef3c7', text: '#92400e', accent: '#f59e0b' },
  { bg: '#fce7f3', text: '#831843', accent: '#ec4899' },
  { bg: '#ede9fe', text: '#4c1d95', accent: '#8b5cf6' },
  { bg: '#d1fae5', text: '#064e3b', accent: '#10b981' },
  { bg: '#dbeafe', text: '#1e3a8a', accent: '#3b82f6' },
  { bg: '#ffedd5', text: '#7c2d12', accent: '#f97316' },
]

const getPalette = (str) => PALETTES[(str?.charCodeAt(0) ?? 0) % PALETTES.length]

const EMPTY_CAT = { nombre: '', descripcion: '', orden: 0, activo: true }
const EMPTY_PROD = { categoria_id: '', nombre: '', descripcion: '', precio_base: '', activo: true }

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

function SelectField({ label, children, required, ...props }) {
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

export default function MenuPage() {
  const { hasPermission } = useAuthStore()
  const canManage = hasPermission('menu.gestionar')
  const [imagenPreview, setImagenPreview] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  // Data
  const { data: categorias = [], isLoading: loadingCats } = useCategorias()
  const [selectedCatId, setSelectedCatId] = useState(null)
  const { data: productos = [], isLoading: loadingProds } = useProductos(selectedCatId)

  // Modales
  const [modal, setModal] = useState(null) // 'cat' | 'prod' | 'del-cat' | 'del-prod'
  const [editing, setEditing] = useState(null)
  const [catForm, setCatForm] = useState(EMPTY_CAT)
  const [prodForm, setProdForm] = useState(EMPTY_PROD)
  const [error, setError] = useState('')
  const [recetaTarget, setRecetaTarget] = useState(null)

  // Mutations categorías
  const createCat = useCreateCategoria()
  const updateCat = useUpdateCategoria()
  const deleteCat = useDeleteCategoria()
  // Mutations productos
  const createProd = useCreateProducto()
  const updateProd = useUpdateProducto()
  const deleteProd = useDeleteProducto()

  // ── Handlers categoría ──
  const openNewCat = () => {
    setEditing(null); setCatForm(EMPTY_CAT); setError(''); setModal('cat')
  }
  const openEditCat = (cat) => {
    setEditing(cat)
    setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion ?? '', orden: cat.orden, activo: cat.activo })
    setError(''); setModal('cat')
  }
  const submitCat = () => {
    if (!catForm.nombre.trim()) return setError('El nombre es obligatorio.')
    const opts = { onSuccess: () => setModal(null), onError: () => setError('Error al guardar.') }
    editing
      ? updateCat.mutate({ id: editing.id, data: catForm }, opts)
      : createCat.mutate(catForm, opts)
  }

  // ── Handlers producto ──
  const openNewProd = () => {
    setEditing(null)
    setProdForm({ ...EMPTY_PROD, categoria_id: selectedCatId ?? '' })
    setImagenPreview(null)
    setImagenFile(null)
    setError('')
    setModal('prod')
  }
  const openEditProd = (prod) => {
    setEditing(prod)
    setProdForm({
      categoria_id: prod.categoria_id,
      nombre: prod.nombre,
      descripcion: prod.descripcion ?? '',
      precio_base: prod.precio_base,
      activo: prod.activo,
    })
    setImagenPreview(prod.imagen ? `http://127.0.0.1:8000/storage/${prod.imagen}` : null)
    setImagenFile(null)
    setError('')
    setModal('prod')
  }
  const submitProd = () => {
    if (!prodForm.nombre.trim() || !prodForm.categoria_id || !prodForm.precio_base)
      return setError('Nombre, categoría y precio son obligatorios.')

    const payload = { ...prodForm, ...(imagenFile ? { imagen: imagenFile } : {}) }
    const opts = { onSuccess: () => setModal(null), onError: () => setError('Error al guardar.') }

    editing
      ? updateProd.mutate({ id: editing.id, data: payload }, opts)
      : createProd.mutate(payload, opts)
  }

  const selectedCat = categorias.find(c => c.id === selectedCatId)
  const isSaving = createCat.isPending || updateCat.isPending || createProd.isPending || updateProd.isPending

  return (
    <Layout>
      <Header
        title="Menú"
        subtitle={`${categorias.length} categorías · ${productos.length} productos${selectedCatId ? ` en ${selectedCat?.nombre}` : ' en total'}`}
      />
      {canManage && (
        <div className="flex justify-end mb-4">
          <button onClick={openNewProd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <Plus size={15} /> Nuevo producto
          </button>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex gap-5" style={{ minHeight: '70vh' }}>

        {/* Left — Categorías */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categorías</span>
              {canManage && (
                <button onClick={openNewCat}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <Plus size={13} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {loadingCats ? (
                <p className="text-xs text-gray-400 text-center py-6">Cargando...</p>
              ) : (
                <>
                  {/* Opción "Todos" */}
                  <button
                    onClick={() => setSelectedCatId(null)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-all ${selectedCatId === null
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <UtensilsCrossed size={14} />
                    Todos
                  </button>

                  {categorias.map(cat => {
                    const palette = getPalette(cat.nombre)
                    const isActive = selectedCatId === cat.id
                    return (
                      <div key={cat.id}
                        className={`group flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-all ${isActive ? 'bg-slate-900' : 'hover:bg-gray-50'
                          }`}
                        onClick={() => setSelectedCatId(cat.id)}
                      >
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{ background: isActive ? 'rgba(255,255,255,0.15)' : palette.bg, color: isActive ? 'white' : palette.text }}>
                          {cat.nombre[0].toUpperCase()}
                        </div>
                        <span className={`flex-1 text-sm truncate ${isActive ? 'text-white font-medium' : 'text-gray-700'}`}>
                          {cat.nombre}
                        </span>
                        {canManage && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setRecetaTarget(prod)}
                              title="Editar receta"
                              className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-amber-600 transition-colors">
                              <ChefHat size={12} />
                            </button>
                            <button onClick={() => openEditProd(prod)}
                              className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-slate-900 transition-colors">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => { setEditing(prod); setModal('del-prod') }}
                              className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                        {canManage && (
                          <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
                            <button onClick={e => { e.stopPropagation(); openEditCat(cat) }}
                              className={`w-5 h-5 flex items-center justify-center rounded ${isActive ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                              <Pencil size={11} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setEditing(cat); setModal('del-cat') }}
                              className={`w-5 h-5 flex items-center justify-center rounded ${isActive ? 'text-red-300 hover:text-red-200' : 'text-gray-400 hover:text-red-500'}`}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right — Productos */}
        <div className="flex-1">
          {loadingProds ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">Cargando productos...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: '#f8fafc' }}>
                <Layers size={24} style={{ color: '#cbd5e1' }} />
              </div>
              <p className="text-sm text-gray-500">No hay productos en esta categoría</p>
              {canManage && (
                <button onClick={openNewProd}
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  Crear el primero
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {productos.map((prod, i) => {
                const palette = getPalette(prod.nombre)
                return (
                  <div key={prod.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">

                    {/* Card image area */}
                    <div className="h-28 flex items-center justify-center relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${palette.bg}, white)` }}>
                      {prod.imagen ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${prod.imagen}`}
                          alt={prod.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-black select-none"
                          style={{ color: palette.accent, opacity: 0.4 }}>
                          {prod.nombre[0].toUpperCase()}
                        </span>
                      )}

                      {/* Actions on hover */}
{canManage && (
  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
    <button onClick={() => setRecetaTarget(prod)}
      title="Editar receta"
      className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-amber-600 transition-colors">
      <ChefHat size={12} />
    </button>
    <button onClick={() => openEditProd(prod)}
      className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-slate-900 transition-colors">
      <Pencil size={12} />
    </button>
    <button onClick={() => { setEditing(prod); setModal('del-prod') }}
      className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
      <Trash2 size={12} />
    </button>
  </div>
)}

                      {/* Status badge */}
                      {!prod.activo && (
                        <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#fee2e2', color: '#991b1b' }}>
                          Inactivo
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      {/* Category badge */}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: palette.bg, color: palette.text }}>
                        {prod.categoria?.nombre ?? 'Sin categoría'}
                      </span>

                      <h3 className="font-semibold text-gray-900 text-sm mt-2 leading-tight">
                        {prod.nombre}
                      </h3>

                      {prod.descripcion && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {prod.descripcion}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <span className="text-base font-bold text-gray-900">
                          Bs. {Number(prod.precio_base).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">precio base</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Categoría ── */}
      <Modal isOpen={modal === 'cat'} onClose={() => setModal(null)}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}>
        <div className="space-y-4">
          <InputField label="Nombre" required placeholder="Entradas"
            value={catForm.nombre} onChange={e => setCatForm({ ...catForm, nombre: e.target.value })} />
          <InputField label="Descripción" placeholder="Descripción opcional"
            value={catForm.descripcion} onChange={e => setCatForm({ ...catForm, descripcion: e.target.value })} />
          <InputField label="Orden" type="number" min="0"
            value={catForm.orden} onChange={e => setCatForm({ ...catForm, orden: Number(e.target.value) })} />
          {editing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={catForm.activo}
                onChange={e => setCatForm({ ...catForm, activo: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Categoría activa</span>
            </label>
          )}
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(null)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={submitCat} disabled={isSaving}
              className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
              {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Producto ── */}
      <Modal isOpen={modal === 'prod'} onClose={() => setModal(null)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <div className="space-y-4">

          {/* Upload de imagen */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Imagen del plato</label>
            <div
              className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer group transition-all hover:border-slate-400"
              onClick={() => document.getElementById('img-upload').click()}
            >
              {imagenPreview ? (
                <>
                  <img src={imagenPreview} alt="preview"
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Cambiar imagen</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#f1f5f9' }}>
                    <UtensilsCrossed size={18} style={{ color: '#94a3b8' }} />
                  </div>
                  <p className="text-xs text-gray-400">Click para subir imagen</p>
                  <p className="text-xs text-gray-300">JPG, PNG · máx 2MB</p>
                </div>
              )}
              <input
                id="img-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  setImagenFile(file)
                  setImagenPreview(URL.createObjectURL(file))
                }}
              />
            </div>
          </div>

          <SelectField label="Categoría" required
            value={prodForm.categoria_id}
            onChange={e => setProdForm({ ...prodForm, categoria_id: Number(e.target.value) })}>
            <option value="">Seleccionar categoría</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </SelectField>

          <InputField label="Nombre" required placeholder="Anticucho de corazón"
            value={prodForm.nombre}
            onChange={e => setProdForm({ ...prodForm, nombre: e.target.value })} />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea rows={2} placeholder="Descripción del plato..."
              value={prodForm.descripcion}
              onChange={e => setProdForm({ ...prodForm, descripcion: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
            />
          </div>

          <InputField label="Precio base (Bs.)" required type="number" min="0" step="0.50"
            placeholder="25.00"
            value={prodForm.precio_base}
            onChange={e => setProdForm({ ...prodForm, precio_base: e.target.value })} />

          {editing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prodForm.activo}
                onChange={e => setProdForm({ ...prodForm, activo: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Producto activo</span>
            </label>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(null)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={submitProd} disabled={isSaving}
              className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
              {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Confirmar eliminar categoría ── */}
      <Modal isOpen={modal === 'del-cat'} onClose={() => setModal(null)} title="Eliminar categoría">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminás <span className="font-semibold text-gray-900">{editing?.nombre}</span>?
          Todos sus productos también serán eliminados.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setModal(null)}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => deleteCat.mutate(editing.id, { onSuccess: () => { setModal(null); if (selectedCatId === editing.id) setSelectedCatId(null) } })}
            disabled={deleteCat.isPending}
            className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
            {deleteCat.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </Modal>

      {/* ── Modal: Confirmar eliminar producto ── */}
      <Modal isOpen={modal === 'del-prod'} onClose={() => setModal(null)} title="Eliminar producto">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminás <span className="font-semibold text-gray-900">{editing?.nombre}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setModal(null)}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => deleteProd.mutate(editing.id, { onSuccess: () => setModal(null) })}
            disabled={deleteProd.isPending}
            className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
            {deleteProd.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </Modal>
      <RecetaModal
  isOpen={!!recetaTarget}
  onClose={() => setRecetaTarget(null)}
  producto={recetaTarget}
/>
    </Layout>
  )
}