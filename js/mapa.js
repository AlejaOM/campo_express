// mapa.js - Gestión de Google Maps y geolocalización
class MapaManager {
    constructor(tiendas) {
        this.tiendas = tiendas;
        this.mapa = null;
        this.marcadores = [];
        this.ubicacionUsuario = null;
        this.marcadorUsuario = null;
        this.inicializado = false;
        
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
                tienda.coordenadas = { lat, lng };
            }
            
            // Calcular distancia si tenemos ubicación del usuario
            if (this.ubicacionUsuario && tienda.coordenadas) {
                tienda.distancia = this.calcularDistancia(
                    this.ubicacionUsuario.lat,
                    this.ubicacionUsuario.lng,
                    tienda.coordenadas.lat,
                    tienda.coordenadas.lng
                ).toFixed(1);
            }
        });
    }

    async inicializarMapa() {
        if (this.inicializado && this.mapa) {
            return true;
        }

        try {
            // Crear el mapa
            this.mapa = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: { lat: 4.710989, lng: -74.072092 }, // Bogotá por defecto
                styles: this.getMapStyles(),
                mapTypeControl: false,
                streetViewControl: false
            });

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
                    this.ubicacionUsuario = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
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
                this.mapa.setCenter(this.ubicacionUsuario);
                this.mapa.setZoom(14);
                
                // Agregar marcador de usuario
                if (this.marcadorUsuario) {
                    this.marcadorUsuario.setMap(null);
                }
                
                this.marcadorUsuario = new google.maps.Marker({
                    position: this.ubicacionUsuario,
                    map: this.mapa,
                    title: 'Tu ubicación',
                    icon: {
                        url: 'data:image/svg+xml;base64,' + btoa(`
                            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="8" fill="#2e7d32" stroke="white" stroke-width="2"/>
                                <circle cx="16" cy="16" r="3" fill="white"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(32, 32),
                        anchor: new google.maps.Point(16, 16)
                    }
                });

                // Recalcular distancias
                this.tiendas.forEach(tienda => {
                    if (tienda.coordenadas) {
                        tienda.distancia = this.calcularDistancia(
                            this.ubicacionUsuario.lat,
                            this.ubicacionUsuario.lng,
                            tienda.coordenadas.lat,
                            tienda.coordenadas.lng
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

        this.tiendas.forEach(tienda => {
            this.agregarMarcadorTienda(tienda);
        });

        // Ajustar el zoom para mostrar todas las tiendas
        if (this.tiendas.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            this.tiendas.forEach(tienda => {
                if (tienda.coordenadas) {
                    bounds.extend(tienda.coordenadas);
                }
            });
            if (this.ubicacionUsuario) {
                bounds.extend(this.ubicacionUsuario);
            }
            this.mapa.fitBounds(bounds);
        }
    }

    mostrarTiendaEspecifica(tienda) {
        this.limpiarMarcadores();
        document.getElementById('mapaTitulo').textContent = `Ubicación: ${tienda.nombre}`;

        if (tienda.coordenadas) {
            this.agregarMarcadorTienda(tienda, true);
            this.mapa.setCenter(tienda.coordenadas);
            this.mapa.setZoom(15);
        }

        // Si tenemos ubicación del usuario, mostrarla también
        if (this.ubicacionUsuario) {
            this.marcadorUsuario = new google.maps.Marker({
                position: this.ubicacionUsuario,
                map: this.mapa,
                title: 'Tu ubicación',
                icon: {
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="8" fill="#2e7d32" stroke="white" stroke-width="2"/>
                            <circle cx="16" cy="16" r="3" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32),
                    anchor: new google.maps.Point(16, 16)
                }
            });
        }
    }

    agregarMarcadorTienda(tienda, destacado = false) {
        if (!tienda.coordenadas) return;

        const marcador = new google.maps.Marker({
            position: tienda.coordenadas,
            map: this.mapa,
            title: tienda.nombre,
            icon: {
                url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="${destacado ? '#ff6b35' : '#2e7d32'}" stroke="white" stroke-width="2"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🛒</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="p-2">
                    <h6 class="mb-1">${tienda.nombre}</h6>
                    <p class="mb-1 small">${tienda.productos.length} productos disponibles</p>
                    ${tienda.distancia ? `<p class="mb-0 small text-muted">A ${tienda.distancia} km</p>` : ''}
                </div>
            `
        });

        marcador.addListener('click', () => {
            infoWindow.open(this.mapa, marcador);
        });

        this.marcadores.push(marcador);
    }

    limpiarMarcadores() {
        this.marcadores.forEach(marcador => {
            marcador.setMap(null);
        });
        this.marcadores = [];

        if (this.marcadorUsuario) {
            this.marcadorUsuario.setMap(null);
            this.marcadorUsuario = null;
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

    getMapStyles() {
        return [
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{"weight": "2.00"}]
            },
            {
                "featureType": "all",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#9c9c9c"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [{"color": "#7c7c7c"}]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{"color": "#f2f2f2"}]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [{"saturation": -100}, {"lightness": 45}]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#eeeeee"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#7b7b7b"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [{"visibility": "simplified"}]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#c8d7d4"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#070707"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ffffff"}]
            }
        ];
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