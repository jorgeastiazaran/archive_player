# Especificación Funcional y de Producto — Archive Player

## 1. Visión del Producto
**Archive Player** es una aplicación multimedia abierta (estilo Spotify + MUBI/Criterion para dominio público) que conecta al usuario con el patrimonio sonoro y audiovisual libre de la humanidad (Internet Archive, Free Music Archive, Musopen, Open Music Archive, Public Domain Movies, etc.) bajo una experiencia de usuario moderna, rápida e inteligente.

* **Fase 1 (Actual):** Prototipo Web / PWA responsivo (Desktop + Mobile view) sin necesidad de backend propio, enfocado en validar la experiencia de usuario (UX), el descubrimiento mediante IA y la reproducción/descarga local.
* **Fase 2 (Objetivo Final):** Aplicación móvil nativa/híbrida (**Android & iOS**) y plataforma multiusuario con cuentas, playlists colaborativas/públicas y motor de recomendación social.

---

## 2. Módulos y Funcionalidades de la Fase 1 (Prototipo UX)

### 2.1. Exploración y Organización del Catálogo
1. **Organización Jerárquica:**
   * **Por Artista / Creador:** Vista de perfil del artista o director con su biografía breve, época y obras disponibles.
   * **Por Álbum / Obra / Colección:** Agrupación lógica de pistas de un álbum, grabación histórica o película completa.
   * **Filtro Multimedia:** Pestañas rápidas para alternar entre **Todo**, **Música/Audio** (Clásica, Jazz 78rpm, Indie/FMA, Paisajes sonoros) y **Video/Cine** (Cine Mudo, Noir, Animación Clásica, Documentales).
2. **Buscador en Vivo (Internet Archive API + Catálogo Curado):**
   * Búsqueda instantánea por título, artista, década o género conectada en tiempo real a `archive.org`, respaldada por una selección curada de alta calidad para carga inmediata.

### 2.2. Generador de Playlists con IA (Función Estrella)
Un asistente interactivo donde el usuario puede generar listas de reproducción personalizadas combinando parámetros contextuales:
* **Parámetros de entrada:**
  * **Época / Década:** Años 1900–1920 (Era acústica/78rpm), 1930–1940 (Swing/Jazz/Edad de Oro), 1950–1960 (Rock & Roll, Cine Noir/Sci-Fi), Clásica/Barroca/Romántica, o Contemporánea Creative Commons (FMA).
  * **Género / Tipo de Artista:** Clásica, Jazz, Blues, Folk, Experimental/Ambient, Cine Silente, Animación Vintage.
  * **Ubicación / Clima / Estado de Ánimo:** Detectado o elegido por el usuario (ej. *"Tarde lluviosa en Ciudad de México"*, *"Noche de estudio enfocada"*, *"Viaje nocturno por carretera"*).
  * **Prompt libre opcional:** Ej. *"Música de piano melancólica del siglo XIX y grabaciones de jazz de los años 20"*.
* **Resultado:**
  * Título creativo y descripción generados para la playlist.
  * Selección automática de pistas/videos reales reproducibles.
  * Explicación breve de por qué cada obra encaja con el contexto solicitado.
  * Botón para **Guardar en Mis Playlists** o **Reproducir todo**.

### 2.3. Reproductor Unificado Audio + Video
Un reproductor persistente en la parte inferior (en móvil se expande a pantalla completa al tocarlo, igual que Spotify):
* **Controles estándar:** Play/Pause, Anterior/Siguiente, Barra de progreso con búsqueda (seek), Control de volumen, Aleatorio (Shuffle) y Repetir (Repeat).
* **Soporte Dual Audio/Video:**
  * Si el ítem actual es **Audio**: muestra la portada de la obra, y ofrece un botón opcional **"Visualizador de Cine Mudo"** (reproduce un loop estético de cine clásico de dominio público de fondo).
  * Si el ítem actual es **Video**: despliega el visor de video integrado con opción de **Pantalla Completa**, **Picture-in-Picture (ventana flotante)** mientras se navega por la app, o **Modo Solo Audio**.

### 2.4. Modo "Contexto Histórico, Licencias y Liner Notes"
Un panel lateral o pestaña dentro del reproductor que enriquece la experiencia cultural:
* **Historia y Contexto:** Año de grabación/estreno, archivo de origen (ej. *Internet Archive - 78rpm Collection*, *Musopen*, *Prelinger Archives*) y notas históricas de la obra.
* ** Sello de Licencia Abierta (Safe for Creators):**
  * Indicador visual claro: **Dominio Público (CC0 / Public Domain Mark)** o **Creative Commons (CC-BY / CC-BY-SA)**.
  * Botón de 1 clic para copiar los créditos de atribución y enlace original en `archive.org`.

### 2.5. Biblioteca Personal del Usuario
Almacenada localmente en el dispositivo durante la Fase 1 (`localStorage`):
* **Canciones y Videos que me gustan (Favoritos):** Marcado rápido con ícono de corazón.
* **Mis Playlists:** Crear playlists propias, editar nombre/descripción, agregar o quitar pistas/videos.
* **Historial Reciente:** Últimas obras reproducidas con punto de reanudación.

### 2.6. Modo Offline y Descargas Reales
* **Gestión de Descargas (Cache API / IndexedDB + Descarga Directa):**
  * Botón de descarga en cada canción o video.
  * Guardado del archivo multimedia en el almacenamiento persistente del navegador/PWA (`IndexedDB` / `Cache Storage`) para reproducirlo cuando el dispositivo esté **Sin Conexión (Offline)**, además de opción para guardar el archivo `.mp3`/`.mp4` en el disco/teléfono.
  * Vista dedicada **"Descargas / Modo Offline"** que muestra el espacio utilizado y filtra únicamente el contenido disponible sin internet.

---

## 3. Alcance de la Fase 2 (Escalamiento a App Móvil y Multiusuario)
Una vez validada la UX en la Fase 1, el sistema evolucionará con:
1. **Empaquetado Móvil Nativo (Android / iOS):**
   * Reutilización del núcleo TypeScript/React mediante **Capacitor** (o migración de vistas a React Native) con soporte para reproducción en segundo plano (*Background Audio Service*), controles en pantalla de bloqueo (*Media Session API* / *Native Media Controls*) y almacenamiento nativo en sistema de archivos.
2. **Backend y Autenticación:**
   * Registro e inicio de sesión (OAuth / Email) mediante Supabase o Firebase/PostgreSQL.
3. **Funciones Sociales y Colaborativas:**
   * Playlists públicas compartibles mediante enlace, perfiles de curadores, seguimiento de amigos y motor de recomendaciones colaborativo (*"Usuarios que escuchan a Chopin en Musopen también ven cortos de Georges Méliès"*).

