import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'

const KEY = ['pedidos']

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: KEY })
  qc.invalidateQueries({ queryKey: ['mesas'] })
}

export function usePedidos(params) {
  return useQuery({ queryKey: [...KEY, params], queryFn: () => pedidosApi.getAll(params) })
}

export function usePedido(id) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => pedidosApi.getById(id),
    enabled: !!id,
  })
}

export function useCreatePedido() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: pedidosApi.create, onSuccess: () => invalidateAll(qc) })
}

export function useUpdatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => pedidosApi.update(id, data),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeletePedido() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: pedidosApi.delete, onSuccess: () => invalidateAll(qc) })
}

export function useCambiarEstadoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }) => pedidosApi.cambiarEstado(id, estado),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useAddItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => pedidosApi.addItem(id, data),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, itemId, cantidad }) => pedidosApi.updateItem(id, itemId, cantidad),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, itemId }) => pedidosApi.deleteItem(id, itemId),
    onSuccess: () => invalidateAll(qc),
  })
}