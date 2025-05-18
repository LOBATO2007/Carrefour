let idCarrefourEnEdicion = null;
document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://hsmwgqfdlbhafwnzoouk.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbXdncWZkbGJoYWZ3bnpvb3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjcxOTcsImV4cCI6MjA2MTYwMzE5N30.nORzvneJ7tdi98NK_d4aPGEV2qBYJvuJRzbxYnJTLOs';
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey); 

  await cargarCarrefour(supabaseClient); 
  await cargarCategorias(supabaseClient);

  // Seleccionamos el formulario por su id
const formularioCarrefour = document.getElementById('formularioCarrefour');
// Esta variable indica si estamos editando una tarea (contiene su id) o insertando una nueva (null)


// Capturamos el evento "submit" del formulario
formularioCarrefour.addEventListener('submit', async (event) => {
  event.preventDefault(); // Evita que la página se recargue
  await guardarCarrefour(supabaseClient);  // Llama a la función que guarda la tarea
  formularioCarrefour.reset(); // Limpia los campos del formulario


  botonCancelar.addEventListener('click', () => {
    // Cancelamos el modo edición
    idCarrefourEnEdicion = null;
  
    // Limpiamos el formulario
    formularioCarrefour.reset();
  
    // Restauramos el aspecto del botón principal
    botonGuardar.textContent = "Guardar carrefour";
    botonCancelar.style.display = "none";
  });
});


  
});

async function eliminarCarrefour(id, supabase) {
    const { error } = await supabase
      .from('carrefour')
      .delete()
      .eq('id', id); // Elimina la tarea cuyo ID coincida
  
    if (error) {
      console.error('Error al eliminar carrefour:', error.message);
      return;
    }
  
    // Volvemos a cargar la lista para que desaparezca la tarea eliminada
    await cargarCarrefour(supabase);
  }

  async function guardarCarrefour(supabase) {
    // Recogemos los datos del formulario
    const nuevaCarrefour = {
      titulo: formularioCarrefour.titulo.value,
      descripcion: formularioCarrefour.descripcion.value,
      fecha: formularioCarrefour.fecha.value || null,
      hora: formularioCarrefour.hora.value || null,
      prioridad: parseInt(formularioCarrefour.prioridad.value),
      completada: formularioCarrefour.completada.checked,
      categoria_id: formularioCarrefour.categoria.value || null
    };
  
    let resultado;
  
    if (idCarrefourEnEdicion) {
      // Estamos editando una tarea existente
      resultado = await supabase
        .from('carrefour')
        .update(nuevaCarrefour)
        .eq('id', idCarrefourEnEdicion);
  
      // Salimos del modo edición
      idCarrefourEnEdicion = null;
    } else {
      // Estamos insertando una tarea nueva
      resultado = await supabase
        .from('carrefour')
        .insert([nuevaCarrefour]);
    }
  
    if (resultado.error) {
      console.error('Error al guardar carrefour:', resultado.error.message);
      return;
    }
  
    // Reiniciamos el formulario y el aspecto visual
    formularioCarrefour.reset();
    botonGuardar.textContent = "Guardar carrefour";
    botonCancelar.style.display = "none";
  
    await cargarCarrefour(supabase);
  }

