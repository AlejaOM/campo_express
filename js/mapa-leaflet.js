// mapa-leaflet.js - Gestión de mapas con Leaflet (alternativa gratuita)
class MapaManager {
    constructor(tiendas) {
        this.tiendas = tiendas;
        this.mapa = null;
        this.marcadores = [];
        this.ubicacionUsuario = null;
        this.marcadorUsuario = null;
        this.inicializado = false;
        this.capaTiendas = null;
        
        // Asignar coordenadas aleatorias a las tiendas si no las tienen
        this.asignarCoordenadasAleatorias();
    }

    asignarCoordenadasAleatorias() {
        // Coordenadas base (ejemplo: Bogotá, Colombia)
        const baseLat = 4.710989;
        const baseLng = -74.072092;
        const radio = 0.05; // Radio en grados (aproximadamente 5km)

        this.tiendas.forEach(tienda => {
            if (!tienda.coordenadas) {
                // Generar coordenadas aleatorias dentro del radio
                const lat = baseLat + (Math.random() - 0.5) * radio;
                const lng = baseLng + (Math.random() - 0.5) * radio;
                tienda.coordenadas = [lat, lng];
            }
            
            // Calcular distancia si tenemos ubicación del usuario
            if (this.ubicacionUsuario && tienda.coordenadas) {
                tienda.distancia = this.calcularDistancia(
                    this.ubicacionUsuario[0],
                    this.ubicacionUsuario[1],
                    tienda.coordenadas[0],
                    tienda.coordenadas[1]
                ).toFixed(1);
            }
        });
    }

    async inicializarMapa() {
        if (this.inicializado && this.mapa) {
            return true;
        }

        try {
            // Crear el mapa centrado en Bogotá
            this.mapa = L.map('map').setView([4.710989, -74.072092], 12);

            // Agregar capa de tiles de OpenStreetMap (gratuita)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.mapa);

            // Agregar capa de satélite opcional
            L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenTopoMap',
                maxZoom: 17
            }).addTo(this.mapa);

