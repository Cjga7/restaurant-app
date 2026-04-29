import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import TabStock from './TabStock'
import TabItems from './TabItems'
import TabMovimientos from './TabMovimientos'
import MovimientoModal from './MovimientoModal'
import { useItems, useStock, useMovimientos, useCreateItem, useUpdateItem, useDeleteItem, useUpdateUmbrales } from '../../hooks/useInventario'
import { useProductos } from '../../hooks/useMenu'
import { useAuthStore } from '../../store/authStore'
import { CATEGORIAS, UNIDADES } from './constants'
import TransferenciaModal from './TransferenciaModal'
import { Package2, Boxes, History, ArrowLeftRight } from 'lucide-react'
const EMPTY_ITEM = {
  nombre: '',
  descripcion: '',
  categoria: 'ingrediente',
  unidad: 'kg',
  producto_menu_id: '',
}

export default function InventarioPage() {
  const { hasPermission, user, getSucursalId } = useAuthStore()
  const canManage = hasPermission('inventario.gestionar')

  const [tab, setTab]                       = useState('stock') // stock | items | movimientos
  const [filtroCategoria, setFiltroCategoria] = useState(null)

  const [modal, setModal]             = useState(null) // item | delete | umbrales
  const [editing, setEditing]         = useState(null)
  const [itemForm, setItemForm]       = useState(EMPTY_ITEM)
  const [umbralesForm, setUmbralesForm] = useState(null)
  const [error, setError]             = useState('')
const [transferModal, setTransferModal] = useState(false)
  const [movimientoTarget, setMovimientoTarget] = useState(null)

  const sucursalId = getSucursalId()

  const { data: items = [],        isLoading: loadingItems }     = useItems(filtroCategoria ? { categoria: filtroCategoria } : {})
  const { data: stocks = [],       isLoading: loadingStock }     = useStock({
    ...(sucursalId && { sucursal_id: sucursalId }),
    ...(filtroCategoria && { categoria: filtroCategoria }),
  })
  const { data: movimientos = [],  isLoading: loadingMovs }      = useMovimientos({
    ...(sucursalId && { sucursal_id: sucursalId }),
    limit: 100,
  })
  const { data: productos = [] } = useProductos()

  const createMut   = useCreateItem()
  const updateMut   = useUpdateItem()
  const deleteMut   = useDeleteItem()
  const umbralesMut = useUpdateUmbrales()

  // ── Handlers: items ──
  const openNewItem = () => {
    setEditing(null)
    setItemForm(EMPTY_ITEM)
    setError('')
    setModal('item')
  }

  const openEditItem = (item) => {
    setEditing(item)
    setItemForm({
      nombre:           item.nombre,
      descripcion:      item.descripcion ?? '',
      categoria:        item.categoria,
      unidad:           item.unidad,
      producto_menu_id: item.producto_menu_id ?? '',
    })
    setError('')
    setModal('item')
  }

  const submitItem = () => {
    if (!itemForm.nombre.trim()) return setError('El nombre es obligatorio.')
    const data = {
      ...itemForm,
      producto_menu_id: itemForm.producto_menu_id || null,
    }
    const opts = { onSuccess: () => setModal(null), onError: () => setError('Error al guardar.') }

    editing
      ? updateMut.mutate({ id: editing.id, data }, opts)
      : createMut.mutate(data, opts)
  }

  const openMovimientoDesdeItem = (item) => {
    if (!sucursalId) {
      alert('Seleccioná una sucursal en el header primero.')
      return
    }
    // Busca el stock correspondiente o crea uno vacío
    const stockExistente = stocks.find(s => s.item_id === item.id)
    setMovimientoTarget(stockExistente ?? { item, stock_actual: 0, item_id: item.id })
  }

  const openMovimientoDesdeStock = (stock) => setMovimientoTarget(stock)

  // ── Handlers: umbrales ──
  const openUmbrales = (stock) => {
    setUmbralesForm({
      id:            stock.id,
      stock_minimo:  stock.stock_minimo,
      stock_ideal:   stock.stock_ideal ?? '',
      precio_compra: stock.precio_compra ?? '',
      itemNombre:    stock.item?.nombre,
    })
    setModal('umbrales')
  }

  const submitUmbrales = () => {
    umbralesMut.mutate({
      id: umbralesForm.id,
      data: {
        stock_minimo:  Number(umbralesForm.stock_minimo),
        stock_ideal:   umbralesForm.stock_ideal ? Number(umbralesForm.stock_ideal) : null,
        precio_compra: umbralesForm.precio_compra ? Number(umbralesForm.precio_compra) : null,
      },
    }, { onSuccess: () => setModal(null) })
  }

  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <Layout>
      <Header
        title="Inventario"
        subtitle={`${items.length} insumos · ${stocks.filter(s => s.alerta_bajo).length} con alerta`}
      />
{canManage && (
  <div className="flex justify-end -mt-2 mb-4">
    <button onClick={() => setTransferModal(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 transition-all">
      <ArrowLeftRight size={14} style={{ color: '#6366f1' }} />
      Transferir entre sucursales
    </button>
  </div>
)}
      {/* Tabs */}
      <div className="inline-flex bg-white border border-gray-100 rounded-xl p-1 mb-5">
        {[
          { value: 'stock',       label: 'Stock',       icon: Boxes },
          { value: 'items',       label: 'Insumos',     icon: Package2 },
          { value: 'movimientos', label: 'Movimientos', icon: History },
        ].map(t => {
          const Icon = t.icon
          const active = tab === t.value
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Contenido según tab */}
      {tab === 'stock' && (
        <TabStock
          stocks={stocks}
          isLoading={loadingStock}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
          onMovimiento={openMovimientoDesdeStock}
          onEditUmbrales={openUmbrales}
        />
      )}

      {tab === 'items' && (
        <TabItems
          items={items}
          isLoading={loadingItems}
          canManage={canManage}
          onCreate={openNewItem}
          onEdit={openEditItem}
          onDelete={(item) => { setEditing(item); setModal('delete') }}
          onMovimiento={openMovimientoDesdeItem}
        />
      )}

      {tab === 'movimientos' && (
        <TabMovimientos movimientos={movimientos} isLoading={loadingMovs} />
      )}

      {/* ────── Modal: Item ────── */}
      <Modal isOpen={modal === 'item'} onClose={() => setModal(null)}
        title={editing ? 'Editar insumo' : 'Nuevo insumo'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre <span className="text-red-400">*</span></label>
            <input type="text" placeholder="Carne de res"
              value={itemForm.nombre}
              onChange={e => setItemForm({ ...itemForm, nombre: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción</label>
            <input type="text" placeholder="Opcional"
              value={itemForm.descripcion}
              onChange={e => setItemForm({ ...itemForm, descripcion: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoría <span className="text-red-400">*</span></label>
              <select value={itemForm.categoria}
                onChange={e => setItemForm({ ...itemForm, categoria: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white">
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Unidad <span className="text-red-400">*</span></label>
              <select value={itemForm.unidad}
                onChange={e => setItemForm({ ...itemForm, unidad: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white">
                {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          {itemForm.categoria === 'bebida' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Producto del menú (opcional)</label>
              <select value={itemForm.producto_menu_id}
                onChange={e => setItemForm({ ...itemForm, producto_menu_id: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white">
                <option value="">Sin vincular</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Vinculá la bebida con su producto del menú para futuras automatizaciones.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(null)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={submitItem} disabled={isSaving}
              className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
              {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear insumo'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ────── Modal: Eliminar ────── */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Eliminar insumo">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminás <span className="font-semibold text-gray-900">{editing?.nombre}</span>?
          También se eliminará el stock de todas las sucursales y su historial.
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

      {/* ────── Modal: Umbrales ────── */}
      <Modal isOpen={modal === 'umbrales'} onClose={() => setModal(null)}
        title={`Umbrales · ${umbralesForm?.itemNombre ?? ''}`}>
        {umbralesForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Stock mínimo</label>
                <input type="number" min="0" step="0.01"
                  value={umbralesForm.stock_minimo}
                  onChange={e => setUmbralesForm({ ...umbralesForm, stock_minimo: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
                <p className="text-xs text-gray-400 mt-1">Alerta cuando baje de este valor</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Stock ideal</label>
                <input type="number" min="0" step="0.01"
                  value={umbralesForm.stock_ideal}
                  onChange={e => setUmbralesForm({ ...umbralesForm, stock_ideal: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
                <p className="text-xs text-gray-400 mt-1">Nivel óptimo (opcional)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Precio de compra (Bs.)</label>
              <input type="number" min="0" step="0.01"
                value={umbralesForm.precio_compra}
                onChange={e => setUmbralesForm({ ...umbralesForm, precio_compra: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={submitUmbrales} disabled={umbralesMut.isPending}
                className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                {umbralesMut.isPending ? 'Guardando...' : 'Guardar umbrales'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ────── Modal: Movimiento ────── */}
      <MovimientoModal
        isOpen={!!movimientoTarget}
        onClose={() => setMovimientoTarget(null)}
        stock={movimientoTarget}
        sucursalId={sucursalId}
      />
      <TransferenciaModal
  isOpen={transferModal}
  onClose={() => setTransferModal(false)}
/>
    </Layout>
  )
}