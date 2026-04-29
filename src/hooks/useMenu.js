import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '../api/menu'

// ── Categorías ──────────────────────────────────────────
export function useCategorias() {
  return useQuery({ queryKey: ['menu-categorias'], queryFn: () => menuApi.getCategorias() })
}

export function useCreateCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: menuApi.createCategoria,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-categorias'] }),
  })
}

export function useUpdateCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => menuApi.updateCategoria(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-categorias'] }),
  })
}

export function useDeleteCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: menuApi.deleteCategoria,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-categorias'] }),
  })
}

// ── Productos ────────────────────────────────────────────
export function useProductos(categoriaId) {
  return useQuery({
    queryKey: ['menu-productos', categoriaId ?? 'all'],
    queryFn: () => menuApi.getProductos(categoriaId ? { categoria_id: categoriaId } : {}),
  })
}

export function useCreateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: menuApi.createProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-productos'] }),
  })
}

export function useUpdateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => menuApi.updateProducto(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-productos'] }),
  })
}

export function useDeleteProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: menuApi.deleteProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-productos'] }),
  })
}