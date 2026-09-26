// CONFIGURACIÓN DE TU ENDPOINT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwiOC858T9asKF7nkQZk4Muhg58GnoYXlJqEr_8KS05fruB1ydSoVjnUA2-SqWqZQgFvQ/exec";
const FECHA_BODA = new Date("2027-06-19T17:00:00").getTime();

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const invitado = params.get("invitado");
  const pases = params.get("pases");

  const storageKey = invitado ? `boda_confirmada_${invitado.trim().toLowerCase()}` : "boda_confirmada_general";

  // ========================================================
  // 1. PERSONALIZAR INTERFAZ POR URL
  // ========================================================
  if (invitado) {
    const saludoEl = document.getElementById("saludo-personalizado");
    const inputNombre = document.getElementById("input-nombre");
    if (saludoEl) saludoEl.textContent = `¡Nos encantaría que nos acompañes, ${invitado}!`;
    if (inputNombre) inputNombre.value = invitado;
  }

  if (pases) {
    const inputAcomp = document.getElementById("input-acompanantes");
    if (inputAcomp) inputAcomp.value = pases;
  }

  // ========================================================
  // 2. MODAL DE MÚSICA DE BIENVENIDA Y AUDIO FLOTANTE
  // ========================================================
  const modalMusica = document.getElementById("modal-musica");
  const audio = document.getElementById("audio-fondo");
  const btnConMusica = document.getElementById("btn-con-musica");
  const btnSinMusica = document.getElementById("btn-sin-musica");
  const btnToggleAudio = document.getElementById("btn-audio-toggle");
  const iconoSonando = document.getElementById("icono-sonando");
  const iconoMutado = document.getElementById("icono-mutado");

  // Botón: Ingresar con música
  if (btnConMusica && audio && modalMusica) {
    btnConMusica.addEventListener("click", () => {
      audio.play().catch(e => console.log("Audio pausado por el navegador:", e));
      modalMusica.classList.add("hidden");
    });
  }

  // Botón: Ingresar en silencio
  if (btnSinMusica && modalMusica) {
    btnSinMusica.addEventListener("click", () => {
      modalMusica.classList.add("hidden");
    });
  }

  // Botón flotante para pausar / reanudar en cualquier momento
  if (btnToggleAudio && audio) {
    btnToggleAudio.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        if (iconoSonando) iconoSonando.classList.remove("hidden");
        if (iconoMutado) iconoMutado.classList.add("hidden");
      } else {
        audio.pause();
        if (iconoSonando) iconoSonando.classList.add("hidden");
        if (iconoMutado) iconoMutado.classList.remove("hidden");
      }
    });
  }

  // ========================================================
  // 3. CUENTA REGRESIVA
  // ========================================================
  setInterval(() => {
    const ahora = new Date().getTime();
    const distancia = FECHA_BODA - ahora;

    if (distancia > 0) {
      const d = Math.floor(distancia / (1000 * 60 * 60 * 24));
      const h = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distancia % (1000 * 60)) / 1000);

      const elD = document.getElementById("dias");
      const elH = document.getElementById("horas");
      const elM = document.getElementById("minutos");
      const elS = document.getElementById("segundos");

      if (elD) elD.textContent = d < 10 ? `0${d}` : d;
      if (elH) elH.textContent = h < 10 ? `0${h}` : h;
      if (elM) elM.textContent = m < 10 ? `0${m}` : m;
      if (elS) elS.textContent = s < 10 ? `0${s}` : s;
    }
  }, 1000);

  // ========================================================
  // 4. COPIAR IBAN AL PORTAPAPELES
  // ========================================================
  const btnCopiarIban = document.getElementById("btn-copiar-iban");
  const ibanText = document.getElementById("iban-text");
  const msgIbanCopiado = document.getElementById("msg-iban-copiado");

  if (btnCopiarIban && ibanText) {
    btnCopiarIban.addEventListener("click", () => {
      const limpio = ibanText.textContent.replace(/\s+/g, '');
      navigator.clipboard.writeText(limpio).then(() => {
        if (msgIbanCopiado) {
          msgIbanCopiado.classList.remove("hidden");
          setTimeout(() => msgIbanCopiado.classList.add("hidden"), 3000);
        }
      });
    });
  }

  // ========================================================
  // 5. GESTIÓN DEL MODAL RSVP Y ASISTENCIA YA CONFIRMADA
  // ========================================================
  const modalRsvp = document.getElementById("modal-rsvp");
  const btnAbrirRsvp = document.getElementById("btn-abrir-rsvp");
  const btnCerrarRsvp = document.getElementById("btn-cerrar-rsvp");
  const avisoYaConfirmado = document.getElementById("aviso-ya-confirmado");
  const form = document.getElementById("rsvp-form");
  const btnSubmit = document.getElementById("btn-submit");

  // Si ya confirmó con anterioridad, ocultamos el botón de apertura y mostramos el aviso
  if (localStorage.getItem(storageKey) === "true") {
    if (btnAbrirRsvp) btnAbrirRsvp.classList.add("hidden");
    if (avisoYaConfirmado) avisoYaConfirmado.classList.remove("hidden");
  }

  // Abrir ventana emergente
  if (btnAbrirRsvp && modalRsvp) {
    btnAbrirRsvp.addEventListener("click", () => {
      modalRsvp.classList.remove("hidden");
    });
  }

  // Cerrar ventana con la cruz (X)
  if (btnCerrarRsvp && modalRsvp) {
    btnCerrarRsvp.addEventListener("click", () => {
      modalRsvp.classList.add("hidden");
    });
  }

  // Cerrar ventana si se hace clic fuera del recuadro blanco
  if (modalRsvp) {
    modalRsvp.addEventListener("click", (e) => {
      if (e.target === modalRsvp) {
        modalRsvp.classList.add("hidden");
      }
    });
  }

  // ========================================================
  // 6. ENVIAR FORMULARIO A GOOGLE SHEETS
  // ========================================================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Guardando respuesta...";
      }

      const formData = new FormData(form);
      const params = new URLSearchParams(formData).toString();
      const urlFinal = `${SCRIPT_URL}?${params}`;

      try {
        await fetch(urlFinal, {
          method: "GET",
          mode: "no-cors"
        });

        // 1. Guardamos en el almacenamiento local que ya confirmó
        localStorage.setItem(storageKey, "true");

        // 2. Cerramos el modal
        if (modalRsvp) modalRsvp.classList.add("hidden");

        // 3. Sustituimos el botón por la insignia verde
        if (btnAbrirRsvp) btnAbrirRsvp.classList.add("hidden");
        if (avisoYaConfirmado) avisoYaConfirmado.classList.remove("hidden");

      } catch (error) {
        console.error("Error al enviar:", error);
        alert("Hubo un error de conexión al registrar tu respuesta. Por favor, inténtalo de nuevo.");
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Enviar Confirmación";
        }
      }
    });
  }
});