/* =========================
   LOGIN (jQuery)
========================= */

$(document).ready(function () {
  $('#loginForm').submit(function (e) {
    e.preventDefault();

    const email = $('#email').val().trim();
    const password = $('#password').val();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      mostrarMensaje('El correo electrónico no es válido', 'danger');
      return;
    }

    if (password.length < 6) {
      mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'danger');
      return;
    }

    mostrarMensaje('Inicio de sesión exitoso. Redirigiendo...', 'success');

    setTimeout(() => {
      window.location.href = 'menu.html';
    }, 1000);
  });
});

/* =========================
   MENSAJES (Bootstrap)
========================= */

function mostrarMensaje(texto, tipo) {
  // usa alert-container si existe (deposit), si no usa mensaje (login/menu/transactions/sendmoney)
  const contenedor = $('#alert-container').length ? '#alert-container' : '#mensaje';

  $(contenedor).html(`
    <div class="alert alert-${tipo}" role="alert">
      ${texto}
    </div>
  `);
}

/* =========================
   SALDO
========================= */

function obtenerSaldo() {
  return parseInt(localStorage.getItem("saldo")) || 60000;
}

function guardarSaldo(saldo) {
  localStorage.setItem("saldo", saldo);
}

function mostrarSaldo() {
  const saldo = obtenerSaldo();
  const saldoElemento = document.getElementById("saldo");
  if (saldoElemento) saldoElemento.textContent = saldo;
}

/* =========================
   MOVIMIENTOS (LocalStorage)
========================= */

function obtenerMovimientos() {
  return JSON.parse(localStorage.getItem("movimientos")) || [];
}

function guardarMovimientos(movs) {
  localStorage.setItem("movimientos", JSON.stringify(movs));
}

function agregarMovimiento(tipo, detalle, monto) {
  const movs = obtenerMovimientos();

  const movimiento = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    tipo,
    detalle,
    monto: Number(monto),
    fecha: new Date().toISOString()
  };

  movs.unshift(movimiento);
  guardarMovimientos(movs);
}

/* =========================
   DEPÓSITO (jQuery)
========================= */

function initDeposit() {
  const saldo = obtenerSaldo();
  $('#saldoActual').text(saldo);

  $('#depositForm').submit(function (e) {
    e.preventDefault();
    realizarDeposito();
  });
}

function realizarDeposito() {
  const monto = parseInt($('#depositAmount').val());

  if (isNaN(monto) || monto <= 0) {
    mostrarMensaje("Ingrese un monto válido", "danger");
    return;
  }

  let saldoActual = obtenerSaldo();
  saldoActual += monto;
  guardarSaldo(saldoActual);

  agregarMovimiento("DEPOSITO", "Depósito a cuenta", monto);

  $('#saldoActual').text(saldoActual);

  mostrarMensaje(`Depósito realizado con éxito. Nuevo saldo: $${saldoActual}`, "success");

  $('#leyendaDeposito').html(`
    <small class="text-muted">Monto depositado: <strong>$${monto}</strong></small>
  `);

  $('#depositAmount').val('');

  setTimeout(() => {
    window.location.href = "menu.html";
  }, 2000);
}

/* =========================
   CONTACTOS (LocalStorage)
========================= */

function obtenerContactos() {
  return JSON.parse(localStorage.getItem("contactos")) || [];
}

function guardarContactos(contactos) {
  localStorage.setItem("contactos", JSON.stringify(contactos));
}

/* =========================
   SEND MONEY (jQuery)
========================= */

let contactoSeleccionadoId = null;