            this.inicializado = true;
            return true;
        } catch (error) {
            console.error('Error inicializando el mapa:', error);
            this.mostrarError('No se pudo cargar el mapa. Verifica tu conexión.');
            return false;
        }
    }

    async obtenerUbicacionUsuario() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no soportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.ubicacionUsuario = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    resolve(this.ubicacionUsuario);
                },
                (error) => {
                    let mensaje = 'No se pudo obtener tu ubicación. ';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            mensaje += 'Permiso de ubicación denegado.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            mensaje += 'Ubicación no disponible.';
                            break;
                        case error.TIMEOUT:
                            mensaje += 'Tiempo de espera agotado.';
                            break;
                        default:
                            mensaje += 'Error desconocido.';
                    }
                    reject(new Error(mensaje));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    async centrarEnUbicacion() {
        try {
            await this.obtenerUbicacionUsuario();
            
            if (this.ubicacionUsuario) {
                this.mapa.setView(this.ubicacionUsuario, 14);
                
                // Agregar marcador de usuario
                if (this.marcadorUsuario) {
                    this.mapa.removeLayer(this.marcadorUsuario);
                }
                
                // Crear ícono personalizado para el usuario
                const iconoUsuario = L.divIcon({
                    className: 'user-location-marker',
                    html: `
                        <div style="
                            background: #2e7d32; 
                            border: 3px solid white; 
                            border-radius: 50%; 
                            width: 20px; 
                            height: 20px; 
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        "></div>
                    `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                this.marcadorUsuario = L.marker(this.ubicacionUsuario, { 
                    icon: iconoUsuario 
                }).addTo(this.mapa)
                  .bindPopup('Tu ubicación actual')
                  .openPopup();

                // Recalcular distancias
                this.tiendas.forEach(tienda => {
                    if (tienda.coordenadas) {
                        tienda.distancia = this.calcularDistancia(
                            this.ubicacionUsuario[0],
                            this.ubicacionUsuario[1],
                            tienda.coordenadas[0],
                            tienda.coordenadas[1]
                        ).toFixed(1);
                    }
                });

                this.mostrarMensaje('Ubicación encontrada correctamente', 'success');
            }
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    mostrarTodasTiendas() {
        this.limpiarMarcadores();
        document.getElementById('mapaTitulo').textContent = 'Todas las Tiendas';

        // Crear un grupo para las tiendas
        this.capaTiendas = L.layerGroup().addTo(this.mapa);

        this.tiendas.forEach(tienda => {
            this.agregarMarcadorTienda(tienda);
        });

        // Ajustar el zoom para mostrar todas las tiendas
        if (this.tiendas.length > 0) {
            const group = new L.featureGroup(this.marcadores);
            this.mapa.fitBounds(group.getBounds().pad(0.1));
        }
    }

    mostrarTiendaEspecifica(tienda) {
        this.limpiarMarcadores();
        document.getElementById('mapaTitulo').textContent = `Ubicación: ${tienda.nombre}`;

        if (tienda.coordenadas) {
            this.agregarMarcadorTienda(tienda, true);
            this.mapa.setView(tienda.coordenadas, 15);
        }

        // Si tenemos ubicación del usuario, mostrarla también
        if (this.ubicacionUsuario) {
            const iconoUsuario = L.divIcon({
                className: 'user-location-marker',
                html: `
                    <div style="
                        background: #2e7d32; 
                        border: 3px solid white; 
                        border-radius: 50%; 
                        width: 20px; 
                        height: 20px; 
                        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    "></div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            this.marcadorUsuario = L.marker(this.ubicacionUsuario, { 
                icon: iconoUsuario 
            }).addTo(this.mapa)
              .bindPopup('Tu ubicación actual');
        }
    }

    agregarMarcadorTienda(tienda, destacado = false) {
        if (!tienda.coordenadas) return;

        // Crear ícono personalizado para las tiendas
        const color = destacado ? '#ff6b35' : '#2e7d32';
        const iconoTienda = L.divIcon({
            className: 'store-marker',
            html: `
                <div style="
                    background: ${color}; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    width: 30px; 
                    height: 30px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    color: white;
                    font-size: 14px;
                ">🛒</div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marcador = L.marker(tienda.coordenadas, { 
            icon: iconoTienda 
        }).addTo(this.capaTiendas || this.mapa);

        const popupContent = `
            <div class="custom-popup">
                <h6>${tienda.nombre}</h6>
                <p><i class="fas fa-boxes"></i> ${tienda.productos.length} productos disponibles</p>
                ${tienda.distancia ? `<p><i class="fas fa-location-arrow"></i> A ${tienda.distancia} km</p>` : ''}
                <button class="btn btn-sm btn-custom mt-2" onclick="verProductosDeTienda(${tienda.id})">
                    <i class="fas fa-eye me-1"></i>Ver Productos
                </button>
            </div>
        `;

        marcador.bindPopup(popupContent);
        
        // Abrir popup automáticamente si es tienda específica
        if (destacado) {
            marcador.openPopup();
        }

        this.marcadores.push(marcador);
    }

    limpiarMarcadores() {
        // Limpiar marcadores de tiendas
        this.marcadores.forEach(marcador => {
            if (this.capaTiendas) {
                this.capaTiendas.removeLayer(marcador);
            } else {
                this.mapa.removeLayer(marcador);
            }
        });
        this.marcadores = [];

        // Limpiar marcador de usuario
        if (this.marcadorUsuario) {
            this.mapa.removeLayer(this.marcadorUsuario);
            this.marcadorUsuario = null;
        }

        // Limpiar capa de tiendas
        if (this.capaTiendas) {
            this.mapa.removeLayer(this.capaTiendas);
            this.capaTiendas = null;
        }
    }

    calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(grados) {
        return grados * (Math.PI/180);
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${tipo} border-0`;
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
        new bootstrap.Toast(toast).show();
        setTimeout(() => toast.remove(), 5000);
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'warning');
    }
}

// Función global para ver productos desde el popup del mapa
function verProductosDeTienda(tiendaId) {
    const app = document.querySelector('#app').__vue_app__;
    if (app) {
        app._instance.proxy.verTienda(tiendaId);
        
        // Cerrar modal del mapa
        const mapaModal = bootstrap.Modal.getInstance(document.getElementById('mapaModal'));
        if (mapaModal) {
            mapaModal.hide();
        }
    }
}

// Estilos CSS adicionales para los marcadores
const style = document.createElement('style');
style.textContent = `
    .user-location-marker {
        background: transparent !important;
        border: none !important;
    }
    .store-marker {
        background: transparent !important;
        border: none !important;
    }
    .leaflet-popup-content-wrapper {
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .leaflet-popup-tip {
        background: white;
    }
`;
document.head.appendChild(style);