import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recetasApi } from '../api/recetas'

export function useRecetas(productoId) {
  return useQuery({
    queryKey: ['recetas', productoId],
    queryFn: () => recetasApi.getByProducto(productoId),
    enabled: !!productoId,
  })
}

export function useSyncReceta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productoId, items }) => recetasApi.sync(productoId, items),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['recetas', vars.productoId] }),
  })
}