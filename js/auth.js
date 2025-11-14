// auth.js - Manejo de autenticación y registro

// Base de datos simulada de usuarios
window.usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    { 
        id: 1, 
        email: "admin@campoexpress.com", 
        password: "admin123", 
        rol: "admin",
        nombre: "Administrador",
        apellido: "Sistema",
        telefono: "+57 300 000 0000",
        direccion: "Dirección administrativa",
        fechaRegistro: new Date().toISOString()
    }
];

// Usuario actual en sesión
window.usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;

// Función para registrar nuevo usuario
function registrarUsuario(usuarioData) {
    // Verificar si el usuario ya existe
    const usuarioExistente = window.usuarios.find(u => u.email === usuarioData.email);
    if (usuarioExistente) {
        return { success: false, message: "El correo electrónico ya está registrado" };
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
        id: Date.now(),
        ...usuarioData,
        fechaRegistro: new Date().toISOString(),
        rol: usuarioData.tipoUsuario || 'cliente'
    };

    window.usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(window.usuarios));
    
    return { success: true, message: "Usuario registrado exitosamente", usuario: nuevoUsuario };
}

// Función para iniciar sesión
// En la función iniciarSesion, después del login exitoso:
function iniciarSesion(email, password) {
    const usuario = window.usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        window.usuarioActual = usuario;
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        
        // Disparar evento de storage para actualizar navbar
        window.dispatchEvent(new Event('storage'));
        
        return { success: true, message: "Inicio de sesión exitoso", usuario };
    } else {
        return { success: false, message: "Credenciales incorrectas" };
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    window.usuarioActual = null;
    localStorage.removeItem('usuarioActual');
    window.location.href = './index.html';
}

// Validación de formularios
function validarFormularioRegistro(formData) {
    const errores = [];

    if (formData.password.length < 6) {
        errores.push("La contraseña debe tener al menos 6 caracteres");
    }

    if (formData.password !== formData.confirmPassword) {
        errores.push("Las contraseñas no coinciden");
    }

    if (!formData.terminos) {
        errores.push("Debes aceptar los términos y condiciones");
    }

    return errores;
}

// Manejo del formulario de registro
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            direccion: document.getElementById('direccion').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            tipoUsuario: document.querySelector('input[name="tipoUsuario"]:checked').value,
            terminos: document.getElementById('terminos').checked
        };

        // Validar formulario
        const errores = validarFormularioRegistro(formData);
        
        if (errores.length > 0) {
            alert(errores.join('\n'));
            return;
        }

        // Registrar usuario
        const resultado = registrarUsuario(formData);
        
        if (resultado.success) {
            alert(resultado.message);
            window.location.href = './login.html';
        } else {
            alert(resultado.message);
        }
    });
}

// Manejo del formulario de login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const resultado = iniciarSesion(email, password);
        
        if (resultado.success) {
            alert(resultado.message);
            
            // Redirigir según el rol
            if (resultado.usuario.rol === 'admin') {
                window.location.href = './admin.html';
            } else {
                window.location.href = './index.html';
            }
        } else {
            alert(resultado.message);
        }
    });
}

// Verificar autenticación al cargar la página
function verificarAutenticacion() {
    if (window.usuarioActual) {
        console.log('Usuario autenticado:', window.usuarioActual.nombre);
        
        // Actualizar navbar si existe
        const navbarUser = document.getElementById('navbarUser');
        if (navbarUser) {
            navbarUser.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-success dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        👤 ${window.usuarioActual.nombre}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="./perfil.html">Mi Perfil</a></li>
                        <li><a class="dropdown-item" href="./carrito.html">🛒 Carrito</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="cerrarSesion()">Cerrar Sesión</a></li>
                    </ul>
                </div>
            `;
        }
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
});