function initSendMoney() {
  // ocultar botón al inicio
  $('#btnEnviarDinero').addClass('d-none');

  // demo si está vacío
  if (obtenerContactos().length === 0) {
    guardarContactos([
      { id: "c1", nombre: "John Doe", cbu: "1234567890", alias: "john.doe", banco: "ABC Bank" },
      { id: "c2", nombre: "Jane Smith", cbu: "9876543210", alias: "jane.smith", banco: "XYZ Bank" }
    ]);
  }

  renderizarContactos("");

  // búsqueda por nombre o alias
  $('#searchContact').on('input', function () {
    renderizarContactos($(this).val());
  });

  // agregar contacto (modal)
  $('#contactForm').submit(function (e) {
    e.preventDefault();

    const nombre = $('#contactName').val().trim();
    const cbu = $('#contactCBU').val().trim();
    const alias = $('#contactAlias').val().trim();
    const banco = $('#contactBank').val().trim();

    if (!nombre || !cbu || !alias || !banco) {
      mostrarMensaje("Completa todos los campos", "danger");
      return;
    }

    if (!/^\d{10,22}$/.test(cbu)) {
      mostrarMensaje("CBU inválido. Debe tener solo números (10 a 22 dígitos).", "danger");
      return;
    }

    const contactos = obtenerContactos();
    const existe = contactos.some(c => c.cbu === cbu || c.alias.toLowerCase() === alias.toLowerCase());
    if (existe) {
      mostrarMensaje("Ya existe un contacto con ese CBU o Alias", "danger");
      return;
    }

    const nuevo = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      nombre,
      cbu,
      alias,
      banco
    };

    contactos.unshift(nuevo);
    guardarContactos(contactos);

    mostrarMensaje("Contacto guardado correctamente", "success");

    // cerrar modal (Bootstrap)
    const modalEl = document.getElementById("contactModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    $('#contactForm')[0].reset();

    contactoSeleccionadoId = nuevo.id;
    renderizarContactos($('#searchContact').val() || "");
    actualizarUISeleccion();
  });

  // enviar dinero
  $('#sendMoneyForm').submit(function (e) {
    e.preventDefault();

    const monto = parseInt($('#sendAmount').val());

    if (!contactoSeleccionadoId) {
      mostrarMensaje("Debes seleccionar un contacto antes de enviar dinero", "danger");
      return;
    }

    if (isNaN(monto) || monto <= 0) {
      mostrarMensaje("Ingresa un monto válido", "danger");
      return;
    }

    const saldoActual = obtenerSaldo();
    if (monto > saldoActual) {
      mostrarMensaje(`Saldo insuficiente. Tu saldo es $${saldoActual}`, "danger");
      return;
    }

    const contactos = obtenerContactos();
    const contacto = contactos.find(c => c.id === contactoSeleccionadoId);

    if (!contacto) {
      mostrarMensaje("El contacto seleccionado ya no existe", "danger");
      return;
    }

    const nuevoSaldo = saldoActual - monto;
    guardarSaldo(nuevoSaldo);

    // tipo ENVIO = transferencia enviada
    agregarMovimiento("ENVIO", `Envío a ${contacto.nombre} (${contacto.banco})`, monto);

    mostrarMensaje("Envío realizado con éxito", "success");

    $('#confirmacionEnvio').html(`
      <div class="alert alert-success" role="alert">
        Confirmación: enviaste <strong>$${monto}</strong> a <strong>${contacto.nombre}</strong>.
      </div>
    `);

    $('#sendMoneyForm')[0].reset();

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 2000);
  });
}

function renderizarContactos(filtro = "") {
  const contactos = obtenerContactos();
  const f = (filtro || "").toLowerCase();

  const filtrados = contactos.filter(c =>
    c.nombre.toLowerCase().includes(f) ||
    c.alias.toLowerCase().includes(f)
  );

  if (filtrados.length === 0) {
    $('#contactList').html(`<div class="text-muted">No hay contactos para mostrar.</div>`);
    contactoSeleccionadoId = null;
    actualizarUISeleccion();
    return;
  }

  $('#contactList').html(
    filtrados.map(c => `
      <button type="button"
        class="list-group-item list-group-item-action contact-item ${c.id === contactoSeleccionadoId ? "active" : ""}"
        data-id="${c.id}">
        <div class="fw-bold">${c.nombre}</div>
        <div class="small">
          <span class="me-2"><strong>CBU:</strong> ${c.cbu}</span>
          <span class="me-2"><strong>Alias:</strong> ${c.alias}</span>
          <span><strong>Banco:</strong> ${c.banco}</span>
        </div>
      </button>
    `).join("")
  );

  $('.contact-item').off('click').on('click', function () {
    contactoSeleccionadoId = $(this).data('id');
    renderizarContactos($('#searchContact').val() || "");
    actualizarUISeleccion();
  });

  actualizarUISeleccion();
}

