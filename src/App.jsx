import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import SucursalesPage from './pages/sucursales/SucursalesPage'
import MenuPage from './pages/menu/MenuPage'
import PrivateRoute from './components/PrivateRoute'
import MesasPage from './pages/mesas/MesasPage'
import ReservasPage from './pages/reservas/ReservasPage'

import EmpleadosPage from './pages/empleados/EmpleadosPage'

import PedidosPage from './pages/pedidos/PedidosPage'

import InventarioPage from './pages/inventario/InventarioPage'


import CajaPage from './pages/caja/CajaPage'
import UsersPage from './pages/users/UsersPage'

import ReportesPage from './pages/reportes/ReportesPage'
import CocinaPage from './pages/cocina/CocinaPage'



const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />

          <Route path="/sucursales" element={
            <PrivateRoute permission="sucursales.ver"><SucursalesPage /></PrivateRoute>
          } />

          <Route path="/menu" element={
            <PrivateRoute permission="menu.ver"><MenuPage /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/mesas" element={
            <PrivateRoute permission="mesas.ver"><MesasPage /></PrivateRoute>
          } />
          <Route path="/empleados" element={
            <PrivateRoute permission="empleados.ver"><EmpleadosPage /></PrivateRoute>
          } />

          <Route path="/reservas" element={
            <PrivateRoute permission="reservas.ver"><ReservasPage /></PrivateRoute>
          } />
          <Route path="/pedidos" element={
            <PrivateRoute permission="pedidos.ver"><PedidosPage /></PrivateRoute>
          } />
          <Route path="/inventario" element={
            <PrivateRoute permission="inventario.ver"><InventarioPage /></PrivateRoute>
          } />
          <Route path="/caja" element={
            <PrivateRoute permission="caja.ver"><CajaPage /></PrivateRoute>
          } />
          <Route path="/usuarios" element={
            <PrivateRoute permission="usuarios.ver"><UsersPage /></PrivateRoute>
          } />


          <Route path="/reportes" element={
            <PrivateRoute permission="reportes.ver"><ReportesPage /></PrivateRoute>
          } />
          <Route path="/cocina" element={
            <PrivateRoute permission="pedidos.gestionar"><CocinaPage /></PrivateRoute>
          } />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}