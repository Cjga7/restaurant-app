import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mesasApi } from '../api/mesas'

const KEY = ['mesas']

export function useMesas(params) {
  return useQuery({ queryKey: [...KEY, params], queryFn: () => mesasApi.getAll(params) })
}

export function useCreateMesa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mesasApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateMesa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => mesasApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteMesa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mesasApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useCambiarEstadoMesa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }) => mesasApi.cambiarEstado(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}