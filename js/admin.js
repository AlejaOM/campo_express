// admin.js - Funcionalidad del panel de administración

class AdminManager {
    constructor() {
        this.tiendas = window.tiendas || [];
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        this.pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        this.init();
    }

    init() {
        this.actualizarFecha();
        this.cargarEstadisticas();
        this.cargarTiendas();
        this.cargarPedidos();
        this.cargarProductos();
        this.cargarUsuarios();
        this.cargarActividadReciente();
        this.inicializarGraficos();
    }

    actualizarFecha() {
        const fecha = new Date();
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('fechaActual').textContent = fecha.toLocaleDateString('es-ES', opciones);
    }

    cargarEstadisticas() {
        // Estadísticas de tiendas
        document.getElementById('totalTiendas').textContent = this.tiendas.length;
        
        // Estadísticas de pedidos (simulados)
        const pedidosHoy = Math.floor(Math.random() * 20) + 5;
        document.getElementById('pedidosHoy').textContent = pedidosHoy;
        document.getElementById('pedidosPendientes').textContent = Math.floor(pedidosHoy * 0.3);
        
        // Ingresos mensuales (simulados)
        const ingresos = (Math.random() * 10000 + 5000).toFixed(2);
        document.getElementById('ingresosMensuales').textContent = parseFloat(ingresos).toLocaleString();
        
        // Usuarios activos
        const usuariosActivos = this.usuarios.length;
        document.getElementById('usuariosActivos').textContent = usuariosActivos;
    }

