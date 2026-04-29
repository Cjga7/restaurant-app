import { useRef } from 'react'
import Modal from '../../components/ui/Modal'
import TicketCocina from './TicketCocina'
import { Printer, Download } from 'lucide-react'

export default function TicketModal({ isOpen, onClose, pedido }) {
  const ticketRef = useRef(null)

  const handleImprimir = () => {
    window.print()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ticket para cocina" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Vista previa */}
        <div className="bg-gray-100 rounded-2xl p-4 flex justify-center">
          <TicketCocina ref={ticketRef} pedido={pedido} />
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cerrar
          </button>
          <button onClick={handleImprimir}
            className="flex-1 flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-xl font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <Printer size={14} /> Imprimir ticket
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          💡 Tip: configurá tu impresora térmica con tamaño de papel 80mm para mejor resultado.
        </p>
      </div>
    </Modal>
  )
}