function actualizarUISeleccion() {
  if (contactoSeleccionadoId) {
    $('#btnEnviarDinero').removeClass('d-none');
  } else {
    $('#btnEnviarDinero').addClass('d-none');
  }
}

/* =========================
   REDIRECCIÓN
========================= */

function redirigir(nombrePantalla, url) {
  mostrarMensaje(`Redirigiendo a ${nombrePantalla}...`, "info");

  setTimeout(() => {
    window.location.href = url;
  }, 1000);
}

/* =========================
   TRANSACTIONS (Filtro + jQuery)
========================= */

// Lista ficticia (consigna). Reemplaza luego por tus transacciones reales.
const listaTransacciones = [
  { tipo: "DEPOSITO", detalle: "Depósito a cuenta", monto: 20000, fecha: "2026-01-10T10:20:00.000Z" },
  { tipo: "COMPRA", detalle: "Compra en supermercado", monto: 8500, fecha: "2026-01-11T18:45:00.000Z" },
  { tipo: "RECIBIDA", detalle: "Transferencia recibida de Ana", monto: 12000, fecha: "2026-01-12T09:05:00.000Z" },
  { tipo: "ENVIO", detalle: "Envío a John Doe (ABC Bank)", monto: 5000, fecha: "2026-01-13T14:15:00.000Z" }
];

function getTipoTransaccion(tipo) {
  switch (tipo) {
    case "COMPRA": return "Compra";
    case "DEPOSITO": return "Depósito";
    case "RECIBIDA": return "Transferencia recibida";
    case "ENVIO": return "Transferencia enviada";
    default: return "Movimiento";
  }
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

function mostrarUltimosMovimientos(filtro) {
  const ul = document.getElementById("movementsList");
  if (!ul) return;

  // por defecto usa ficticia (consigna)
  let movs = listaTransacciones;

  // si ya tienes lista real guardada, úsala
  const reales = obtenerMovimientos();
  if (reales.length > 0) movs = reales;

  // filtrar
  if (filtro && filtro !== "TODAS") {
    movs = movs.filter(m => m.tipo === filtro);
  }

  if (movs.length === 0) {
    ul.innerHTML = `<li class="list-group-item text-muted">No hay movimientos para este filtro.</li>`;
    return;
  }

  ul.innerHTML = movs.map(m => `
    <li class="list-group-item d-flex justify-content-between align-items-start">
      <div>
        <strong>${getTipoTransaccion(m.tipo)}</strong><br>
        <small>${m.detalle}</small><br>
        <small class="text-muted">${formatearFecha(m.fecha)}</small>
      </div>
      <span>$${m.monto}</span>
    </li>
  `).join("");
}

function initTransactions() {
  // render inicial
  mostrarUltimosMovimientos("TODAS");

  // filtro con jQuery
  $('#filtroTipo').off('change').on('change', function () {
    mostrarUltimosMovimientos($(this).val());
  });

  // limpiar historial (real)
  const btn = document.getElementById("btnLimpiarMovs");
  if (btn) {
    btn.addEventListener("click", () => {
      guardarMovimientos([]);
      mostrarMensaje("Historial limpiado", "success");
      mostrarUltimosMovimientos($('#filtroTipo').val() || "TODAS");
    });
  }
}