    cargarTiendas() {
        const tabla = document.getElementById('tabla-tiendas');
        if (!tabla) return;

        tabla.innerHTML = this.tiendas.map(tienda => `
            <tr>
                <td>${tienda.id}</td>
                <td>
                    <strong>${tienda.nombre}</strong>
                </td>
                <td>
                    <span class="badge badge-custom">${tienda.productos.length} productos</span>
                </td>
                <td>
                    <span class="status-badge status-active">Activa</span>
                </td>
                <td>
                    <strong>$${(Math.random() * 5000 + 1000).toFixed(2)}</strong>
                </td>
                <td>${this.formatearFecha(new Date())}</td>
                <td>
                    <button class="action-btn btn-view" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    cargarPedidos() {
        const tabla = document.getElementById('tabla-pedidos');
        if (!tabla) return;

        // Generar pedidos simulados
        const pedidosSimulados = this.generarPedidosSimulados(15);
        
        tabla.innerHTML = pedidosSimulados.map(pedido => `
            <tr>
                <td>
                    <strong>#${pedido.id}</strong>
                </td>
                <td>${pedido.cliente}</td>
                <td>${pedido.tienda}</td>
                <td>
                    <strong>$${pedido.total.toLocaleString()}</strong>
                </td>
                <td>
                    <span class="status-badge ${pedido.estado === 'completado' ? 'status-active' : 'status-pending'}">
                        ${pedido.estado === 'completado' ? 'Completado' : 'Pendiente'}
                    </span>
                </td>
                <td>${pedido.fecha}</td>
                <td>
                    <button class="action-btn btn-view" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" title="Editar Estado">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    cargarProductos() {
        const tabla = document.getElementById('tabla-productos');
        if (!tabla) return;

        // Obtener todos los productos de todas las tiendas
        const todosProductos = [];
        this.tiendas.forEach(tienda => {
            tienda.productos.forEach(producto => {
                todosProductos.push({
                    ...producto,
                    tienda: tienda.nombre
                });
            });
        });

        tabla.innerHTML = todosProductos.slice(0, 20).map(producto => `
            <tr>
                <td>${producto.id}</td>
                <td>
                    <img src="${producto.imagen}" alt="${producto.nombre}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiBkeT0iLjNlbSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZDwvdGV4dD48L3N2Zz4='">
                </td>
                <td>
                    <strong>${producto.nombre}</strong>
                </td>
                <td>${producto.tienda}</td>
                <td>
                    <strong>$${producto.precio.toLocaleString()}</strong>
                </td>
                <td>
                    <span class="badge ${Math.random() > 0.3 ? 'badge-custom' : 'bg-warning'}">
                        ${Math.random() > 0.3 ? 'En stock' : 'Stock bajo'}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-active">Activo</span>
                </td>
                <td>
                    <button class="action-btn btn-view" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    cargarUsuarios() {
        const tabla = document.getElementById('tabla-usuarios');
        if (!tabla) return;

        // Si no hay usuarios en localStorage, crear algunos de ejemplo
        if (this.usuarios.length === 0) {
            this.usuarios = [
                { id: 1, nombre: 'Admin Principal', email: 'admin@campoexpress.com', tipo: 'Administrador', estado: 'Activo', registro: '2024-01-15' },
                { id: 2, nombre: 'Juan Pérez', email: 'juan@cliente.com', tipo: 'Cliente', estado: 'Activo', registro: '2024-02-20' },
                { id: 3, nombre: 'María García', email: 'maria@vendedor.com', tipo: 'Vendedor', estado: 'Activo', registro: '2024-03-10' }
            ];
        }

        tabla.innerHTML = this.usuarios.map(usuario => `
            <tr>
                <td>${usuario.id}</td>
                <td>
                    <strong>${usuario.nombre}</strong>
                </td>
                <td>${usuario.email}</td>
                <td>
                    <span class="badge ${usuario.tipo === 'Administrador' ? 'bg-danger' : usuario.tipo === 'Vendedor' ? 'bg-warning' : 'badge-custom'}">
                        ${usuario.tipo}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-active">${usuario.estado}</span>
                </td>
                <td>${usuario.registro}</td>
                <td>
                    <button class="action-btn btn-view" title="Ver Perfil">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" title="Desactivar">
                        <i class="fas fa-user-slash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    cargarActividadReciente() {
        const actividades = [
            { tipo: 'pedido', mensaje: 'Nuevo pedido #00125 recibido', tiempo: 'Hace 5 min' },
            { tipo: 'usuario', mensaje: 'Nuevo usuario registrado: Carlos López', tiempo: 'Hace 15 min' },
            { tipo: 'producto', mensaje: 'Producto "Manzanas" actualizado', tiempo: 'Hace 30 min' },
            { tipo: 'tienda', mensaje: 'Tienda "Verdulería Doña María" agregó nuevos productos', tiempo: 'Hace 1 hora' },
            { tipo: 'pedido', mensaje: 'Pedido #00124 completado', tiempo: 'Hace 2 horas' }
        ];

        const contenedor = document.getElementById('actividadReciente');
        if (!contenedor) return;

        contenedor.innerHTML = actividades.map(actividad => `
            <div class="activity-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <p class="mb-1">${actividad.mensaje}</p>
                        <small class="text-muted">${actividad.tiempo}</small>
                    </div>
                    <span class="badge ${this.getBadgeColor(actividad.tipo)}">
                        ${this.getTipoTexto(actividad.tipo)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    getBadgeColor(tipo) {
        const colores = {
            pedido: 'bg-primary',
            usuario: 'bg-success',
            producto: 'bg-warning',
            tienda: 'bg-info'
        };
        return colores[tipo] || 'bg-secondary';
    }

    getTipoTexto(tipo) {
        const textos = {
            pedido: 'Pedido',
            usuario: 'Usuario',
            producto: 'Producto',
            tienda: 'Tienda'
        };
        return textos[tipo] || 'Sistema';
    }

    generarPedidosSimulados(cantidad) {
        const clientes = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Rodríguez'];
        const estados = ['pendiente', 'completado'];
        
        return Array.from({ length: cantidad }, (_, i) => ({
            id: String(1000 + i).padStart(5, '0'),
            cliente: clientes[Math.floor(Math.random() * clientes.length)],
            tienda: this.tiendas[Math.floor(Math.random() * this.tiendas.length)]?.nombre || 'Tienda General',
            total: Math.floor(Math.random() * 50000) + 10000,
            estado: estados[Math.floor(Math.random() * estados.length)],
            fecha: this.formatearFecha(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
        }));
    }

    formatearFecha(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    inicializarGraficos() {
        // Gráfico de ventas
        this.inicializarGraficoVentas();
        
        // Gráfico de productos más vendidos
        this.inicializarGraficoProductos();
        
        // Gráfico de distribución por tienda
        this.inicializarGraficoTiendas();
    }

    inicializarGraficoVentas() {
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Ventas ($)',
                    data: [120000, 190000, 150000, 210000, 180000, 250000, 220000],
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    inicializarGraficoProductos() {
        const ctx = document.getElementById('topProductsChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Manzanas', 'Plátanos', 'Tomates', 'Lechugas', 'Zanahorias'],
                datasets: [{
                    label: 'Unidades Vendidas',
                    data: [65, 59, 80, 81, 56],
                    backgroundColor: [
                        'rgba(46, 125, 50, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(139, 195, 74, 0.8)',
                        'rgba(205, 220, 57, 0.8)',
                        'rgba(255, 193, 7, 0.8)'
                    ],
                    borderColor: [
                        '#2e7d32',
                        '#4caf50',
                        '#8bc34a',
                        '#cddc39',
                        '#ffc107'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    inicializarGraficoTiendas() {
        const ctx = document.getElementById('storesChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.tiendas.map(t => t.nombre),
                datasets: [{
                    data: this.tiendas.map(() => Math.floor(Math.random() * 100) + 20),
                    backgroundColor: [
                        '#2e7d32',
                        '#4caf50',
                        '#8bc34a',
                        '#cddc39',
                        '#ffc107',
                        '#ff9800',
                        '#f44336'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.adminManager = new AdminManager();
});