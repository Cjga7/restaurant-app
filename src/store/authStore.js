import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      sucursalActiva: null, // { id, nombre } — solo usada por super_admin

      setAuth: (user, token) => set({
        user,
        token,
        // Si el user tiene sucursal propia, esa es la activa siempre
        sucursalActiva: user.sucursal ?? null,
      }),

      clearAuth: () => set({ user: null, token: null, sucursalActiva: null }),

      setSucursalActiva: (sucursal) => set({ sucursalActiva: sucursal }),

      hasRole:       (role)       => get().user?.roles?.includes(role) ?? false,
      hasPermission: (permission) => get().user?.permissions?.includes(permission) ?? false,
      isSuperAdmin:  ()           => get().user?.roles?.includes('super_admin') ?? false,

      // ID de sucursal efectiva para filtrar queries
      getSucursalId: () => {
        const { user, sucursalActiva } = get()
        if (user?.sucursal_id) return user.sucursal_id  // rol con sucursal fija
        return sucursalActiva?.id ?? null                // super admin con selección
      },
    }),
    { name: 'restaurant-auth' }
  )
)