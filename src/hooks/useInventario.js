import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventarioApi } from '../api/inventario'

const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: ['inventario-items'] })
  qc.invalidateQueries({ queryKey: ['inventario-stock'] })
  qc.invalidateQueries({ queryKey: ['inventario-movimientos'] })
}

// ── Items ──────────────────────────────────
export function useItems(params) {
  return useQuery({
    queryKey: ['inventario-items', params],
    queryFn: () => inventarioApi.getItems(params),
  })
}

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: inventarioApi.createItem, onSuccess: () => invalidate(qc) })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => inventarioApi.updateItem(id, data),
    onSuccess: () => invalidate(qc),
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: inventarioApi.deleteItem, onSuccess: () => invalidate(qc) })
}

// ── Stock ──────────────────────────────────
export function useStock(params) {
  return useQuery({
    queryKey: ['inventario-stock', params],
    queryFn: () => inventarioApi.getStock(params),
  })
}

export function useUpdateUmbrales() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => inventarioApi.updateUmbrales(id, data),
    onSuccess: () => invalidate(qc),
  })
}

export function useRegistrarMovimiento() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: inventarioApi.movimiento, onSuccess: () => invalidate(qc) })
}

// ── Movimientos ────────────────────────────
export function useMovimientos(params) {
  return useQuery({
    queryKey: ['inventario-movimientos', params],
    queryFn: () => inventarioApi.getMovimientos(params),
  })
}

export function useTransferir() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: inventarioApi.transferir, onSuccess: () => invalidate(qc) })
}