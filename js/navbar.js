// navbar.js - Control del navbar dinámico con manejo de usuario
class NavbarManager {
    constructor() {
        this.usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
        this.init();
    }

    init() {
        this.cargarNavbar();
        this.actualizarNavbarActivo();
        this.controlarVisibilidadCarrito();
        this.actualizarContadorCarrito();
        this.configurarEventosUsuario();
    }

    cargarNavbar() {
        const navbarHTML = this.generarNavbarHTML();
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    }

    generarNavbarHTML() {
        const esAdmin = this.usuarioActual && this.usuarioActual.rol === 'admin';
        
        return `
        <nav class="navbar navbar-expand-lg navbar-custom">
            <div class="container">
                <!-- Logo y nombre -->
                <a class="navbar-brand navbar-brand-custom" href="index.html">
                    <img src="assets/logo.jpeg" alt="CampoExpress Logo" height="30" 
                         onerror="this.innerHTML='🍅'">
                    CampoExpress
                </a>

                <!-- Botón hamburguesa -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Contenido del navbar -->
                <div class="collapse navbar-collapse" id="navbarMain">
                    <ul class="navbar-nav mx-auto navbar-nav-custom">
                        <li class="nav-item">
                            <a class="nav-link nav-link-custom" href="./index.html">
                                <i class="fas fa-home me-1"></i>Inicio
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link nav-link-custom" href="./tiendas.html">
                                <i class="fas fa-store me-1"></i>Tiendas
                            </a>
                        </li>
                        ${esAdmin ? `
                        <li class="nav-item">
                            <a class="nav-link nav-link-custom" href="./admin.html">
                                <i class="fas fa-cog me-1"></i>Administración
                            </a>
                        </li>
                        ` : ''}
                    </ul>

                    <!-- Sección derecha: Usuario/Carrito -->
                    <div class="navbar-nav">
                        ${this.generarMenuUsuario()}
                        <div id="navbarCarrito" class="nav-item" style="display: none;">
                            <a class="nav-link nav-link-custom position-relative" href="./carrito.html">
                                <i class="fas fa-shopping-cart"></i> Carrito
                                <span id="carritoCount" class="position-absolute top-0 start-100 translate-middle badge badge-custom rounded-pill">
                                    0
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>`;
    }

    generarMenuUsuario() {
        if (this.usuarioActual) {
            return `
            <div class="nav-item dropdown">
                <a class="nav-link nav-link-custom dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user me-1"></i> ${this.usuarioActual.nombre}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="./perfil.html">
                        <i class="fas fa-user-circle me-2"></i>Mi Perfil
                    </a></li>
                    ${this.usuarioActual.rol === 'admin' ? `
                    <li><a class="dropdown-item" href="./admin.html">
                        <i class="fas fa-cog me-2"></i>Panel Admin
                    </a></li>
                    ` : ''}
                    <li><a class="dropdown-item" href="./carrito.html">
                        <i class="fas fa-shopping-cart me-2"></i>Mi Carrito
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="navbarManager.cerrarSesion()">
                        <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                    </a></li>
                </ul>
            </div>`;
        } else {
            return `
            <a class="nav-link nav-link-custom" href="./login.html">
                <i class="fas fa-sign-in-alt me-1"></i>Iniciar Sesión
            </a>
            <a class="nav-link nav-link-custom" href="./register.html">
                <i class="fas fa-user-plus me-1"></i>Registrarse
            </a>`;
        }
    }

    actualizarNavbarActivo() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link-custom');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    controlarVisibilidadCarrito() {
        const navbarCarrito = document.getElementById('navbarCarrito');
        const currentPage = window.location.pathname.split('/').pop();
        
        // Mostrar carrito en tiendas.html, carrito.html y páginas relacionadas
        const paginasConCarrito = ['tiendas.html', 'carrito.html', 'productos.html'];
        if (navbarCarrito && paginasConCarrito.includes(currentPage)) {
            navbarCarrito.style.display = 'block';
        }
    }

    actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const carritoCounts = document.querySelectorAll('#carritoCount');
        
        carritoCounts.forEach(element => {
            element.textContent = totalItems;
            // Ocultar badge si no hay items
            if (totalItems === 0) {
                element.style.display = 'none';
            } else {
                element.style.display = 'flex';
            }
        });
    }

    configurarEventosUsuario() {
        // Actualizar automáticamente cuando cambie el usuario en localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'usuarioActual') {
                this.usuarioActual = JSON.parse(e.newValue);
                this.actualizarNavbarUsuario();
            }
        });
    }

    actualizarNavbarUsuario() {
        // Recrear el navbar cuando cambie el estado del usuario
        const navbarExistente = document.querySelector('.navbar-custom');
        if (navbarExistente) {
            navbarExistente.remove();
        }
        this.cargarNavbar();
        this.actualizarNavbarActivo();
        this.controlarVisibilidadCarrito();
        this.actualizarContadorCarrito();
    }

    cerrarSesion() {
        localStorage.removeItem('usuarioActual');
        this.usuarioActual = null;
        this.actualizarNavbarUsuario();
        window.location.href = './index.html';
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.navbarManager = new NavbarManager();
    
    // Actualizar contador cada 2 segundos (para cambios en otras pestañas)
    setInterval(() => {
        if (window.navbarManager) {
            window.navbarManager.actualizarContadorCarrito();
        }
    }, 2000);
});