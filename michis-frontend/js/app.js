const API_BASE = '/api';

async function getGatos() {
  const res = await fetch(`${API_BASE}/gatos?estado=disponible`);
  const json = await res.json();
  return json.ok ? json.data : [];
}

async function getGatoPorId(id) {
  const res = await fetch(`${API_BASE}/gatos/${id}`);
  const json = await res.json();
  return json.ok ? json.data : null;
}

async function getGatosAdoptados() {
  const res = await fetch(`${API_BASE}/gatos?estado=adoptado`);
  const json = await res.json();
  return json.ok ? json.data : [];
}

async function renderGatitosGrid() {
  const grid = document.getElementById("gatitos-grid");
  if (!grid) return;

  const colores = ["lila", "beige", "azul", "rosa"];
  const gatos = await getGatos();

  grid.innerHTML = gatos.map((gato, index) => {
    const color = colores[index % colores.length];
    return `
      <a href="gatito-detalle.html?id=${gato.id}" class="gatito-card gatito-card--${color}">
        <div class="gatito-card__img">
          <img src="${gato.imagen_url}" alt="Foto de ${gato.nombre}" />
        </div>
        <h3>${gato.nombre}</h3>
        <p>Tiene ${gato.edad}. ${gato.descripcion || ''}</p>
      </a>
    `;
  }).join("");
}

