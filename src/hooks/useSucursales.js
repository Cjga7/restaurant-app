import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sucursalesApi } from '../api/sucursales'

const QUERY_KEY = ['sucursales']

export function useSucursales(options = {}) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: sucursalesApi.getAll,
    ...options,
  })
}

export function useCreateSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sucursalesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => sucursalesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteSucursal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sucursalesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}