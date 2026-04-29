import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../api/reservas'

const KEY = ['reservas']

export function useReservas(params) {
  return useQuery({ queryKey: [...KEY, params], queryFn: () => reservasApi.getAll(params) })
}

export function useCreateReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reservasApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['mesas'] })
    },
  })
}

export function useUpdateReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => reservasApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['mesas'] })
    },
  })
}

export function useDeleteReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reservasApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useCambiarEstadoReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }) => reservasApi.cambiarEstado(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['mesas'] })
    },
  })
}

export function useClienteLlego() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reservasApi.clienteLlego,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas'] })
      qc.invalidateQueries({ queryKey: ['mesas'] })
      qc.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })
}