async function renderGatoDetalle() {
  const container = document.getElementById("gato-detalle");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const gato = await getGatoPorId(id);

  if (!gato) {
    container.innerHTML = `
      <p class="text-center">No encontramos información de este gatito.</p>
      <div class="text-center" style="margin-top: 24px;">
        <a href="gatitos.html" class="btn">Volver a ver gatitos</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="detail-photo">
      <img src="${gato.imagen_url}" alt="Foto de ${gato.nombre}" />
    </div>
    <div class="detail-info">
      <p><strong>Nombre:</strong> ${gato.nombre}</p>
      <p><strong>Edad:</strong> ${gato.edad}</p>
      <p><strong>Vacunas:</strong> ${gato.vacunas}</p>
      <p><strong>Personalidad:</strong> ${gato.personalidad || ''}</p>
      <p><strong>Estado de salud:</strong> ${gato.estado_salud || ''}</p>
    </div>
  `;

  const btnAdoptar = document.getElementById("btn-adoptar");
  if (btnAdoptar) {
    btnAdoptar.href = `formulario-adopcion.html?id=${gato.id}&nombre=${encodeURIComponent(gato.nombre)}`;
  }
}

async function renderGatosAdoptados() {
  const grid = document.getElementById("adoptados-grid");
  if (!grid) return;

  const colores = ["lila", "azul", "beige", "rosa"];
  const adoptados = await getGatosAdoptados();

  if (adoptados.length === 0) {
    grid.innerHTML = `<p class="text-center">Aún no tenemos historias de adopción para mostrar.</p>`;
    return;
  }

  grid.innerHTML = adoptados.map((gato, index) => {
    const color = colores[index % colores.length];
    return `
      <article class="gatito-card gatito-card--${color}">
        <div class="gatito-card__img">
          <img src="${gato.imagen_url}" alt="Foto de ${gato.nombre}" />
        </div>
        <h3>${gato.nombre}</h3>
        <p class="adopted-date">Adoptado el: ${gato.fecha_adopcion ? new Date(gato.fecha_adopcion).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</p>
        <p>${gato.mensaje_adopcion || ''}</p>
      </article>
    `;
  }).join("");
}

async function requireAuth() {
  const res = await fetch(`${API_BASE}/usuarios/sesion`, { credentials: 'include' });
  const json = await res.json();
  if (!json.ok || !json.autenticado) {
    window.location.href = "login.html";
    return null;
  }
  return json.data;
}

async function setupFormularioAdopcion() {
  const form = document.getElementById("form-adopcion");
  if (!form) return;

  const usuario = await requireAuth();
  if (!usuario) return;

  const params = new URLSearchParams(window.location.search);
  const nombreGato = params.get("nombre");
  const gatoId = params.get("id");
  const aviso = document.getElementById("adopcion-gato-nombre");

  if (nombreGato && aviso) {
    aviso.textContent = `Solicitud de adopción para: ${nombreGato}`;
    aviso.hidden = false;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datos = {
      gato_id: parseInt(gatoId),
      usuario_id: usuario.id,
      nombre_solicitante: usuario.nombre_completo,
      correo: usuario.correo,
      telefono: usuario.telefono || null,
      motivo: document.getElementById("adopcion-motivo").value
    };

    try {
      const res = await fetch(`${API_BASE}/adopciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(datos)
      });
      const json = await res.json();
      if (json.ok) {
        alert("¡Gracias! Tu solicitud de adopción fue registrada.");
        form.reset();
      } else {
        alert("Error: " + json.mensaje);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  });
}

async function setupFormularioDarEnAdopcion() {
  const form = document.getElementById("form-dar-adopcion");
  if (!form) return;

  const usuario = await requireAuth();
  if (!usuario) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nombre', document.getElementById("dar-nombre-gato").value);
    formData.append('edad', document.getElementById("dar-edad-gato").value);
    formData.append('descripcion', document.getElementById("dar-descripcion-gato").value || '');
    formData.append('personalidad', document.getElementById("dar-personalidad-gato").value || '');
    formData.append('vacunas', document.getElementById("dar-vacunas-gato").value || 'Al día');
    formData.append('estado_salud', document.getElementById("dar-salud-gato").value || '');
    formData.append('estado', 'disponible');
    formData.append('usuario_id', usuario.id);

    const fileInput = document.getElementById("dar-foto-gato");
    if (fileInput.files.length > 0) {
      formData.append('imagen', fileInput.files[0]);
    }

    try {
      const res = await fetch(`${API_BASE}/gatos`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const json = await res.json();
      if (json.ok) {
        alert("¡Gracias! La información de tu michi fue registrada.");
        form.reset();
      } else {
        alert("Error: " + json.mensaje);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  });
}

function setupFormularioLogin() {
  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datos = {
      correo: document.getElementById("login-correo").value,
      password: document.getElementById("login-password").value
    };

    try {
      const res = await fetch(`${API_BASE}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(datos)
      });
      const json = await res.json();
      if (json.ok) {
        alert("Inicio de sesión exitoso. ¡Bienvenido!");
        window.location.href = "index.html";
      } else {
        alert("Error: " + json.mensaje);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  });
}

function setupFormularioRegistro() {
  const form = document.getElementById("form-registro");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const password = document.getElementById("registro-password").value;
    const confirmPassword = document.getElementById("registro-confirm-password").value;

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const datos = {
      nombre_completo: document.getElementById("registro-nombre").value,
      correo: document.getElementById("registro-correo").value,
      telefono: document.getElementById("registro-telefono").value,
      password: password
    };

    try {
      const res = await fetch(`${API_BASE}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(datos)
      });
      const json = await res.json();
      if (json.ok) {
        alert("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
        window.location.href = "login.html";
      } else {
        alert("Error: " + json.mensaje);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  });
}

async function updateNavbar() {
  const loginLink = document.querySelector('.navbar__menu a[href="login.html"]');
  if (!loginLink) return;

  try {
    const res = await fetch(`${API_BASE}/usuarios/sesion`, { credentials: 'include' });
    const json = await res.json();
    if (json.ok && json.autenticado) {
      loginLink.textContent = `Cerrar sesión`;
      loginLink.href = "#";
      loginLink.addEventListener("click", async function (e) {
        e.preventDefault();
        await fetch(`${API_BASE}/usuarios/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        window.location.reload();
      });

      if (json.data.correo === 'admin@michisforhome.com') {
        const darLink = document.querySelector('.navbar__menu a[href="dar-en-adopcion.html"]');
        if (darLink) {
          darLink.textContent = 'Solicitudes';
          darLink.href = 'solicitudes.html';
        }
      }
    }
  } catch (_) {}
}

