import { useQuery } from '@tanstack/react-query'
import { reportesApi } from '../api/reportes'

export function useResumen(params) {
  return useQuery({ queryKey: ['reporte-resumen', params], queryFn: () => reportesApi.resumen(params) })
}

export function useVentasPorDia(params) {
  return useQuery({ queryKey: ['reporte-ventas-dia', params], queryFn: () => reportesApi.ventasPorDia(params) })
}

export function useProductosTop(params) {
  return useQuery({ queryKey: ['reporte-productos-top', params], queryFn: () => reportesApi.productosTop(params) })
}

export function useVentasPorMetodo(params) {
  return useQuery({ queryKey: ['reporte-ventas-metodo', params], queryFn: () => reportesApi.ventasPorMetodo(params) })
}

export function usePerformanceCajeros(params) {
  return useQuery({ queryKey: ['reporte-cajeros', params], queryFn: () => reportesApi.performanceCajeros(params) })
}

export function useStockCritico(params) {
  return useQuery({ queryKey: ['reporte-stock-critico', params], queryFn: () => reportesApi.stockCritico(params) })
}