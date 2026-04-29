# 🍽️ RestaurantOS

> Frontend del sistema de gestión integral para restaurantes multi-sucursal con actualizaciones en tiempo real.

SPA construida con **React 19 + Vite** que consume la API de [restaurant-api](https://github.com/Cjga7/restaurant-api-). Implementa una interfaz completa de gestión: pedidos, mesas, caja, reportes con gráficos y un Kitchen Display System que se actualiza en tiempo real vía WebSockets.

🔗 **Backend del proyecto:** [restaurant-api](https://github.com/Cjga7/restaurant-api-)

---

## 📸 Vista general

El sistema cuenta con 11 módulos accesibles según el rol del usuario logueado:
┌──────────────────────────────────────────────────┐
│  Dashboard · Sucursales · Usuarios · Menú        │
│  Mesas · Pedidos · Reservas · Empleados          │
│  Inventario · Caja · Reportes · Cocina (KDS)     │
└──────────────────────────────────────────────────┘

---

## ✨ Características principales

- 🎨 **Diseño profesional consistente** — Sidebar dark, paleta amber, tipografía Plus Jakarta Sans, iconos Lucide
- 🔐 **UI condicionada por rol** — Cada usuario ve solo los módulos a los que tiene permiso
- ⚡ **Tiempo real con WebSockets** — Kitchen Display se actualiza al instante sin recargar
- 📊 **Gráficos interactivos** — Reportes con líneas, barras y pies (Recharts)
- 🧾 **Tickets imprimibles** — Tickets de cocina y recibos de venta con CSS `@media print` para impresoras térmicas 80mm
- 📱 **Responsive** — Optimizado para desktop, tablets (mozos) y mobile
- 🔄 **Caché inteligente** — TanStack Query con invalidación coordinada entre módulos
- 💾 **State persistente** — Zustand guarda sesión y preferencias entre recargas

---

## 🛠️ Stack técnico

| Tecnología | Uso |
|------------|-----|
| **React 19** | UI con hooks |
| **Vite** | Build tool y dev server |
| **TanStack Query** | Manejo de estado del servidor |
| **Zustand** | Estado global del cliente (persistente) |
| **React Router v6** | Navegación |
| **Tailwind CSS v4** | Estilos utility-first |
| **Recharts** | Gráficos para reportes |
| **Lucide Icons** | Iconografía |
| **Axios** | Cliente HTTP |
| **Laravel Echo + Pusher.js** | Cliente WebSocket para Reverb |

---

## 🏗️ Estructura del proyecto
src/
├── api/              # Clientes Axios por módulo
├── components/
│   ├── layout/       # Sidebar, Header, Layout
│   └── ui/           # Componentes reutilizables (Modal, etc)
├── hooks/            # Custom hooks (useUsers, usePedidos, etc)
├── lib/              # Configuración (Echo, axios)
├── pages/            # Una carpeta por módulo
│   ├── auth/         # Login
│   ├── caja/         # Caja, modales de cobro y recibo
│   ├── cocina/       # Kitchen Display System
│   ├── empleados/
│   ├── inventario/
│   ├── menu/
│   ├── mesas/
│   ├── pedidos/
│   ├── reportes/
│   ├── reservas/
│   ├── sucursales/
│   └── users/
├── store/            # Zustand stores
└── App.jsx           # Router principal

---

## 🚀 Instalación

### Requisitos previos

- Node.js 20+
- El [backend](https://github.com/Cjga7/restaurant-api-) corriendo en `http://127.0.0.1:8000`

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Cjga7/restaurant-app.git
cd restaurant-app

# 2. Instalar dependencias
npm install

# 3. Copiar el archivo de entorno
cp .env.example .env

# 4. Configurar el .env con las claves de Reverb del backend
# VITE_REVERB_APP_KEY debe coincidir con REVERB_APP_KEY del backend

# 5. Levantar el dev server
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## 🎯 Patrones de diseño aplicados

### Custom hooks por módulo

Cada módulo tiene su propio archivo de hooks que abstrae las queries y mutations:

```js
// src/hooks/usePedidos.js
export function usePedidos(params) {
  return useQuery({
    queryKey: ['pedidos', params],
    queryFn: () => pedidosApi.getAll(params),
  })
}

export function useCambiarEstadoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }) => pedidosApi.cambiarEstado(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  })
}
```

### Invalidación coordinada

Las mutations invalidan múltiples caches relacionados para mantener todo sincronizado:

```js
// Al procesar un pago
const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: ['caja-sesiones'] })
  qc.invalidateQueries({ queryKey: ['mi-sesion'] })
  qc.invalidateQueries({ queryKey: ['pagos'] })
  qc.invalidateQueries({ queryKey: ['pedidos'] })  // se libera la mesa
  qc.invalidateQueries({ queryKey: ['mesas'] })
}
```

### Permisos en UI

```jsx
const { hasPermission } = useAuthStore()
const canManage = hasPermission('usuarios.gestionar')

return canManage && <button>Editar</button>
```

---

## 📡 WebSockets — Kitchen Display

El KDS se suscribe al canal de la sucursal del usuario logueado:

```js
// src/hooks/usePedidosRealtime.js
const channel = echo.channel(`pedidos.sucursal.${sucursalId}`)

channel.listen('.pedido.actualizado', (data) => {
  qc.invalidateQueries({ queryKey: ['pedidos'] })
  qc.invalidateQueries({ queryKey: ['mesas'] })
})
```

Cuando el mozo envía un pedido a cocina, el cocinero lo ve aparecer en su pantalla **automáticamente sin recargar**, y viceversa cuando el cocinero marca el pedido como listo.

---

## 🧾 Tickets imprimibles

El sistema genera dos tipos de tickets en formato 80mm para impresoras térmicas:

### 🎫 Ticket de cocina
Se imprime cuando el mozo envía un pedido a cocina. Contiene número de pedido, mesa, items con cantidades y notas especiales.

### 🧾 Recibo de venta
Se genera automáticamente al procesar un pago. Incluye desglose de items, método de pago, cambio (si es efectivo), y datos del cajero.

Ambos usan **CSS `@media print`** para que al imprimir se renderice solo el ticket, ocultando todo el resto de la UI.

---

## 🎨 Sistema de diseño

- **Tipografía:** Plus Jakarta Sans (Google Fonts)
- **Colores principales:**
  - Sidebar: `#0f172a` (slate-900)
  - Acento activo: `#f59e0b` (amber-500)
  - Success: `#10b981` (green-500)
  - Danger: `#ef4444` (red-500)
- **Iconos:** Lucide (consistencia visual en todo el sistema)
- **Bordes:** `rounded-xl` y `rounded-2xl` para una estética moderna
- **Spacing:** Uso intensivo del sistema 4/8/12/16 de Tailwind

---

## 🔄 Flujos de usuario destacados

### Mozo toma un pedido
/mesas → click en mesa libre → /pedidos/:id (editor)
→ Agrega items del menú
→ Click "Enviar a cocina"
→ Se imprime ticket automáticamente
→ KDS recibe el pedido en tiempo real

### Cajero cobra un pedido
/caja → "Abrir caja" con monto inicial
→ Ve lista de pedidos por cobrar
→ Click en pedido → modal de cobro
→ Selecciona método (efectivo/tarjeta/QR/mixto)
→ Ingresa monto, calcula cambio automáticamente
→ Confirma → Recibo se muestra y puede imprimirse
→ Mesa se libera y stock se descuenta automáticamente

### Super admin monitorea operación
/reportes → Selecciona rango de fechas
→ Ve KPIs: ventas totales, ticket promedio, tasa cancelación
→ Gráfico de evolución de ventas
→ Top 10 productos
→ Distribución por método de pago
→ Performance por cajero
→ Alertas de stock crítico

---

## 👨‍💻 Autor

**Cristian Garcia Alanis**

- GitHub: [@Cjga7](https://github.com/Cjga7)

---

## 📄 Licencia

Proyecto de portafolio de uso libre con fines educativos.