async function cargarCarrefour(supabase) {
    const listadoCarrefour = document.getElementById('listadoCarrefour');
  
    const { data: carrefour, error } = await supabase
      .from('carrefour')
      .select('*, categorias(nombre)');
  
    if (error) {
      listadoCarrefour.innerHTML = '<p>Error al cargar carrefour.</p>';
      console.error(error);
      return;
    }
  
    listadoCarrefour.innerHTML = ''; // Limpiamos la vista anterior
  
    carrefour.forEach(carrefour => {
        // Creamos un contenedor div para cada tarea
        const contenedor = document.createElement('div');
      
        // Creamos el párrafo con el título de la tarea
        const hTitulo = document.createElement('h2');
        hTitulo.textContent = carrefour.titulo;

        const pDescripcion = document.createElement('p');
        pDescripcion.textContent = carrefour.descripcion;

        const pFecha = document.createElement('p');
        pFecha.textContent = carrefour.fecha;

        const pHora = document.createElement('p');
        pHora.textContent = carrefour.hora;

        const pPrioridad = document.createElement('p');
        pPrioridad.textContent = carrefour.prioridad;

        const pCategoria = document.createElement('p');
        // La información de la categoría viene en un objeto anidado 'categorias' si hay relación
        // tarea.categorias será null si la tarea no tiene categoria_id asignado o si no se pudo resolver la relación
        pCategoria.textContent = `Categoría: ${carrefour.categorias ? carrefour.categorias.nombre : 'Sin categoría'}`;

    
      
        // Botón para eliminar la tarea
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.addEventListener('click', async () => {
          await eliminarCarrefour(carrefour.id, supabase);
        });
      
        // Botón para editar la tarea
        const botonEditar = document.createElement('button');
        botonEditar.textContent = 'Editar';
        botonEditar.addEventListener('click', () => {
          // Activamos el modo edición guardando el ID de la tarea
          idCarrefourEnEdicion = carrefour.id;
      
          // Rellenamos el formulario con los datos de la tarea
          formularioCarrefour.titulo.value = carrefour.titulo;
          formularioCarrefour.value = carrefour.descripcion || '';
          formularioCarrefour.fecha.value = carrefour.fecha || '';
          formularioCarrefour.hora.value = carrefour.hora || '';
          formularioCarrefour.prioridad.value = carrefour.prioridad || '';
          formularioCarrefour.completada.checked = carrefour.completada || false;
          formularioCarrefour.categoria.value = carrefour.categoria_id || '';
      
          // Cambiamos los elementos visuales del formulario
          botonGuardar.textContent = "Guardar cambios";
          botonCancelar.style.display = "inline-block";
        });
      
        // Añadimos los elementos al contenedor y este al listado
        contenedor.appendChild(hTitulo);
        contenedor.appendChild(pDescripcion);
        contenedor.appendChild(pFecha);
        contenedor.appendChild(pHora);
        contenedor.appendChild(pPrioridad);
        contenedor.appendChild(botonEditar);
        contenedor.appendChild(botonEliminar);
        contenedor.appendChild(pCategoria); // Añadimos el nuevo párrafo de categoría
        listadoCarrefour.appendChild(contenedor);
        
     
     
      });
  }


  async function cargarCategorias(supabase) {
    const selectCategoria = document.getElementById('categoria');
    // Asumiendo que RLS está desactivado para desarrollo en la tabla 'categorias'
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('*'); // Obtenemos todas las categorías
  
    if (error) {
      console.error('Error al cargar categorías:', error.message);
      // Opcional: mostrar un mensaje de error al usuario
      return;
    }
  
    console.log('Categorías cargadas:', categorias);
  
    // Limpiamos las opciones existentes, excepto la primera (la de "Seleccione...")
    selectCategoria.innerHTML = '<option value="">-- Seleccione una categoría --</option>';
  
    // Añadimos las categorías obtenidas como opciones al select
    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id; // El valor de la opción será el UUID de la categoría
      option.textContent = categoria.nombre; // El texto visible será el nombre de la categoría
      selectCategoria.appendChild(option);
    });
  }
 document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.backgroundColor = "#F0F8FF"
document.querySelectorAll("h1").forEach(h1 => {
  h1.style.color = "green";
  h1.style.textDecoration = "underline";
});
document.querySelectorAll("p").forEach(p => {
  p.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
});

 document.addEventListener("DOMContentLoaded", () => {
  // Paleta de colores corporativa
  const primaryColor = "#0050A0";      // Azul oscuro
  const secondaryColor = "#F0F2F5";    // Fondo suave
  const accentColor = "#0094FF";       // Azul claro
  const textColor = "#333";

  // Estilos al body
  document.body.style.margin = "0";
  document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  document.body.style.backgroundColor = secondaryColor;
  document.body.style.color = textColor;

  // Formulario
  const form = document.getElementById("formularioCarrefour");
  form.style.maxWidth = "500px";
  form.style.margin = "40px auto";
  form.style.padding = "30px";
  form.style.backgroundColor = "#fff";
  form.style.border = "1px solid #dcdcdc";
  form.style.borderRadius = "8px";
  form.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "15px";

  // Inputs y selects
  form.querySelectorAll("input, select").forEach(el => {
    el.style.padding = "12px";
    el.style.border = "1px solid #ccc";
    el.style.borderRadius = "4px";
    el.style.fontSize = "14px";
    el.style.outline = "none";
    el.addEventListener("focus", () => {
      el.style.borderColor = accentColor;
      el.style.boxShadow = "0 0 4px rgba(0,148,255,0.4)";
    });
    el.addEventListener("blur", () => {
      el.style.borderColor = "#ccc";
      el.style.boxShadow = "none";
    });
  });

  // Botones
  const estiloBoton = (btn, color = primaryColor) => {
    btn.style.padding = "12px";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.backgroundColor = color;
    btn.style.color = "#fff";
    btn.style.fontWeight = "600";
    btn.style.fontSize = "14px";
    btn.style.cursor = "pointer";
    btn.style.transition = "background-color 0.3s ease";

    btn.addEventListener("mouseover", () => {
      btn.style.backgroundColor = "#003f85";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.backgroundColor = color;
    });
  };

  estiloBoton(document.getElementById("botonGuardar"));
  estiloBoton(document.getElementById("botonCancelar"), "#6c757d");

  // Título principal
  const h1 = document.querySelector("h1");
  h1.style.textAlign = "center";
  h1.style.marginTop = "20px";
  h1.style.fontSize = "28px";
  h1.style.color = primaryColor;

  // Contenedor del listado
  const listado = document.getElementById("listadoCarrefour");
  listado.style.maxWidth = "700px";
  listado.style.margin = "20px auto";
  listado.style.backgroundColor = "#fff";
  listado.style.border = "1px solid #e0e0e0";
  listado.style.borderRadius = "6px";
  listado.style.padding = "20px";
  listado.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";

  // Rellenar opciones de categoría (simulado)
  const categorias = ["Electrónica", "Alimentos", "Hogar", "Moda", "Juguetes"];
  const selectCategoria = document.getElementById("categoria");
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.toLowerCase();
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });
});


  
