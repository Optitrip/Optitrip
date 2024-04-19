// Variable que almacenará las indicaciones de ruta
var indicaciones = [];

// Función para mostrar las indicaciones de la ruta generada
const createIndications = (index) => {
    // Oculta la sección de las rutas generadas
    let div = document.querySelector("#show_routes_div");
    div.style.display = "none";

    // Muestra la sección de las instrucciones a seguir de la ruta generada
    let div_instructions = document.querySelector("#show_instructions_div");
    div_instructions.style.display = "flex";

    // Actualiza los elementos en el div de instrucciones con información de la ruta seleccionada
    div_instructions.querySelector("#show_instructions_from").innerText = indicaciones[index].from.name;
    div_instructions.querySelector("#show_instructions_to").innerText = indicaciones[index].to.name;
    div_instructions.querySelector("#show_instructions_all").innerHTML = "";
    indicaciones[index].instructions.forEach(instruction => {
        div_instructions.querySelector("#show_instructions_all").innerHTML += `<li>${instruction}</li>`;
    })
    div_instructions.querySelector("#show_instructions_time").innerText = `${indicaciones[index].minutes} min`;
    div_instructions.querySelector("#show_instructions_distance").innerText = `${indicaciones[index].distance} km`;
    div_instructions.querySelector("#show_instructions_money").innerText = `$${indicaciones[index].tolls_total}`;
    div_instructions.querySelector("#show_instructions_0").innerText = indicaciones[index].instructions[0];
}

// Función para regresar a la vista de las rutas
const returnToRoutes = () => {
    // Ocultar la sección de las instrucciones a seguir de la ruta generada
    let div_instructions = document.querySelector("#show_instructions_div");
    div_instructions.style.display = "none";

    // Muestra la sección de las rutas generadas
    let div_routes = document.querySelector("#show_routes_div");
    div_routes.style.display = "flex";
}
