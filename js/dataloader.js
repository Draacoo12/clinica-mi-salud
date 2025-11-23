(function(){
  // --- CONSTANTES Y CLAVES ---
  const KEY_ESP = "especialidades";
  const KEY_DOC = "doctores";
  const KEY_USERS = "users";

  // --- 1. TUS IMÁGENES EXACTAS (Según tu foto) ---
  const baseEspecialidades = [
    { id: 'cardio', nombre: "Cardiología", descripcion: "Cuidado del corazón", img: "imagenes/corazon.jpg" },
    { id: 'pedia', nombre: "Pediatría", descripcion: "Atención para niños", img: "imagenes/niño.jpg" },
    { id: 'derma', nombre: "Dermatología", descripcion: "Cuidado de la piel", img: "imagenes/dermatologuia.png" },
    { id: 'medi',  nombre: "Medicina General", descripcion: "Atención primaria", img: "imagenes/medicina-general.jpg" },
    { id: 'trauma', nombre: "Traumatología", descripcion: "Huesos y músculos", img: "imagenes/Traumatologia.jpg" },
    { id: 'neuro', nombre: "Neurología", descripcion: "Sistema nervioso", img: "imagenes/cerebro.jpg" },
    { id: 'odonto', nombre: "Odontología", descripcion: "Salud dental", img: "imagenes/diente.png" }
  ];

  // --- 2. DOCTORES ---
  const baseDoctores = [
      { nombre: "Juan Pérez", apellido: "Salas", especialidadId: "cardio", especialidad: "Cardiología" },
      { nombre: "Maria Gomez", apellido: "López", especialidadId: "cardio", especialidad: "Cardiología" },
      { nombre: "Luis Alcala", apellido: "Diaz", especialidadId: "pedia", especialidad: "Pediatría" },
      { nombre: "Ana Torres", apellido: "Vargas", especialidadId: "derma", especialidad: "Dermatología" },
      { nombre: "Carlos Ruiz", apellido: "Castro", especialidadId: "medi", especialidad: "Medicina General" },
      { nombre: "Pedro Soto", apellido: "Poma", especialidadId: "trauma", especialidad: "Traumatología" },
      { nombre: "Elena Quispe", apellido: "Mamani", especialidadId: "neuro", especialidad: "Neurología" },
      { nombre: "Sofía Méndez", apellido: "Ríos", especialidadId: "odonto", especialidad: "Odontología" }
  ];

  // --- FUNCIONES DE AYUDA ---
  function exists(key){ return localStorage.getItem(key) !== null; }
  function save(key, data){ localStorage.setItem(key, JSON.stringify(data)); }
  function load(key){ return JSON.parse(localStorage.getItem(key) || 'null'); }
  function escapeHtml(text) {
    if (!text) return text;
    return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }

  // --- CARGA INICIAL (AUTOREPARACIÓN) ---
  function cargarIniciales(){
    // FORZAMOS LA ACTUALIZACIÓN:
    // Siempre guardamos la lista baseEspecialidades para asegurar que las imágenes sean las correctas
    save(KEY_ESP, baseEspecialidades);
    
    // Doctores: Si no existen, los creamos
    if(!exists(KEY_DOC) || load(KEY_DOC).length === 0) {
        save(KEY_DOC, baseDoctores);
    }
    
    // Usuario Admin
    if(!exists(KEY_USERS)){
      save(KEY_USERS, [{ usuario: "admin", password: "admin123", nombre: "Admin", isAdmin: true }]);
    }
  }

  // --- RENDER HEADER ---
  function renderHeaderUser(){
    const area = document.getElementById('user-area');
    const navReserva = document.getElementById('nav-reserva');
    const current = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if(navReserva) navReserva.style.display = current ? 'block' : 'none';

    if(area){
      if(current){
        area.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="color: white; font-size: 14px;">Hola, <strong>${escapeHtml(current.nombre)}</strong></span>
                <button id="btn-logout-global" style="background:rgba(255,255,255,0.2); border:1px solid white; color:white; padding:5px 10px; border-radius:15px; cursor:pointer; font-size:12px;">Salir</button>
            </div>`;
        document.getElementById("btn-logout-global")?.addEventListener("click", () => {
            if(confirm("¿Cerrar sesión?")){ localStorage.removeItem('currentUser'); location.href='index.html'; }
        });
      } else {
        area.innerHTML = `<button onclick="openModal('login')" class="btn-login-header">INICIAR SESIÓN</button> <button onclick="openModal('register')" class="btn-register-header">REGÍSTRATE</button>`;
      }
    }
    const adminSpan = document.getElementById('admin-user-label');
    if(adminSpan && current) adminSpan.textContent = current.usuario;
  }

  // --- RENDER ESPECIALIDADES ---
  function renderEspecialidadesPage(){
      const cont = document.getElementById("lista-especialidades");
      if(cont){
         const esp = load(KEY_ESP) || [];
         if (esp.length === 0) cont.innerHTML = "<p>No hay especialidades.</p>";
         else cont.innerHTML = esp.map(e => `
             <div class="card hover-effect">
               <img src="${e.img}" alt="${escapeHtml(e.nombre)}" onerror="this.style.display='none'">
               <h3>${escapeHtml(e.nombre)}</h3>
               <p>${escapeHtml(e.descripcion)}</p>
             </div>`).join("");
      }
  }

  // --- INICIALIZACIÓN ---
  window.ClinicData = {
    init: function(){
      cargarIniciales();
      renderHeaderUser();
      renderEspecialidadesPage();
      initCookies();
    }
  };

  function initCookies() {
      const banner = document.getElementById('cookie-banner');
      if (!localStorage.getItem('cookiesAccepted')) setTimeout(() => banner?.classList.add('show'), 1000);
      document.getElementById('btn-accept-cookies')?.addEventListener('click', () => {
          localStorage.setItem('cookiesAccepted', 'true');
          banner?.classList.remove('show');
      });
  }

  document.addEventListener('DOMContentLoaded', () => { if(window.ClinicData) window.ClinicData.init(); });
})();