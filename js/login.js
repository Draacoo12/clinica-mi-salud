/* ------------------------------------------------------------------
   LÓGICA DE LOGIN, REGISTRO Y MODALES (ACTUALIZADO CON DNI)
   ------------------------------------------------------------------ */

// 1. FUNCIONES GLOBALES (Para que funcionen los botones del menú)
function openModal(type) {
    closeModals(); 
    if (type === 'login') {
        const m = document.getElementById('modal-login');
        if(m) m.classList.add('open');
    } else if (type === 'register') {
        const m = document.getElementById('modal-register');
        if(m) m.classList.add('open');
    }
}

function closeModals() {
    document.querySelectorAll('.popup').forEach(p => p.classList.remove('open'));
}

function switchModal(to) {
    closeModals();
    setTimeout(() => {
        openModal(to);
    }, 200);
}

// 2. EVENTOS AUTOMÁTICOS (Al cargar la página)
document.addEventListener('DOMContentLoaded', () => {
    
    // A) Hacer que funcionen los botones de cerrar "X"
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // B) Cerrar al hacer clic fuera de la ventana
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('popup')) {
            closeModals();
        }
    });

    // C) Lógica del Formulario
    initForms();
});


// 3. LÓGICA INTERNA DE FORMULARIOS
function initForms(){
  function qs(id){ return document.getElementById(id); }
  function getUsers(){ return JSON.parse(localStorage.getItem('users') || '[]'); }
  function saveUsers(u){ localStorage.setItem('users', JSON.stringify(u)); }
  function setCurrent(user){ localStorage.setItem('currentUser', JSON.stringify(user)); } // Guarda "usuarioLogueado" (currentUser)

  // --- REGISTRO ---
  const btnReg = qs('btn-registrar');
  const msgReg = qs('register-msg');
  const regIsAdminChk = qs('reg-is-admin'); 
  const adminCodeContainer = qs('admin-code-container'); 
  const adminCodeInput = qs('reg-admin-code');           

  // Lógica Visual: Mostrar/Ocultar campo de clave maestra
  if(regIsAdminChk && adminCodeContainer){
      regIsAdminChk.addEventListener('change', function(){
          if(this.checked){
              adminCodeContainer.style.display = 'block'; 
              adminCodeInput.focus();
          } else {
              adminCodeContainer.style.display = 'none';  
              adminCodeInput.value = ""; 
          }
      });
  }

  if(btnReg){
      btnReg.addEventListener('click', function(){
        // 1. OBTENER DATOS (Incluyendo el nuevo DNI)
        const dni = qs('reg-dni').value.trim();       // <--- NUEVO: Captura DNI
        const nombre = qs('reg-nombre').value.trim();
        const apellido = qs('reg-apellido').value.trim();
        const usuario = qs('reg-usuario').value.trim();
        const pass = qs('reg-password').value;
        const pass2 = qs('reg-password2').value;
        
        const wantsAdmin = regIsAdminChk ? regIsAdminChk.checked : false;
        let esAdminReal = false;

        msgReg.innerHTML = '';

        // 2. VALIDACIONES
        if(!nombre || !apellido || !usuario || !pass || !pass2 || !dni){ 
            msgReg.innerHTML = '<div class="msg-error" style="color:red;">Completa todos los campos (incluido DNI)</div>'; return; 
        }
        
        // Validación específica para DNI (8 dígitos)
        if(dni.length !== 8 || isNaN(dni)){
            msgReg.innerHTML = '<div class="msg-error" style="color:red;">El DNI debe tener 8 números exactos</div>'; return; 
        }

        if(pass !== pass2){ 
            msgReg.innerHTML = '<div class="msg-error" style="color:red;">Las contraseñas no coinciden</div>'; return; 
        }

        const users = getUsers();
        // Verificar si usuario o DNI ya existen
        if(users.some(u=> u.usuario.toLowerCase() === usuario.toLowerCase())){ 
            msgReg.innerHTML = '<div class="msg-error" style="color:red;">El nombre de usuario ya existe</div>'; return; 
        }
        if(users.some(u=> u.dni === dni)){ 
            msgReg.innerHTML = '<div class="msg-error" style="color:red;">Este DNI ya está registrado</div>'; return; 
        }

        // SEGURIDAD: Validar clave maestra si quiere ser admin
        if(wantsAdmin){
            const codigo = adminCodeInput.value.trim();
            if(codigo !== "CLINICA2025"){ 
                alert("⛔ CLAVE INCORRECTA. No tienes permiso para crear un administrador.");
                return; 
            }
            esAdminReal = true;
        }

        // 3. GUARDAR USUARIO (Ahora guardamos también el DNI)
        users.push({ 
            dni: dni,          // <--- NUEVO: Guardamos el DNI
            usuario: usuario, 
            password: pass, 
            nombre: nombre, 
            apellido: apellido, 
            isAdmin: esAdminReal 
        });
        saveUsers(users);
        
        alert("Usuario creado con éxito. Ahora inicia sesión.");
        switchModal('login'); 
        
        // Limpiar formulario
        qs('reg-dni').value=''; // <--- Limpiar DNI
        qs('reg-nombre').value=''; qs('reg-apellido').value=''; qs('reg-usuario').value=''; qs('reg-password').value=''; qs('reg-password2').value='';
        if(regIsAdminChk) { regIsAdminChk.checked = false; adminCodeContainer.style.display='none'; adminCodeInput.value=''; }
      });
  }

  // --- LOGIN (PACIENTE) ---
  const btnLogin = qs('btn-login');
  const loginMsg = qs('login-msg');
  
  if(btnLogin){
      btnLogin.addEventListener('click', ()=>{
        const usuario = qs('login-usuario').value.trim();
        const pass = qs('login-password').value;
        
        loginMsg.innerHTML = '';
        if(!usuario || !pass){ 
            loginMsg.innerHTML = '<div class="msg-error" style="color:red;">Completa campos</div>'; return; 
        }
        
        const users = getUsers();
        const found = users.find(u => u.usuario.toLowerCase() === usuario.toLowerCase() && u.password === pass);
        
        if(!found){ 
            loginMsg.innerHTML = '<div class="msg-error" style="color:red;">Credenciales incorrectas</div>'; return; 
        }
        
        setCurrent(found); // Esto guarda al usuario en 'currentUser' para que las reservas sepan quién es
        
        if(found.isAdmin){
          location.href = 'Administracion.html';
        } else {
          location.reload(); 
        }
      });
  }

  // --- LOGIN (ADMINISTRADOR - Botón Rápido) ---
  const btnAdmin = qs('btn-login-admin');
  if(btnAdmin){
    btnAdmin.addEventListener('click', ()=>{
      const users = getUsers();
      let admin = users.find(u=> u.isAdmin && u.usuario === 'admin');
      
      // Crea un admin por defecto si no existe
      if(!admin){
        admin = { usuario:'admin', password:'admin123', nombre:'Administrador', apellido:'', dni:'00000000', isAdmin:true };
        users.push(admin);
        saveUsers(users);
      }

      const pw = prompt('Ingresa la contraseña del admin (Pista: admin123):');
      if(pw === admin.password){
        setCurrent(admin);
        location.href = 'Administracion.html';
      } else {
        if(pw !== null) alert('Contraseña incorrecta');
      }
    });
  }
}