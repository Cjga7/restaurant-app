import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import echo from '../lib/echo'

export function usePedidosRealtime(sucursalId, onUpdate) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!sucursalId) return

    const channelName = `pedidos.sucursal.${sucursalId}`
    const channel = echo.channel(channelName)

    channel.listen('.pedido.actualizado', (data) => {
      // Refrescar caches
      qc.invalidateQueries({ queryKey: ['pedidos'] })
      qc.invalidateQueries({ queryKey: ['mesas'] })

      // Callback opcional
      if (onUpdate) onUpdate(data)
    })

    return () => {
      echo.leave(channelName)
    }
  }, [sucursalId, qc, onUpdate])
}