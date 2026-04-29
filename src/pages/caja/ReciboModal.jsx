import { useRef } from 'react'
import Modal from '../../components/ui/Modal'
import ReciboVenta from './ReciboVenta'
import { Printer, CheckCircle2 } from 'lucide-react'

export default function ReciboModal({ isOpen, onClose, pago, pedido, mostrarExito }) {
  const reciboRef = useRef(null)

  const handleImprimir = () => {
    window.print()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-md">
      {/* Mensaje de éxito si viene desde un cobro */}
      {mostrarExito && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 size={22} style={{ color: '#059669' }} />
          <div>
            <p className="text-sm font-semibold text-green-900">¡Pago procesado correctamente!</p>
            <p className="text-xs text-green-700">El pedido ha sido cobrado y la mesa liberada.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Vista previa */}
        <div className="bg-gray-100 rounded-2xl p-4 flex justify-center">
          <ReciboVenta ref={reciboRef} pago={pago} pedido={pedido} />
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cerrar
          </button>
          <button onClick={handleImprimir}
            className="flex-1 flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-xl font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            <Printer size={14} /> Imprimir recibo
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          💡 Configurá tu impresora térmica con tamaño de papel 80mm.
        </p>
      </div>
    </Modal>
  )
}