# Michis for Home

Proyecto académico — API REST + Frontend.
Backend: **Node.js + Express + MySQL 8.4.9**

---

## 1. Requisitos previos

- Node.js (v18 o superior) y npm
- MySQL Server 8.4.9 corriendo en `localhost:3306`
- Visual Studio Code (o el editor de tu preferencia)
- Insomnia o Postman para probar los endpoints

---

## 2. Configuración de la base de datos

1. Abre MySQL Workbench o el cliente de línea de comandos.
2. Ejecuta el script `database/michis_for_home.sql`. Esto:
   - Crea la base de datos `michis_for_home`.
   - Crea las tablas `usuarios`, `gatos` y `adopciones`.
   - Inserta datos de ejemplo (gatos disponibles y adoptados).

```bash
mysql -u root -p < database/michis_for_home.sql
```

---

## 3. Configuración del proyecto

```bash
# Instalar dependencias del backend
cd michis-backend
npm install
```

Revisa el archivo `.env` y ajusta las credenciales según tu instalación de MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Admin123*
DB_NAME=michis_for_home
SESSION_SECRET=michis_for_home_secret_academico_2026
```

---

## 4. Ejecutar

```bash
# El servidor sirve tanto la API como el frontend desde el mismo puerto
npm start
```

O en modo desarrollo (recarga automática con nodemon):

```bash
npm run dev
```

Si todo está correcto verás en consola:

```
🚀 Servidor corriendo en http://localhost:3000
✅ Conexión a la base de datos "michis_for_home" exitosa.
```

---

## 5. Endpoints disponibles

Base URL: `http://localhost:3000`

### Usuarios y autenticación (`/api/usuarios`)

| Método | Endpoint                 | Descripción                                  | Body (JSON)                                              |
|--------|--------------------------|-----------------------------------------------|-----------------------------------------------------------|
| POST   | `/api/usuarios/registro` | Crear cuenta (teléfono obligatorio)           | `{ "nombre_completo", "correo", "password", "telefono" }` |
| POST   | `/api/usuarios/login`    | Iniciar sesión (crea cookie de sesión)        | `{ "correo", "password" }`                                |
| POST   | `/api/usuarios/logout`   | Cerrar sesión                                 | -                                                           |
| GET    | `/api/usuarios/sesion`   | Ver sesión activa (refresca datos desde DB)   | -                                                           |

### Gatos (`/api/gatos`)

| Método | Endpoint                       | Descripción                                     | Body                                                                          |
|--------|--------------------------------|--------------------------------------------------|-------------------------------------------------------------------------------|
| GET    | `/api/gatos`                   | Listar todos los gatos                          | -                                                                             |
| GET    | `/api/gatos?estado=disponible` | Filtrar por estado                              | -                                                                             |
| GET    | `/api/gatos/:id`               | Obtener un gato por id                          | -                                                                             |
| POST   | `/api/gatos`                   | Dar en adopción (`multipart/form-data`)         | `nombre`, `edad`, `descripcion`, `personalidad`, `vacunas`, `estado_salud`, `imagen` (archivo) |
| PUT    | `/api/gatos/:id`               | Actualizar un gato                              | Cualquier campo del gato                                                      |
| DELETE | `/api/gatos/:id`               | Eliminar un gato                                | -                                                                             |

> **Nota:** El POST usa `multipart/form-data` con multer. El campo `imagen` es opcional.

### Solicitudes de adopción (`/api/adopciones`)

| Método | Endpoint              | Descripción                                                    | Body (JSON)                                                                 |
|--------|------------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------|
| GET    | `/api/adopciones`      | Listar todas las solicitudes (con datos del gato)              | -                                                                             |
| GET    | `/api/adopciones/:id`  | Obtener una solicitud por id                                   | -                                                                             |
| POST   | `/api/adopciones`      | Crear solicitud (usuario debe estar autenticado)               | `{ "gato_id", "nombre_solicitante", "correo", "telefono", "motivo" }`        |
| PUT    | `/api/adopciones/:id`  | Aprobar o rechazar solicitud                                   | `{ "estado": "aprobada"\|"rechazada", "mensaje_adopcion"?: "..." }`          |
| DELETE | `/api/adopciones/:id`  | Eliminar una solicitud                                         | -                                                                             |

> **Nota:** Al aprobar (`estado: "aprobada"`), automáticamente marca el gato como `adoptado`, asigna `fecha_adopcion` y guarda el `mensaje_adopcion` si se envía.

---

## 6. Usuarios de prueba

| Rol    | Correo                     | Contraseña   |
|--------|----------------------------|--------------|
| Admin  | `admin@michisforhome.com`  | `Admin123*`  |

---

## 7. Frontend

El frontend está en la carpeta `michis-frontend/` y se sirve estáticamente desde el mismo servidor.

Páginas principales:

| Ruta                  | Descripción                                      |
|-----------------------|---------------------------------------------------|
| `/`                   | Inicio                                            |
| `/gatitos.html`       | Ver gatos disponibles                             |
| `/gatito-detalle.html?id=N` | Detalle de un gato                          |
| `/gatos-adoptados.html` | Gatos que ya encontraron hogar                  |
| `/dar-en-adopcion.html` | Formulario para dar un gato en adopción         |
| `/formulario-adopcion.html?id=N` | Solicitar adopción de un gato         |
| `/solicitudes.html`   | Panel de administración para gestionar solicitudes |
| `/login.html`         | Inicio de sesión                                  |
| `/registro.html`      | Crear cuenta                                      |

> **Notas:**
> - El link "Dar en adopción" cambia a "Solicitudes" cuando el admin inicia sesión.
> - Las páginas de adopción y dar-en-adopción requieren sesión activa.
> - El admin puede aceptar/rechazar solicitudes y escribir un mensaje de adopción.

---

## 8. Estructura del proyecto

```
michis-for-home/
├── michis-backend/              # API REST
│   ├── server.js                # Punto de entrada
│   ├── .env                     # Variables de entorno
│   ├── package.json
│   ├── database/
│   │   └── michis_for_home.sql  # Script de creación de la BD
│   ├── config/
│   │   └── db.js                # Pool de conexión a MySQL
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Verificación de sesión
│   │   └── upload.middleware.js # Multer para subida de imágenes
│   ├── controllers/
│   │   ├── usuarios.controller.js
│   │   ├── gatos.controller.js
│   │   └── adopciones.controller.js
│   ├── routes/
│   │   ├── usuarios.routes.js
│   │   ├── gatos.routes.js
│   │   └── adopciones.routes.js
│   └── uploads/                 # Imágenes subidas por multer
│
└── michis-frontend/             # Frontend estático
    ├── index.html
    ├── css/
    ├── js/
    │   └── app.js               # Lógica del frontend (fetch, auth, UI)
    ├── images/
    └── *.html                   # Páginas del sitio
```

---

## 9. Ejemplo de flujo de prueba (Insomnia/Postman)

1. `POST /api/usuarios/registro` → crear un usuario.
2. `POST /api/usuarios/login` → iniciar sesión (guarda la cookie).
3. `GET /api/gatos` → ver los gatos disponibles.
4. `POST /api/adopciones` → enviar solicitud para un gato.
5. Iniciar sesión como admin (`admin@michisforhome.com` / `Admin123*`).
6. `GET /api/adopciones` → ver todas las solicitudes.
7. `PUT /api/adopciones/:id` con `{ "estado": "aprobada", "mensaje_adopcion": "..." }` → aprobar.
8. `GET /api/gatos?estado=adoptado` → verificar que el gato aparece como adoptado.