async function renderSolicitudes() {
  const container = document.getElementById("solicitudes-list");
  if (!container) return;

  const usuario = await requireAuth();
  if (!usuario) return;

  if (usuario.correo !== 'admin@michisforhome.com') {
    container.innerHTML = `<p class="text-center">No tienes permisos para ver esta página.</p>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/adopciones`, { credentials: 'include' });
    const json = await res.json();
    if (!json.ok) {
      container.innerHTML = `<p class="text-center">Error al cargar solicitudes.</p>`;
      return;
    }

    const solicitudes = json.data;
    if (solicitudes.length === 0) {
      container.innerHTML = `<p class="text-center">No hay solicitudes de adopción aún.</p>`;
      return;
    }

    container.innerHTML = solicitudes.map(s => {
      const estadoClass = `solicitud-card__estado--${s.estado}`;
      const botones = s.estado === 'pendiente' ? `
        <div class="solicitud-card__acciones">
          <button class="btn-aceptar" data-id="${s.id}" data-gato="${s.nombre_gato}">Aceptar</button>
          <button class="btn-rechazar" data-id="${s.id}">Rechazar</button>
        </div>
      ` : '';

      return `
        <div class="solicitud-card">
          <div class="solicitud-card__img">
            <img src="${s.imagen_gato || 'images/logo.png'}" alt="${s.nombre_gato}" />
          </div>
          <div class="solicitud-card__info">
            <h3>Solicitud para: ${s.nombre_gato}</h3>
            <p><strong>Solicitante:</strong> ${s.nombre_solicitante}</p>
            <p><strong>Correo:</strong> ${s.correo}</p>
            <p><strong>Teléfono:</strong> ${s.telefono || '—'}</p>
            <p><strong>Motivo:</strong> ${s.motivo}</p>
            <p><strong>Fecha:</strong> ${new Date(s.fecha_solicitud).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            <span class="solicitud-card__estado ${estadoClass}">${s.estado}</span>
            ${botones}
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll('.btn-rechazar').forEach(btn => {
      btn.addEventListener('click', async function () {
        const id = this.dataset.id;
        try {
          const r = await fetch(`${API_BASE}/adopciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ estado: 'rechazada' })
          });
          const j = await r.json();
          if (j.ok) {
            renderSolicitudes();
          } else {
            alert('Error: ' + j.mensaje);
          }
        } catch (_) {
          alert('Error de conexión.');
        }
      });
    });

    document.querySelectorAll('.btn-aceptar').forEach(btn => {
      btn.addEventListener('click', function () {
        const solicitudId = this.dataset.id;
        const nombreGato = this.dataset.gato;
        document.getElementById('modal-gato-nombre').textContent = nombreGato;
        document.getElementById('modal-mensaje-text').value = '';
        document.getElementById('modal-mensaje').showModal();
        document.getElementById('modal-confirmar').dataset.id = solicitudId;
      });
    });
  } catch (_) {
    container.innerHTML = `<p class="text-center">Error al cargar solicitudes.</p>`;
  }
}

function setupHamburgerMenu() {
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    menu.classList.toggle('navbar__menu--open');
    toggle.textContent = menu.classList.contains('navbar__menu--open') ? '✕' : '☰';
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupHamburgerMenu();
  updateNavbar();
  renderGatitosGrid();
  renderGatoDetalle();
  renderGatosAdoptados();
  renderSolicitudes();
  setupFormularioAdopcion();
  setupFormularioDarEnAdopcion();
  setupFormularioLogin();
  setupFormularioRegistro();

  const modal = document.getElementById('modal-mensaje');
  if (modal) {
    document.getElementById('modal-cancelar').addEventListener('click', function () {
      modal.close();
    });

    document.getElementById('modal-confirmar').addEventListener('click', async function () {
      const id = this.dataset.id;
      const mensaje = document.getElementById('modal-mensaje-text').value.trim();
      if (!mensaje) {
        alert('Por favor escribe un mensaje de adopción.');
        return;
      }
      try {
        const r = await fetch(`${API_BASE}/adopciones/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ estado: 'aprobada', mensaje_adopcion: mensaje })
        });
        const j = await r.json();
        if (j.ok) {
          modal.close();
          renderSolicitudes();
        } else {
          alert('Error: ' + j.mensaje);
        }
      } catch (_) {
        alert('Error de conexión.');
      }
    });
  }
});
