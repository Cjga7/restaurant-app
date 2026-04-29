import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cajaApi } from '../api/caja'

const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: ['caja-sesiones'] })
  qc.invalidateQueries({ queryKey: ['mi-sesion'] })
  qc.invalidateQueries({ queryKey: ['pagos'] })
  qc.invalidateQueries({ queryKey: ['pedidos'] })
  qc.invalidateQueries({ queryKey: ['mesas'] })
}

// ── Sesiones ──────────────────────────
export function useSesiones(params) {
  return useQuery({
    queryKey: ['caja-sesiones', params],
    queryFn: () => cajaApi.getSesiones(params),
  })
}

export function useMiSesion(sucursalId) {
  return useQuery({
    queryKey: ['mi-sesion', sucursalId],
    queryFn: () => cajaApi.miSesion(sucursalId),
    enabled: !!sucursalId,
  })
}

export function useAbrirCaja() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: cajaApi.abrir, onSuccess: () => invalidate(qc) })
}

export function useCerrarCaja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => cajaApi.cerrar(id, data),
    onSuccess: () => invalidate(qc),
  })
}

// ── Pagos ─────────────────────────────
export function usePagos(params) {
  return useQuery({
    queryKey: ['pagos', params],
    queryFn: () => cajaApi.getPagos(params),
  })
}

export function useProcesarPago() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: cajaApi.procesarPago, onSuccess: () => invalidate(qc) })
}
export function useSesionesActivas(sucursalId) {
  return useQuery({
    queryKey: ['caja-sesiones-activas', sucursalId],
    queryFn: () => cajaApi.sesionesActivas(sucursalId),
  })
}