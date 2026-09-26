// PEGA AQUÍ TU URL /exec DE GOOGLE APPS SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbytui4-3L62zYl-CTRBFpWKGY8UYmFrPoCWcVS5oZylJu8oDoEDON_5iNZKYx6-1yM1Ow/exec"; 
const FECHA_BODA = new Date("2027-06-19T17:00:00").getTime();

document.addEventListener("DOMContentLoaded", () => {
  // 1. Personalizar con la URL
  const params = new URLSearchParams(window.location.search);
  const invitado = params.get("invitado");
  const pases = params.get("pases");

  if (invitado) {
    document.getElementById("saludo-personalizado").textContent = `¡Nos encantaría que nos acompañes, ${invitado}!`;
    document.getElementById("input-nombre").value = invitado;
  }

  if (pases) {
    document.getElementById("input-acompanantes").value = pases;
  }

  // 2. Control de música
  const modal = document.getElementById("modal-musica");
  const audio = document.getElementById("audio-fondo");
  
  document.getElementById("btn-con-musica").addEventListener("click", () => {
    audio.play().catch(e => console.log("Audio bloqueado por navegador", e));
    modal.classList.add("hidden");
  });

  document.getElementById("btn-sin-musica").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // 3. Cuenta atrás
  setInterval(() => {
    const ahora = new Date().getTime();
    const distancia = FECHA_BODA - ahora;

    if (distancia > 0) {
      document.getElementById("dias").textContent = Math.floor(distancia / (1000 * 60 * 60 * 24));
      document.getElementById("horas").textContent = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      document.getElementById("minutos").textContent = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
      document.getElementById("segundos").textContent = Math.floor((distancia % (1000 * 60)) / 1000);
    }
  }, 1000);

  // 4. Enviar formulario a Google Sheets
  const form = document.getElementById("rsvp-form");
  const btnSubmit = document.getElementById("btn-submit");
  const mensajeEstado = document.getElementById("mensaje-estado");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Guardando respuesta...";

    const formData = new FormData(form);
    const params = new URLSearchParams(formData).toString();
    const urlFinal = `${SCRIPT_URL}?${params}`;

    try {
      await fetch(urlFinal, {
        method: "GET",
        mode: "no-cors"
      });

      mensajeEstado.className = "text-center text-sm font-sans mt-4 text-emerald-700 block";
      mensajeEstado.textContent = "¡Muchas gracias! Tu asistencia ha quedado registrada correctamente.";
      form.reset();
    } catch (error) {
      console.error(error);
      mensajeEstado.className = "text-center text-sm font-sans mt-4 text-red-600 block";
      mensajeEstado.textContent = "Hubo un error al enviar. Por favor, inténtalo de nuevo.";
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Enviar Confirmación";
    }
  });
});