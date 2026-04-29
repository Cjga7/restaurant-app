import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { empleadosApi } from '../api/empleados'

const KEY = ['empleados']

export function useEmpleados(params) {
  return useQuery({ queryKey: [...KEY, params], queryFn: () => empleadosApi.getAll(params) })
}

export function useCreateEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: empleadosApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => empleadosApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: empleadosApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}