const API = (window.API_URL || '').replace(/\/+$/, '');

const $estado = document.getElementById('estado');
const $nombreSaludo = document.getElementById('nombreSaludo');
const $btnSaludo = document.getElementById('btnSaludo');
const $salidaSaludo = document.getElementById('salidaSaludo');
const $formMuro = document.getElementById('formMuro');
const $autor = document.getElementById('autor');
const $mensaje = document.getElementById('mensaje');
const $errorMuro = document.getElementById('errorMuro');
const $listaMuro = document.getElementById('listaMuro');

async function comprobarSalud() {
  try {
    const r = await fetch(`${API}/health`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    $estado.textContent = `API conectada (${API || 'mismo origen'}) · ${data.hora}`;
    $estado.className = 'estado estado-ok';
  } catch (err) {
    $estado.textContent = `Sin conexión con la API (${API || 'mismo origen'}): ${err.message}`;
    $estado.className = 'estado estado-error';
  }
}

$btnSaludo.addEventListener('click', async () => {
  const q = encodeURIComponent($nombreSaludo.value.trim());
  $salidaSaludo.textContent = 'Consultando...';
  try {
    const r = await fetch(`${API}/api/saludo?nombre=${q}`);
    const data = await r.json();
    $salidaSaludo.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    $salidaSaludo.textContent = `Error: ${err.message}`;
  }
});

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

async function cargarMuro() {
  try {
    const r = await fetch(`${API}/api/muro`);
    const items = await r.json();
    $listaMuro.innerHTML = items.length
      ? items.map(m => `<li><strong>${escapar(m.nombre)}:</strong> ${escapar(m.mensaje)}</li>`).join('')
      : '<li class="vacio">Aún no hay mensajes. ¡Publica el primero!</li>';
  } catch {
    $listaMuro.innerHTML = '<li class="error">No se pudo cargar el muro.</li>';
  }
}

$formMuro.addEventListener('submit', async (e) => {
  e.preventDefault();
  $errorMuro.textContent = '';
  const nombre = $autor.value.trim();
  const mensaje = $mensaje.value.trim();
  try {
    const r = await fetch(`${API}/api/muro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, mensaje }),
    });
    const data = await r.json();
    if (!r.ok) {
      $errorMuro.textContent = data.error || 'No se pudo publicar';
      return;
    }
    $mensaje.value = '';
    await cargarMuro();
  } catch (err) {
    $errorMuro.textContent = `Error de red: ${err.message}`;
  }
});

comprobarSalud();
cargarMuro();