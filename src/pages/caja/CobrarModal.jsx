import Modal from '../../components/ui/Modal'
import { useProcesarPago } from '../../hooks/useCaja'
import { METODOS } from './constants'
import ReciboModal from './ReciboModal'
import { useState, useEffect } from 'react'
export default function CobrarModal({ isOpen, onClose, pedido }) {
  const [metodo, setMetodo]               = useState('efectivo')
  const [recibido, setRecibido]           = useState('')
  const [montoEfectivo, setMontoEfectivo] = useState('')
  const [montoTarjeta, setMontoTarjeta]   = useState('')
  const [montoQr, setMontoQr]             = useState('')
  const [referencia, setReferencia]       = useState('')
  const [notas, setNotas]                 = useState('')
  const [error, setError]                 = useState('')
  const [reciboData, setReciboData]       = useState(null)

  const mut = useProcesarPago()

  useEffect(() => {
    if (isOpen && pedido) {
      setMetodo('efectivo')
      setRecibido('')
      setMontoEfectivo('')
      setMontoTarjeta('')
      setMontoQr('')
      setReferencia('')
      setNotas('')
      setError('')
    }
  }, [isOpen, pedido])

  if (!pedido) return null

  const total = Number(pedido.total)
  const recibidoNum = Number(recibido) || 0
  const cambio = metodo === 'efectivo' && recibidoNum > total ? recibidoNum - total : 0

  const sumaMixto = (Number(montoEfectivo) || 0) + (Number(montoTarjeta) || 0) + (Number(montoQr) || 0)
  const restaMixto = total - sumaMixto

  // Botones rápidos para efectivo
  const sugerencias = [total, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20, Math.ceil(total / 50) * 50, 100, 200]
    .filter((v, i, a) => v >= total && a.indexOf(v) === i)
    .slice(0, 4)

  const handleSubmit = () => {
    setError('')

    const payload = {
      pedido_id: pedido.id,
      metodo,
      referencia: referencia || null,
      notas: notas || null,
    }

    if (metodo === 'efectivo') {
      if (!recibido || recibidoNum < total)
        return setError(`El monto recibido debe ser al menos Bs. ${total.toFixed(2)}`)
      payload.monto_recibido = recibidoNum
    } else if (metodo === 'mixto') {
      if (Math.abs(restaMixto) > 0.01)
        return setError(`La suma no coincide con el total. Falta Bs. ${restaMixto.toFixed(2)}`)
      payload.monto_efectivo = Number(montoEfectivo) || 0
      payload.monto_tarjeta  = Number(montoTarjeta) || 0
      payload.monto_qr       = Number(montoQr) || 0
    }

    mut.mutate(payload, {
  onSuccess: (pagoCreado) => {
    // Guardar el pago + pedido para mostrar el recibo
    setReciboData({ pago: pagoCreado, pedido })
  },
  onError: (e) => setError(e.response?.data?.message ?? 'Error al procesar el pago.'),
})
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cobrar pedido #${pedido.numero}`} maxWidth="max-w-lg">

      {/* Total a cobrar */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 mb-5 text-center">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Total a cobrar</p>
        <p className="text-4xl font-bold text-white">Bs. {total.toFixed(2)}</p>
        {pedido.items && (
          <p className="text-xs text-slate-400 mt-2">{pedido.items.length} items</p>
        )}
      </div>

      {/* Selector de método */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-2">Método de pago</label>
        <div className="grid grid-cols-3 gap-2">
          {METODOS.map(m => {
            const active = metodo === m.value
            return (
              <button
                key={m.value}
                onClick={() => setMetodo(m.value)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all"
                style={active
                  ? { background: m.bg, borderColor: m.dot, color: m.text }
                  : { background: 'white', borderColor: '#e5e7eb', color: '#6b7280' }}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-xs font-semibold">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Inputs según método */}
      {metodo === 'efectivo' && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Monto recibido</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Bs.</span>
            <input
              type="number" min={total} step="0.01" autoFocus
              value={recibido}
              onChange={e => setRecibido(e.target.value)}
              placeholder={total.toFixed(2)}
              className="w-full border border-gray-200 rounded-xl pl-12 pr-3 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          {/* Sugerencias rápidas */}
          {sugerencias.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {sugerencias.map(s => (
                <button
                  key={s}
                  onClick={() => setRecibido(s.toFixed(2))}
                  className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  Bs. {s.toFixed(2)}
                </button>
              ))}
            </div>
          )}

          {/* Cambio */}
          {cambio > 0 && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-green-900">Cambio al cliente</span>
              <span className="text-lg font-bold text-green-700">Bs. {cambio.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {(metodo === 'tarjeta' || metodo === 'qr' || metodo === 'transferencia') && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Referencia / Comprobante (opcional)
          </label>
          <input
            type="text"
            value={referencia}
            onChange={e => setReferencia(e.target.value)}
            placeholder={metodo === 'tarjeta' ? 'Últimos 4 dígitos o voucher' : 'N° de transacción'}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>
      )}

      {metodo === 'mixto' && (
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">💵 Efectivo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Bs.</span>
              <input type="number" min="0" step="0.01"
                value={montoEfectivo}
                onChange={e => setMontoEfectivo(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">💳 Tarjeta</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Bs.</span>
              <input type="number" min="0" step="0.01"
                value={montoTarjeta}
                onChange={e => setMontoTarjeta(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">📱 QR / Transferencia</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Bs.</span>
              <input type="number" min="0" step="0.01"
                value={montoQr}
                onChange={e => setMontoQr(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" />
            </div>
          </div>

          {/* Resumen mixto */}
          <div className={`rounded-xl p-3 flex items-center justify-between ${
            Math.abs(restaMixto) < 0.01 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <span className="text-xs font-medium text-gray-700">
              {Math.abs(restaMixto) < 0.01 ? '✓ Suma correcta' : `Falta por cubrir`}
            </span>
            <span className={`text-sm font-bold ${Math.abs(restaMixto) < 0.01 ? 'text-green-700' : 'text-amber-700'}`}>
              Bs. {Math.abs(restaMixto).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={mut.isPending}
          className="flex-1 text-white text-sm py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
          {mut.isPending ? 'Procesando...' : 'Cobrar'}
        </button>
      </div>
      <ReciboModal
  isOpen={!!reciboData}
  onClose={() => {
    setReciboData(null)
    onClose() // cierra también el modal de cobro
  }}
  pago={reciboData?.pago}
  pedido={reciboData?.pedido}
  mostrarExito={true}
/>
    </Modal>
  )
}