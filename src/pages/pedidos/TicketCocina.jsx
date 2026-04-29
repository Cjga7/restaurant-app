import { forwardRef } from 'react'

const fmtFecha = (d) => new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtHora  = (d) => new Date(d).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

const TicketCocina = forwardRef(({ pedido }, ref) => {
  if (!pedido) return null

  return (
    <div ref={ref} className="ticket-cocina">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .ticket-cocina, .ticket-cocina * { visibility: visible; }
          .ticket-cocina {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            padding: 4mm !important;
          }
          @page { size: 80mm auto; margin: 0; }
        }

        .ticket-cocina {
          font-family: 'Courier New', monospace;
          width: 280px;
          padding: 16px;
          background: white;
          color: black;
          font-size: 12px;
          line-height: 1.4;
        }
        .ticket-cocina .center { text-align: center; }
        .ticket-cocina .bold   { font-weight: bold; }
        .ticket-cocina .big    { font-size: 16px; }
        .ticket-cocina .huge   { font-size: 22px; font-weight: bold; }
        .ticket-cocina hr {
          border: none;
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .ticket-cocina .item-row {
          display: flex;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 2px;
        }
        .ticket-cocina .item-name {
          flex: 1;
          word-break: break-word;
        }
        .ticket-cocina .item-cantidad {
          font-weight: bold;
          flex-shrink: 0;
          min-width: 28px;
        }
        .ticket-cocina .item-precio {
          flex-shrink: 0;
          min-width: 50px;
          text-align: right;
        }
      `}</style>

      {/* Header */}
      <div className="center">
        <div className="huge">🍽</div>
        <div className="big bold">RESTAURANTOS</div>
        <div>{pedido.sucursal?.nombre ?? 'Sucursal'}</div>
      </div>

      <hr />

      {/* Info del pedido */}
      <div className="center">
        <div className="big bold">PEDIDO</div>
        <div className="big bold">#{pedido.numero}</div>
      </div>

      <hr />

      <div>
        <div><span className="bold">Tipo: </span>
          {pedido.tipo === 'mesa' && pedido.mesa
            ? `Mesa ${pedido.mesa.numero}`
            : pedido.tipo === 'delivery'
            ? 'Delivery'
            : 'Para llevar'}
        </div>
        {pedido.mozo && (
          <div><span className="bold">Mozo: </span>{pedido.mozo.name}</div>
        )}
        {pedido.cliente_nombre && (
          <div><span className="bold">Cliente: </span>{pedido.cliente_nombre}</div>
        )}
        {pedido.cliente_telefono && (
          <div><span className="bold">Tel: </span>{pedido.cliente_telefono}</div>
        )}
        {pedido.cliente_direccion && (
          <div><span className="bold">Dir: </span>{pedido.cliente_direccion}</div>
        )}
        <div>
          <span className="bold">Fecha: </span>
          {fmtFecha(pedido.created_at)} · {fmtHora(pedido.created_at)}
        </div>
      </div>

      <hr />

      {/* Items */}
      <div>
        {pedido.items && pedido.items.length > 0 ? (
          pedido.items.map(item => (
            <div key={item.id} style={{ marginBottom: 6 }}>
              <div className="item-row">
                <span className="item-cantidad">{item.cantidad}x</span>
                <span className="item-name bold">{item.producto_nombre}</span>
                <span className="item-precio">{Number(item.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#666', paddingLeft: 30 }}>
                {Number(item.precio_unitario).toFixed(2)} c/u
              </div>
            </div>
          ))
        ) : (
          <div className="center" style={{ fontStyle: 'italic' }}>(Sin items)</div>
        )}
      </div>

      <hr />

      {/* Total */}
      <div className="item-row big bold">
        <span>TOTAL:</span>
        <span>Bs. {Number(pedido.total).toFixed(2)}</span>
      </div>

      {pedido.notas && (
        <>
          <hr />
          <div>
            <div className="bold">Notas:</div>
            <div style={{ fontStyle: 'italic' }}>{pedido.notas}</div>
          </div>
        </>
      )}

      <hr />

      <div className="center" style={{ fontSize: 10, marginTop: 8 }}>
        ─── PARA COCINA ───
      </div>
    </div>
  )
})

TicketCocina.displayName = 'TicketCocina'
export default TicketCocina