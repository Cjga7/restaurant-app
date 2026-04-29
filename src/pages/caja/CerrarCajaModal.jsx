import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import { useCerrarCaja } from '../../hooks/useCaja'
import { Lock, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'

export default function CerrarCajaModal({ isOpen, onClose, sesion }) {
  const [montoReal, setMontoReal] = useState('')
  const [notas, setNotas]         = useState('')
  const [error, setError]         = useState('')

  const mut = useCerrarCaja()

  useEffect(() => {
    if (isOpen) { setMontoReal(''); setNotas(''); setError('') }
  }, [isOpen])

  if (!sesion) return null

  // Cálculos
  const efectivoRecaudado = sesion.pagos?.reduce((sum, p) => sum + Number(p.monto_efectivo ?? 0), 0) ?? 0
  const tarjetaRecaudada  = sesion.pagos?.reduce((sum, p) => sum + Number(p.monto_tarjeta ?? 0), 0) ?? 0
  const qrRecaudado       = sesion.pagos?.reduce((sum, p) => sum + Number(p.monto_qr ?? 0), 0) ?? 0
  const totalRecaudado    = efectivoRecaudado + tarjetaRecaudada + qrRecaudado
  const montoEsperado     = Number(sesion.monto_inicial) + efectivoRecaudado

  const diferencia = montoReal !== '' ? Number(montoReal) - montoEsperado : null

  const handleSubmit = () => {
    if (montoReal === '' || Number(montoReal) < 0) return setError('Ingresá el efectivo contado físicamente.')

    mut.mutate({
      id: sesion.id,
      data: { monto_real: Number(montoReal), notas_cierre: notas || null },
    }, {
      onSuccess: () => onClose(),
      onError: (e) => setError(e.response?.data?.message ?? 'Error al cerrar caja.'),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-lg">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ef444420, #dc262620)' }}>
          <Lock size={20} style={{ color: '#991b1b' }} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Finalizar turno</p>
          <h2 className="text-base font-semibold text-gray-900">Cierre de caja</h2>
        </div>
      </div>

      {/* Resumen de la sesión */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 mb-5 border border-slate-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumen del turno</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Monto inicial</span>
            <span className="font-semibold">Bs. {Number(sesion.monto_inicial).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">💵 Efectivo recaudado</span>
            <span className="font-semibold text-green-700">+ Bs. {efectivoRecaudado.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">💳 Tarjeta</span>
            <span className="font-semibold text-blue-700">Bs. {tarjetaRecaudada.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">📱 QR / Transferencia</span>
            <span className="font-semibold text-amber-700">Bs. {qrRecaudado.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200">
            <span className="text-gray-700 font-medium">Total ventas del turno</span>
            <span className="font-bold text-slate-900">Bs. {totalRecaudado.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-slate-300">
            <span className="text-gray-800 font-semibold">💰 Efectivo esperado en caja</span>
            <span className="font-bold text-lg text-slate-900">Bs. {montoEsperado.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Input de monto real */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Efectivo contado físicamente <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Bs.</span>
          <input
            type="number" min="0" step="0.01" autoFocus
            value={montoReal}
            onChange={e => setMontoReal(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-xl pl-12 pr-3 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Contá el efectivo real en caja e ingresalo acá</p>
      </div>

      {/* Diferencia en vivo */}
      {diferencia !== null && (
        <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 ${
          Math.abs(diferencia) < 0.01
            ? 'bg-green-50 border border-green-200'
            : diferencia > 0
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {Math.abs(diferencia) < 0.01
            ? <CheckCircle2 size={18} style={{ color: '#059669' }} />
            : diferencia > 0
            ? <TrendingUp size={18} style={{ color: '#2563eb' }} />
            : <TrendingDown size={18} style={{ color: '#dc2626' }} />}
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-700">
              {Math.abs(diferencia) < 0.01
                ? 'Cuadre perfecto'
                : diferencia > 0
                ? 'Sobrante'
                : 'Faltante'}
            </p>
            <p className={`text-sm font-bold ${
              Math.abs(diferencia) < 0.01
                ? 'text-green-700'
                : diferencia > 0
                ? 'text-blue-700'
                : 'text-red-700'
            }`}>
              {diferencia > 0 ? '+' : ''}Bs. {diferencia.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas del cierre</label>
        <textarea rows={2} placeholder="Observaciones, motivo de diferencia..."
          value={notas}
          onChange={e => setNotas(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none" />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={mut.isPending}
          className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
          {mut.isPending ? 'Cerrando...' : 'Cerrar caja'}
        </button>
      </div>
    </Modal>
  )
}