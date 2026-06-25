-- =========================================================
-- Base de datos: michis_for_home
-- Proyecto académico - Evidencia GA4-220501096-AA1-EV01
-- MySQL 8.4.9
-- =========================================================

DROP DATABASE IF EXISTS michis_for_home;
CREATE DATABASE michis_for_home
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE michis_for_home;

-- ---------------------------------------------------------
-- Tabla: usuarios
-- Personas que se registran en la aplicación
-- (pueden adoptar o dar en adopción gatitos)
-- ---------------------------------------------------------
CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo          VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20)  NULL,
    fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Tabla: gatos
-- Gatitos registrados (en adopción / adoptados)
-- ---------------------------------------------------------
CREATE TABLE gatos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    edad            VARCHAR(50)  NOT NULL,
    descripcion     VARCHAR(255) NULL,
    personalidad    TEXT NULL,
    vacunas         VARCHAR(100) DEFAULT 'Al día',
    estado_salud    TEXT NULL,
    imagen_url      VARCHAR(500) NULL,
    estado          ENUM('disponible', 'adoptado') NOT NULL DEFAULT 'disponible',
    fecha_adopcion  DATE NULL,
    mensaje_adopcion VARCHAR(255) NULL,
    usuario_id      INT NULL,
    fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gatos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ---------------------------------------------------------
-- Tabla: adopciones
-- Solicitudes de adopción enviadas mediante el formulario
-- ---------------------------------------------------------
CREATE TABLE adopciones (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    gato_id         INT NOT NULL,
    usuario_id      INT NULL,
    nombre_solicitante VARCHAR(150) NOT NULL,
    correo          VARCHAR(150) NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    motivo          TEXT NOT NULL,
    estado          ENUM('pendiente', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adopciones_gato
        FOREIGN KEY (gato_id) REFERENCES gatos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_adopciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ---------------------------------------------------------
-- Datos de ejemplo: usuarios
-- Contraseña en texto plano de referencia: "Admin123*"
-- (en la API se almacena hasheada con bcrypt, este INSERT
--  es solo de referencia y se reemplaza al registrar desde la API)
-- ---------------------------------------------------------
-- Contraseña: Admin123*
INSERT INTO usuarios (nombre_completo, correo, password, telefono) VALUES
('Administrador Michis', 'admin@michisforhome.com', '$2a$10$1kotdHjIKOYPUFRXgcNP3e8Nk6s/G7lxogPlwowYWShm6Rj7h3itK', '3145678907');

-- ---------------------------------------------------------
-- Datos de ejemplo: gatos disponibles
-- ---------------------------------------------------------
INSERT INTO gatos (nombre, edad, descripcion, personalidad, vacunas, estado_salud, imagen_url, estado) VALUES
('Emma', '5 añitos', 'Es una hermosa gatita, un poco seria pero muy amorosa.',
 'Es una gata tranquila y reservada al principio, pero una vez confía en ti se vuelve muy cariñosa y le encanta acurrucarse.',
 'Al día', 'En este momento se encuentra totalmente sana.',
 '/uploads/emma.jpeg', 'disponible'),

('Rayitas', '2 añitos', 'Tiene 2 añitos, es muy juguetona y siempre te acompaña por toda la casa.',
 'Es una gatita muy juguetona, siempre está pendiente para jugar con cualquier cosa. También es muy amorosa, siempre te acompaña.',
 'Al día', 'En este momento se encuentra totalmente sana.',
 '/uploads/rayitas.jpeg', 'disponible'),

('Tito', '4 añitos', 'Es muy activo y juguetón, siempre va a estar contigo.',
 'Le encanta explorar y jugar durante todo el día. Es muy sociable con personas y otros gatos.',
 'Al día', 'En este momento se encuentra totalmente sano.',
 '/uploads/tito.jpeg', 'disponible'),

('Tutu', '6 añitos', 'Es muy dormilona, y cuando está despierta es muy juguetona.',
 'Disfruta de las siestas largas y los lugares calientitos. Cuando despierta busca mimos y juego.',
 'Al día', 'En este momento se encuentra totalmente sana.',
 '/uploads/tutu.jpeg', 'disponible'),

('Manchas', '1 añito', 'Es muy tímida, pero después es muy cariñosa.',
 'Necesita un poco de tiempo para adaptarse a personas nuevas, pero una vez se siente segura es muy apegada.',
 'Al día', 'En este momento se encuentra totalmente sana.',
 '/uploads/manchas.jpeg', 'disponible'),

('Mango', '4 mesesitos', 'Es una piquiña, juega todo el día, no se le acaba la batería.',
 'Curioso y lleno de energía, ideal para hogares activos que disfruten jugar bastante con su gato.',
 'Al día', 'En este momento se encuentra totalmente sano.',
  '/uploads/mango.jpeg', 'disponible'),

('Canela', '2 añitos', 'Es seria y tranquila, pero cuando juega es muy divertida.',
 'Disfruta de espacios tranquilos, pero también tiene momentos de mucha energía y juego.',
 'Al día', 'En este momento se encuentra totalmente sana.',
 '/uploads/canela.jpeg', 'disponible'),

('Matias', '6 mesesitos', 'Es un personaje, siempre está contigo jugando.',
 'Muy sociable y curioso, le encanta seguir a las personas por toda la casa.',
 'Al día', 'En este momento se encuentra totalmente sano.',
 '/uploads/matias.jpeg', 'disponible'),

('Rosita', '2 mesesitos', 'Es muy especial, siempre está contigo acompañándote.',
 'Pequeña y cariñosa, busca compañía constante y mimos.',
 'Al día', 'En este momento se encuentra totalmente sana.',
 '/uploads/rosita.jpeg', 'disponible');

-- ---------------------------------------------------------
-- Datos de ejemplo: gatos adoptados
-- ---------------------------------------------------------
INSERT INTO gatos (nombre, edad, descripcion, personalidad, vacunas, estado_salud, imagen_url, estado, fecha_adopcion, mensaje_adopcion) VALUES
('Luna', '3 añitos', 'Gatita cariñosa y tranquila.',
 'Muy apegada a su familia, le gusta dormir cerca de las ventanas.',
 'Al día', 'Sana', '/uploads/luna.jpeg',
 'adoptado', '2026-03-15', 'Luna encontró su hogar para siempre con la familia Gómez. ¡Es muy feliz!'),

('Simón', '2 añitos', 'Gato juguetón y sociable.',
 'Le encanta jugar con otros gatos y personas.',
 'Al día', 'Sano', '/uploads/simon.jpeg',
 'adoptado', '2026-01-20', 'Simón ahora vive lleno de mimos junto a sus nuevos hermanos peludos.'),

('Pelusa', '1 añito', 'Gatita curiosa y activa.',
 'Le encanta explorar y tomar el sol.',
 'Al día', 'Sana', '/uploads/pelusa.jpeg',
 'adoptado', '2025-12-10', 'Pelusa pasó de estar en la calle a tener su propia ventana soleada favorita.');

-- ---------------------------------------------------------
-- Índices adicionales
-- ---------------------------------------------------------
CREATE INDEX idx_gatos_estado ON gatos(estado);
CREATE INDEX idx_adopciones_estado ON adopciones(estado);
