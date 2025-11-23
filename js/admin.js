/* -----------------------------
   1. UTILIDADES (Leer y Guardar datos)
------------------------------ */
function getData(key){
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data){
    localStorage.setItem(key, JSON.stringify(data));
}

/* -----------------------------
   2. GESTIÓN DE ESPECIALIDADES
------------------------------ */
function renderEspecialidades(){
    const lista = document.getElementById("especialidades-list");
    const especialidades = getData("especialidades");

    if(especialidades.length === 0){
        lista.innerHTML = "<p>No hay especialidades registradas.</p>";
        return;
    }

    let html = `<table>
        <thead>
            <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
    `;

    especialidades.forEach((esp, index)=>{
        html += `
            <tr>
                <td><img src="${esp.img || ''}" class="thumb" style="width:50px;height:50px;object-fit:cover;border-radius:4px;"></td>
                <td>${esp.nombre}</td>
                <td>${esp.descripcion}</td>
                <td>
                    <button class="btn btn-secondary" onclick="deleteEspecialidad(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    });

    html += "</tbody></table>";
    lista.innerHTML = html;
    
    // Actualizamos también el select de doctores por si acaso
    loadEspecialidadesEnSelect();
}

// Agregar Especialidad
const btnAddEsp = document.getElementById("btn-add-esp");
if(btnAddEsp){
    btnAddEsp.addEventListener("click", ()=>{
        const nombre = document.getElementById("esp-nombre").value.trim();
        const desc   = document.getElementById("esp-desc").value.trim();
        const inputFile = document.getElementById("esp-img");

        if(!nombre || !desc){ alert("Completa todos los campos"); return; }
        if(inputFile.files.length === 0){ alert("Selecciona una imagen"); return; }

        const file = inputFile.files[0];
        const reader = new FileReader();

        reader.onload = function(e){
            const base64 = e.target.result; 
            const especialidades = getData("especialidades");
            
            // Guardamos ID también para relacionar mejor
            const newId = 'esp' + Date.now();

            especialidades.push({
                id: newId,
                nombre: nombre,
                descripcion: desc,
                img: base64 
            });

            saveData("especialidades", especialidades);
            renderEspecialidades(); // Actualizar tabla
            
            // Limpiar inputs
            document.getElementById("esp-nombre").value = "";
            document.getElementById("esp-desc").value = "";
            inputFile.value = "";
            alert("Especialidad agregada.");
        };
        reader.readAsDataURL(file); 
    });
}

// Eliminar Especialidad
window.deleteEspecialidad = function(index){
    if(!confirm("¿Seguro que quieres eliminar esta especialidad?")) return;
    const especialidades = getData("especialidades");
    especialidades.splice(index, 1);
    saveData("especialidades", especialidades);
    renderEspecialidades();
};


/* -----------------------------
   3. GESTIÓN DE DOCTORES
------------------------------ */

// Cargar el Select (Desplegable)
function loadEspecialidadesEnSelect(){
    const select = document.getElementById("doc-especialidad");
    if(!select) return;

    const especialidades = getData("especialidades");
    select.innerHTML = '<option value="">-- Selecciona Especialidad --</option>';

    especialidades.forEach(esp => {
        const option = document.createElement("option");
        // Usamos ID si existe, si no el nombre
        option.value = esp.id || esp.nombre; 
        option.textContent = esp.nombre;
        select.appendChild(option);
    });
}

// Mostrar lista de doctores (ESTO FALTABA)
function renderDoctores(){
    const lista = document.getElementById("doctores-list");
    const doctores = getData("doctores");
    const especialidades = getData("especialidades");

    if(doctores.length === 0){
        lista.innerHTML = "<p>No hay doctores registrados.</p>";
        return;
    }

    let html = `<table>
        <thead>
            <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
    `;

    doctores.forEach((doc, index)=>{
        // Buscar nombre de especialidad por ID
        const espObj = especialidades.find(e => (e.id === doc.especialidadId) || (e.nombre === doc.especialidadId));
        const nombreEsp = espObj ? espObj.nombre : "Desconocida";

        html += `
            <tr>
                <td><img src="${doc.foto || 'imagenes/dogtores.jpg'}" class="thumb" style="width:50px;height:50px;object-fit:cover;border-radius:50%;"></td>
                <td>${doc.nombre} ${doc.apellido}</td>
                <td>${nombreEsp}</td>
                <td>
                    <button class="btn btn-secondary" onclick="deleteDoctor(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    });

    html += "</tbody></table>";
    lista.innerHTML = html;
}

// Agregar Doctor
const btnAddDoc = document.getElementById("btn-add-doc");
if(btnAddDoc) {
    btnAddDoc.addEventListener("click", () => {
        const nombre = document.getElementById("doc-nombre").value.trim();
        const apellido = document.getElementById("doc-apellido").value.trim();
        const especialidadId = document.getElementById("doc-especialidad").value;
        const inputFile = document.getElementById("doc-img"); // Asegúrate que en HTML sea <input type="file" id="doc-img">

        if (!nombre || !apellido || !especialidadId) {
            alert("Completa nombre, apellido y especialidad");
            return;
        }

        const saveDoctor = (imgBase64) => {
            const doctores = getData("doctores");
            const newId = 'doc' + Date.now();

            doctores.push({
                id: newId,
                nombre: nombre,
                apellido: apellido,
                especialidadId: especialidadId,
                foto: imgBase64 
            });

            saveData("doctores", doctores);
            renderDoctores(); // Actualizar tabla visualmente

            // Limpiar formulario
            document.getElementById("doc-nombre").value = "";
            document.getElementById("doc-apellido").value = "";
            document.getElementById("doc-especialidad").value = "";
            if(inputFile) inputFile.value = "";

            alert("Doctor agregado correctamente.");
        };

        if (inputFile && inputFile.files.length > 0) {
            const file = inputFile.files[0];
            const reader = new FileReader();
            reader.onload = function(e) { saveDoctor(e.target.result); };
            reader.readAsDataURL(file);
        } else {
            saveDoctor(""); // Sin foto
        }
    });
}

// Eliminar Doctor
window.deleteDoctor = function(index){
    if(!confirm("¿Eliminar este doctor?")) return;
    const doctores = getData("doctores");
    doctores.splice(index, 1);
    saveData("doctores", doctores);
    renderDoctores();
};

/* -----------------------------
   4. CERRAR SESIÓN
------------------------------ */
const btnLogoutAdmin = document.getElementById("btn-logout-admin");
if(btnLogoutAdmin){
    btnLogoutAdmin.addEventListener("click", () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'Registro.html'; // O 'index.html' según prefieras
    });
}

/* -----------------------------
   5. NAVEGACIÓN Y CARGA INICIAL
------------------------------ */
document.querySelectorAll(".admin-nav button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        const section = btn.dataset.section;
        document.querySelectorAll("section").forEach(s=> s.classList.add("hidden"));
        
        const activeSection = document.getElementById(`section-${section}`);
        if(activeSection) activeSection.classList.remove("hidden");

        if(section === "especialidades") renderEspecialidades();
        if(section === "doctores") {
            loadEspecialidadesEnSelect();
            renderDoctores();
        }
    });
});

// Cargar nombre del admin al entrar
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(user){
        const label = document.getElementById("admin-username");
        if(label) label.textContent = user.usuario || user.nombre;
    } else {
        // Si no hay usuario logueado, mandar al login (seguridad básica)
        window.location.href = 'Registro.html';
    }
});