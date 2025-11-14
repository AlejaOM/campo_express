// carrito.js - Funcionalidad completa del carrito CORREGIDA

class CarritoManager {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.cupones = {
            'FRESCURA10': 0.10,
            'VERDURAS20': 0.20,
            'BIENVENIDO15': 0.15
        };
        this.cuponAplicado = null;
        this.init();
    }

    init() {
        console.log('Inicializando CarritoManager. Productos en carrito:', this.carrito.length);
        this.actualizarVista();
        this.actualizarContadorNav();
        this.configurarEventos();
    }

    configurarEventos() {
        const btnProcesar = document.getElementById('procesarPedido');
        if (btnProcesar) {
            btnProcesar.addEventListener('click', () => {
                this.procesarPedido();
            });
        }

        const inputCupon = document.getElementById('cupon');
        if (inputCupon) {
            inputCupon.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.aplicarCupon();
                }
            });
        }
    }

    actualizarVista() {
        this.actualizarListaCarrito();
        this.actualizarResumen();
        this.actualizarEstadoCarrito();
    }

    actualizarListaCarrito() {
        const listaCarrito = document.getElementById('listaCarrito');
        if (!listaCarrito) return;
        
        console.log('Actualizando lista del carrito:', this.carrito);

        if (this.carrito.length === 0) {
            listaCarrito.innerHTML = '';
            return;
        }

        listaCarrito.innerHTML = this.carrito.map(item => `
            <div class="card cart-item mb-3" data-id="${item.idCarrito}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.imagen}" alt="${item.nombre}" 
                                 class="img-fluid rounded" style="height: 80px; object-fit: cover;"
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiBkeT0iLjNlbSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZHVjdG88L3RleHQ+PC9zdmc+'">
                            
                        </div>
                        <div class="col-md-4">
                            <h6 class="card-title mb-1">${item.nombre}</h6>
                            <small class="text-muted">${item.tiendaNombre || 'Verdulería Doña María'}</small>
                        </div>
                        <div class="col-md-2">
                            <span class="fw-bold text-success">$${item.precio.toLocaleString()}</span>
                        </div>
                        <div class="col-md-3">
                            <div class="d-flex align-items-center">
                                <button class="quantity-btn" onclick="window.carritoManager.cambiarCantidad('${item.idCarrito}', -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${item.cantidad}" 
                                       min="1" onchange="window.carritoManager.actualizarCantidadInput('${item.idCarrito}', this.value)">
                                <button class="quantity-btn" onclick="window.carritoManager.cambiarCantidad('${item.idCarrito}', 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-1 text-center">
                            <button class="delete-btn" onclick="window.carritoManager.eliminarProducto('${item.idCarrito}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12 text-end">
                            <strong>Subtotal: $${(item.precio * item.cantidad).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    actualizarResumen() {
        const subtotal = this.calcularSubtotal();
        const descuento = this.calcularDescuento(subtotal);
        const envio = subtotal > 50000 ? 0 : 5000;
        const total = subtotal - descuento + envio;

        console.log('Calculando resumen - Subtotal:', subtotal, 'Descuento:', descuento, 'Total:', total);

        // Actualizar la UI
        const subtotalElement = document.getElementById('subtotal');
        const envioElement = document.getElementById('envio');
        const descuentoElement = document.getElementById('descuento');
        const totalElement = document.getElementById('total');

        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
        if (envioElement) envioElement.textContent = envio === 0 ? 'Gratis' : `$${envio.toLocaleString()}`;
        if (descuentoElement) descuentoElement.textContent = `-$${descuento.toLocaleString()}`;
        if (totalElement) totalElement.textContent = `$${total.toLocaleString()}`;

        // Habilitar/deshabilitar botón de procesar pedido
        const btnProcesar = document.getElementById('procesarPedido');
        if (btnProcesar) {
            btnProcesar.disabled = this.carrito.length === 0;
        }
    }

    calcularSubtotal() {
        return this.carrito.reduce((total, item) => {
            const itemTotal = Number(item.precio) * Number(item.cantidad);
            console.log(`Producto: ${item.nombre}, Precio: ${item.precio}, Cantidad: ${item.cantidad}, Subtotal: ${itemTotal}`);
            return total + itemTotal;
        }, 0);
    }

    calcularDescuento(subtotal) {
        if (!this.cuponAplicado) return 0;
        return subtotal * this.cuponAplicado.descuento;
    }

    actualizarEstadoCarrito() {
        const carritoVacio = document.getElementById('carritoVacio');
        const listaCarrito = document.getElementById('listaCarrito');

        if (this.carrito.length === 0) {
            if (carritoVacio) carritoVacio.style.display = 'block';
            if (listaCarrito) listaCarrito.style.display = 'none';
        } else {
            if (carritoVacio) carritoVacio.style.display = 'none';
            if (listaCarrito) listaCarrito.style.display = 'block';
        }
    }

    cambiarCantidad(idCarrito, cambio) {
        console.log('Cambiando cantidad para:', idCarrito, 'Cambio:', cambio);
        
        const itemIndex = this.carrito.findIndex(item => item.idCarrito == idCarrito);
        if (itemIndex === -1) return;

        this.carrito[itemIndex].cantidad += cambio;
        
        if (this.carrito[itemIndex].cantidad < 1) {
            this.eliminarProducto(idCarrito);
        } else {
            this.guardarCarrito();
            this.actualizarVista();
        }
    }

    actualizarCantidadInput(idCarrito, nuevaCantidad) {
        console.log('Actualizando cantidad input:', idCarrito, 'Nueva cantidad:', nuevaCantidad);
        
        const cantidad = parseInt(nuevaCantidad);
        if (isNaN(cantidad) || cantidad < 1) return;

        const itemIndex = this.carrito.findIndex(item => item.idCarrito == idCarrito);
        if (itemIndex !== -1) {
            this.carrito[itemIndex].cantidad = cantidad;
            this.guardarCarrito();
            this.actualizarVista();
        }
    }

    eliminarProducto(idCarrito) {
        console.log('Eliminando producto:', idCarrito);
        
        this.carrito = this.carrito.filter(item => item.idCarrito != idCarrito);
        this.guardarCarrito();
        this.actualizarVista();
        
        this.mostrarMensaje('Producto eliminado del carrito', 'warning');
    }

    aplicarCupon() {
        const inputCupon = document.getElementById('cupon');
        const codigo = inputCupon.value.trim().toUpperCase();
        const mensajeCupon = document.getElementById('mensajeCupon');

        if (this.cupones[codigo]) {
            this.cuponAplicado = {
                codigo: codigo,
                descuento: this.cupones[codigo]
            };
            if (mensajeCupon) {
                mensajeCupon.innerHTML = `<span class="text-success"><i class="fas fa-check"></i> Cupón aplicado: ${(this.cupones[codigo] * 100)}% de descuento</span>`;
            }
            this.mostrarMensaje(`¡Cupón ${codigo} aplicado correctamente!`, 'success');
        } else {
            this.cuponAplicado = null;
            if (mensajeCupon) {
                mensajeCupon.innerHTML = `<span class="text-danger"><i class="fas fa-times"></i> Código de cupón inválido</span>`;
            }
        }

        this.actualizarResumen();
    }

    procesarPedido() {
        if (this.carrito.length === 0) {
            this.mostrarMensaje('Tu carrito está vacío', 'warning');
            return;
        }

        const numeroPedido = 'CE' + Date.now().toString().slice(-6);
        const numeroPedidoElement = document.getElementById('numeroPedido');
        if (numeroPedidoElement) {
            numeroPedidoElement.textContent = numeroPedido;
        }

        const modal = new bootstrap.Modal(document.getElementById('confirmacionModal'));
        modal.show();

        this.limpiarCarrito();
    }

    limpiarCarrito() {
        this.carrito = [];
        this.cuponAplicado = null;
        this.guardarCarrito();
        this.actualizarVista();
        
        const cuponInput = document.getElementById('cupon');
        const mensajeCupon = document.getElementById('mensajeCupon');
        if (cuponInput) cuponInput.value = '';
        if (mensajeCupon) mensajeCupon.innerHTML = '';
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        this.actualizarContadorNav();
    }

    actualizarContadorNav() {
        const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const carritoCounts = document.querySelectorAll('#carritoCount');
        
        carritoCounts.forEach(element => {
            element.textContent = totalItems;
        });
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        const toastContainer = document.getElementById('toastContainer') || this.crearToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${tipo === 'success' ? 'success' : tipo === 'warning' ? 'warning' : 'info'} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${tipo === 'success' ? 'check' : tipo === 'warning' ? 'exclamation' : 'info'}-circle me-2"></i>
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    crearToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
        return container;
    }
}

// Función global para agregar productos al carrito
function agregarAlCarrito(producto, tiendaNombre) {
    // Asegurarnos de que el carritoManager esté inicializado
    if (!window.carritoManager) {
        window.carritoManager = new CarritoManager();
    }

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Buscar si el producto ya existe en el carrito
    const productoExistenteIndex = carrito.findIndex(item => 
        item.id === producto.id && item.tiendaNombre === tiendaNombre
    );

    if (productoExistenteIndex !== -1) {
        // Producto existe, incrementar cantidad
        carrito[productoExistenteIndex].cantidad += 1;
    } else {
        // Producto nuevo, agregar al carrito
        carrito.push({
            ...producto,
            cantidad: 1,
            idCarrito: Date.now() + Math.random().toString(36).substr(2, 9),
            tiendaNombre: tiendaNombre
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar el carrito manager
    if (window.carritoManager) {
        window.carritoManager.carrito = carrito;
        window.carritoManager.actualizarVista();
    }
    
    // Mostrar mensaje
    if (window.carritoManager) {
        window.carritoManager.mostrarMensaje(`✅ ${producto.nombre} agregado al carrito`, 'success');
    }
}

// Inicializar el carrito manager cuando se carga la página del carrito
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar en páginas que tengan el carrito
    if (document.getElementById('listaCarrito')) {
        window.carritoManager = new CarritoManager();
    }
    
    // Actualizar contador en todas las páginas
    actualizarContadorCarrito();
});

// Función para actualizar contador del carrito en el navbar
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const carritoCounts = document.querySelectorAll('#carritoCount');
    
    carritoCounts.forEach(element => {
        element.textContent = totalItems;
    });
}