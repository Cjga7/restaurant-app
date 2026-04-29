import { forwardRef } from 'react'

const fmtFecha = (d) => new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtHora  = (d) => new Date(d).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

const METODO_LABEL = {
  efectivo:      'Efectivo',
  tarjeta:       'Tarjeta',
  qr:            'Pago QR',
  transferencia: 'Transferencia',
  mixto:         'Pago mixto',
}

const ReciboVenta = forwardRef(({ pago, pedido }, ref) => {
  if (!pago || !pedido) return null

  return (
    <div ref={ref} className="recibo-venta">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .recibo-venta, .recibo-venta * { visibility: visible; }
          .recibo-venta {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            padding: 4mm !important;
          }
          @page { size: 80mm auto; margin: 0; }
        }

        .recibo-venta {
          font-family: 'Courier New', monospace;
          width: 280px;
          padding: 16px;
          background: white;
          color: black;
          font-size: 12px;
          line-height: 1.4;
        }
        .recibo-venta .center { text-align: center; }
        .recibo-venta .right  { text-align: right; }
        .recibo-venta .bold   { font-weight: bold; }
        .recibo-venta .big    { font-size: 14px; }
        .recibo-venta .huge   { font-size: 18px; font-weight: bold; }
        .recibo-venta hr {
          border: none;
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .recibo-venta .row {
          display: flex;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 2px;
        }
        .recibo-venta .item-name {
          flex: 1;
          word-break: break-word;
        }
        .recibo-venta .item-precio {
          flex-shrink: 0;
          min-width: 60px;
          text-align: right;
        }
      `}</style>

      {/* Header */}
      <div className="center">
        <div style={{ fontSize: 22 }}>🍽</div>
        <div className="big bold">RESTAURANTOS</div>
        <div>{pedido.sucursal?.nombre ?? 'Sucursal'}</div>
        {pedido.sucursal?.direccion && (
          <div style={{ fontSize: 10 }}>{pedido.sucursal.direccion}</div>
        )}
        {pedido.sucursal?.telefono && (
          <div style={{ fontSize: 10 }}>Tel: {pedido.sucursal.telefono}</div>
        )}
      </div>

      <hr />

      {/* Tipo de comprobante */}
      <div className="center bold big">
        RECIBO DE VENTA
      </div>

      <hr />

      {/* Info del pago y pedido */}
      <div>
        <div className="row">
          <span className="bold">Pedido:</span>
          <span>#{pedido.numero}</span>
        </div>
        <div className="row">
          <span className="bold">Recibo:</span>
          <span>#{String(pago.id).padStart(6, '0')}</span>
        </div>
        <div className="row">
          <span className="bold">Fecha:</span>
          <span>{fmtFecha(pago.created_at)} {fmtHora(pago.created_at)}</span>
        </div>
        {pago.cajero && (
          <div className="row">
            <span className="bold">Cajero:</span>
            <span>{pago.cajero.name}</span>
          </div>
        )}
        {pedido.mesa && (
          <div className="row">
            <span className="bold">Mesa:</span>
            <span>{pedido.mesa.numero}</span>
          </div>
        )}
        {pedido.cliente_nombre && (
          <div className="row">
            <span className="bold">Cliente:</span>
            <span>{pedido.cliente_nombre}</span>
          </div>
        )}
      </div>

      <hr />

      {/* Items */}
      <div>
        <div className="row bold">
          <span style={{ flex: 1 }}>Detalle</span>
          <span className="item-precio">Subtotal</span>
        </div>
        <hr style={{ margin: '4px 0', borderTopStyle: 'solid' }} />

        {pedido.items?.map(item => (
          <div key={item.id} style={{ marginBottom: 4 }}>
            <div className="row">
              <span className="item-name">
                <span className="bold">{item.cantidad}x </span>
                {item.producto_nombre}
              </span>
              <span className="item-precio">{Number(item.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 10, color: '#555', paddingLeft: 18 }}>
              {Number(item.precio_unitario).toFixed(2)} c/u
            </div>
          </div>
        ))}
      </div>

      <hr />

      {/* Totales */}
      <div className="row big bold">
        <span>TOTAL:</span>
        <span>Bs. {Number(pago.monto_total).toFixed(2)}</span>
      </div>

      <hr />

      {/* Detalle del pago */}
      <div>
        <div className="bold" style={{ marginBottom: 4 }}>FORMA DE PAGO:</div>
        <div className="row">
          <span>Método:</span>
          <span className="bold">{METODO_LABEL[pago.metodo] ?? pago.metodo}</span>
        </div>

        {pago.metodo === 'efectivo' && (
          <>
            {pago.monto_recibido && (
              <div className="row">
                <span>Recibido:</span>
                <span>Bs. {Number(pago.monto_recibido).toFixed(2)}</span>
              </div>
            )}
            {Number(pago.cambio) > 0 && (
              <div className="row bold">
                <span>Cambio:</span>
                <span>Bs. {Number(pago.cambio).toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {pago.metodo === 'mixto' && (
          <>
            {Number(pago.monto_efectivo) > 0 && (
              <div className="row">
                <span>· Efectivo:</span>
                <span>Bs. {Number(pago.monto_efectivo).toFixed(2)}</span>
              </div>
            )}
            {Number(pago.monto_tarjeta) > 0 && (
              <div className="row">
                <span>· Tarjeta:</span>
                <span>Bs. {Number(pago.monto_tarjeta).toFixed(2)}</span>
              </div>
            )}
            {Number(pago.monto_qr) > 0 && (
              <div className="row">
                <span>· QR:</span>
                <span>Bs. {Number(pago.monto_qr).toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {pago.referencia && (
          <div className="row" style={{ fontSize: 10 }}>
            <span>Ref:</span>
            <span>{pago.referencia}</span>
          </div>
        )}
      </div>

      <hr />

      {/* Footer */}
      <div className="center" style={{ fontSize: 11, marginTop: 8 }}>
        <div className="bold">¡GRACIAS POR SU PREFERENCIA!</div>
        <div style={{ marginTop: 6, fontSize: 10 }}>
          Conserve este recibo para cualquier reclamo
        </div>
      </div>

      <div className="center" style={{ fontSize: 9, marginTop: 8 }}>
        ─── No válido como factura ───
      </div>
    </div>
  )
})

ReciboVenta.displayName = 'ReciboVenta'
export default ReciboVenta