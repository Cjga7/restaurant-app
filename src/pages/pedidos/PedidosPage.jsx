import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import VistaMesas from './VistaMesas'
import VistaLista from './VistaLista'
import ItemsEditor from './ItemsEditor'
import { usePedidos, useCreatePedido, useCambiarEstadoPedido, useDeletePedido } from '../../hooks/usePedidos'
import { useMesas } from '../../hooks/useMesas'
import { useProductos } from '../../hooks/useMenu'
import { useAuthStore } from '../../store/authStore'
import { ESTADOS, TIPOS, SIGUIENTE_ESTADO, LABEL_SIGUIENTE, getEstado, getTipo } from './constants'
import TicketModal from './TicketModal'
import { LayoutGrid, List, Plus, ArrowRight, X, Printer } from 'lucide-react'
export default function PedidosPage() {
  const { hasPermission, isSuperAdmin, user, getSucursalId } = useAuthStore()
  const canCreate = hasPermission('pedidos.crear')
  const canManage = hasPermission('pedidos.gestionar')

  const [vista, setVista]           = useState('mesas') // 'mesas' | 'lista'
  const [filtroEstado, setFiltroEstado] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState(null)
  const [soloActivos, setSoloActivos] = useState(true)

  const [pedidoSelId, setPedidoSelId] = useState(null)
  const [modal, setModal]           = useState(null) // 'new' | 'detail'
  const [newForm, setNewForm]       = useState(null) // datos del nuevo pedido

  const sucursalId = getSucursalId()
  const queryParams = {
    ...(sucursalId && { sucursal_id: sucursalId }),
    ...(filtroEstado && { estado: filtroEstado }),
    ...(filtroTipo && { tipo: filtroTipo }),
    ...(soloActivos && { activos: true }),
  }

  const { data: pedidos = [], isLoading } = usePedidos(queryParams)
  const { data: mesas = [] }              = useMesas(sucursalId ? { sucursal_id: sucursalId } : {})
  const { data: productos = [] }          = useProductos()

  const createMut = useCreatePedido()
  const estadoMut = useCambiarEstadoPedido()
  const deleteMut = useDeletePedido()

  const pedidoSeleccionado = pedidos.find(p => p.id === pedidoSelId)
const [ticketPedido, setTicketPedido] = useState(null)
  // ── Handlers ──
  const abrirMesa = (mesa, pedidoActivo) => {
    if (pedidoActivo) {
      // Abrir el pedido existente
      setPedidoSelId(pedidoActivo.id)
      setModal('detail')
    } else {
      // Crear nuevo pedido para esa mesa
      if (!canCreate) return
      setNewForm({
        sucursal_id: isSuperAdmin() ? sucursalId : user?.sucursal_id,
        mesa_id: mesa.id,
        tipo: 'mesa',
        mesa_numero: mesa.numero,
      })
      setModal('new')
    }
  }

  const abrirPedidoDeLista = (pedido) => {
    setPedidoSelId(pedido.id)
    setModal('detail')
  }

  const crearNuevoPedidoLibre = (tipo) => {
    setNewForm({
      sucursal_id: isSuperAdmin() ? sucursalId : user?.sucursal_id,
      tipo,
      cliente_nombre: '',
      cliente_telefono: '',
      cliente_direccion: '',
    })
    setModal('new')
  }

  const confirmarNuevoPedido = () => {
    if (!newForm.sucursal_id) {
      alert('Seleccioná una sucursal primero en el header')
      return
    }
    createMut.mutate(newForm, {
      onSuccess: (pedido) => {
        setPedidoSelId(pedido.id)
        setModal('detail')
        setNewForm(null)
      },
    })
  }

  const siguiente = (pedido) => {
    const next = SIGUIENTE_ESTADO[pedido.estado]
    if (!next) return
    estadoMut.mutate({ id: pedido.id, estado: next })
  }

  const cancelar = (pedido) => {
    if (!confirm('¿Cancelar este pedido?')) return
    estadoMut.mutate({ id: pedido.id, estado: 'cancelado' })
    setModal(null)
  }

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <Header
          title="Pedidos"
          subtitle={`${pedidos.length} pedidos${soloActivos ? ' activos' : ''}`}
        />
        {canCreate && (
          <div className="flex gap-2">
            <button onClick={() => crearNuevoPedidoLibre('llevar')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 hover:border-gray-300 text-gray-700 transition-all">
              🥡 Para llevar
            </button>
            <button onClick={() => crearNuevoPedidoLibre('delivery')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 hover:border-gray-300 text-gray-700 transition-all">
              🛵 Delivery
            </button>
          </div>
        )}
      </div>

      {/* Tabs de vista */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex bg-white border border-gray-100 rounded-xl p-1">
          <button
            onClick={() => setVista('mesas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              vista === 'mesas' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={14} /> Mesas
          </button>
          <button
            onClick={() => setVista('lista')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              vista === 'lista' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={14} /> Lista de pedidos
          </button>
        </div>

        {/* Filtros rápidos — solo en vista lista */}
        {vista === 'lista' && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={soloActivos}
                onChange={e => setSoloActivos(e.target.checked)}
                className="rounded border-gray-300" />
              Solo activos
            </label>
          </div>
        )}
      </div>

      {/* Filtros en vista lista */}
      {vista === 'lista' && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-500">Filtrar:</span>

          {TIPOS.map(t => (
            <button
              key={t.value}
              onClick={() => setFiltroTipo(filtroTipo === t.value ? null : t.value)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filtroTipo === t.value
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}

          <span className="text-gray-300">|</span>

          {ESTADOS.filter(e => !['pagado', 'cancelado'].includes(e.value)).map(e => (
            <button
              key={e.value}
              onClick={() => setFiltroEstado(filtroEstado === e.value ? null : e.value)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={filtroEstado === e.value
                ? { background: e.bg, color: e.text, fontWeight: 500 }
                : { background: 'white', border: '1px solid #e5e7eb', color: '#6b7280' }}
            >
              {e.label}
            </button>
          ))}

          {(filtroEstado || filtroTipo) && (
            <button onClick={() => { setFiltroEstado(null); setFiltroTipo(null) }}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-2">
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* Contenido */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
          Cargando pedidos...
        </div>
      ) : vista === 'mesas' ? (
        <VistaMesas mesas={mesas} pedidos={pedidos} onMesaClick={abrirMesa} />
      ) : (
        <VistaLista pedidos={pedidos} onPedidoClick={abrirPedidoDeLista} />
      )}

      {/* ────── Modal: Nuevo pedido ────── */}
      <Modal isOpen={modal === 'new'} onClose={() => { setModal(null); setNewForm(null) }}
        title={newForm?.mesa_id ? `Nuevo pedido · Mesa ${newForm.mesa_numero}` : `Nuevo pedido · ${getTipo(newForm?.tipo).label}`}>
        {newForm && (
          <div className="space-y-4">
            {newForm.tipo !== 'mesa' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre del cliente</label>
                  <input type="text" placeholder="Carlos Mamani"
                    value={newForm.cliente_nombre ?? ''}
                    onChange={e => setNewForm({ ...newForm, cliente_nombre: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Teléfono</label>
                  <input type="text" placeholder="70123456"
                    value={newForm.cliente_telefono ?? ''}
                    onChange={e => setNewForm({ ...newForm, cliente_telefono: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
                </div>

                {newForm.tipo === 'delivery' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Dirección</label>
                    <input type="text" placeholder="Av. Principal 123"
                      value={newForm.cliente_direccion ?? ''}
                      onChange={e => setNewForm({ ...newForm, cliente_direccion: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas</label>
              <textarea rows={2} placeholder="Observaciones del pedido..."
                value={newForm.notas ?? ''}
                onChange={e => setNewForm({ ...newForm, notas: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none" />
            </div>

            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
              Los productos se agregan después de crear el pedido.
            </p>

            <div className="flex gap-2 pt-1">
              <button onClick={() => { setModal(null); setNewForm(null) }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarNuevoPedido} disabled={createMut.isPending}
                className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                {createMut.isPending ? 'Creando...' : 'Crear y agregar items'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ────── Modal: Detalle del pedido ────── */}
      <Modal isOpen={modal === 'detail'} onClose={() => setModal(null)}
        title={pedidoSeleccionado ? `Pedido #${pedidoSeleccionado.numero}` : ''}
        maxWidth="max-w-2xl">
        {pedidoSeleccionado && (
          <div>
            {/* Info rápida */}
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: getTipo(pedidoSeleccionado.tipo).icon ? '#f1f5f9' : '', color: '#334155' }}>
                {getTipo(pedidoSeleccionado.tipo).icon} {getTipo(pedidoSeleccionado.tipo).label}
              </span>

              {pedidoSeleccionado.mesa && (
                <span className="text-xs text-gray-600">Mesa {pedidoSeleccionado.mesa.numero}</span>
              )}

              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: getEstado(pedidoSeleccionado.estado).bg, color: getEstado(pedidoSeleccionado.estado).text }}>
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: getEstado(pedidoSeleccionado.estado).dot }} />
                {getEstado(pedidoSeleccionado.estado).label}
              </span>

              {pedidoSeleccionado.cliente_nombre && (
                <span className="text-xs text-gray-500 ml-auto">
                  Cliente: {pedidoSeleccionado.cliente_nombre}
                </span>
              )}
            </div>

            {/* Editor de items */}
            <ItemsEditor
              pedido={pedidoSeleccionado}
              productos={productos}
              canEdit={canManage && !['pagado', 'cancelado', 'entregado'].includes(pedidoSeleccionado.estado)}
            />

            {/* Acciones */}
           {/* Acciones */}
<div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">

  {/* Imprimir ticket - siempre visible si hay items */}
  {pedidoSeleccionado.items?.length > 0 && (
    <button
      onClick={() => setTicketPedido(pedidoSeleccionado)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
    >
      <Printer size={14} /> Ticket cocina
    </button>
  )}

  {!['pagado', 'cancelado'].includes(pedidoSeleccionado.estado) && canManage && (
    <>
      <button
        onClick={() => cancelar(pedidoSeleccionado)}
        className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
      >
        Cancelar pedido
      </button>

      {SIGUIENTE_ESTADO[pedidoSeleccionado.estado] && (
        <button
          onClick={() => siguiente(pedidoSeleccionado)}
          disabled={estadoMut.isPending || (pedidoSeleccionado.items ?? []).length === 0}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
        >
          {LABEL_SIGUIENTE[pedidoSeleccionado.estado]}
          <ArrowRight size={14} />
        </button>
      )}
    </>
  )}

  {['pagado', 'cancelado'].includes(pedidoSeleccionado.estado) && (
    <p className="text-xs text-gray-400 text-center flex-1 flex items-center justify-center">
      Este pedido está {pedidoSeleccionado.estado} y no puede ser modificado.
    </p>
  )}
</div>
          </div>
        )}
      </Modal>
      <TicketModal
  isOpen={!!ticketPedido}
  onClose={() => setTicketPedido(null)}
  pedido={ticketPedido}
/>
    </Layout>
  )
}