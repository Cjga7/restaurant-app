import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import { useAbrirCaja } from '../../hooks/useCaja'
import { DollarSign, Unlock } from 'lucide-react'

export default function AbrirCajaModal({ isOpen, onClose, sucursalId }) {
  const [monto, setMonto] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')

  const mut = useAbrirCaja()

  useEffect(() => {
    if (isOpen) { setMonto(''); setNotas(''); setError('') }
  }, [isOpen])

  const handleSubmit = () => {
    if (monto === '' || Number(monto) < 0) return setError('Ingresá un monto inicial válido.')
    if (!sucursalId) return setError('No se detectó la sucursal.')

    mut.mutate({
      sucursal_id: sucursalId,
      monto_inicial: Number(monto),
      notas_apertura: notas || null,
    }, {
      onSuccess: () => onClose(),
      onError: (e) => setError(e.response?.data?.message ?? 'Error al abrir caja.'),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-md">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b98120, #05966920)' }}>
          <Unlock size={20} style={{ color: '#065f46' }} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Iniciar turno</p>
          <h2 className="text-base font-semibold text-gray-900">Abrir caja</h2>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Monto inicial en efectivo <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Bs.</span>
            <input
              type="number" min="0" step="0.01" autoFocus
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="100.00"
              className="w-full border border-gray-200 rounded-xl pl-12 pr-3 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Efectivo con el que arrancás el turno</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas (opcional)</label>
          <textarea rows={2} placeholder="Observaciones de la apertura..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none" />
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={mut.isPending}
            className="flex-1 text-white text-sm py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            {mut.isPending ? 'Abriendo...' : 'Abrir caja'}
          </button>
        </div>
      </div>
    </Modal>
  )
}