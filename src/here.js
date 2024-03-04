var indicaciones=[];

const crearIndicaciones=(index)=>{
    let div=document.querySelector("#show_routes_div");
    div.style.display="none";
    let div_instructions=document.querySelector("#show_instructions_div");
    div_instructions.style.display="flex";
    div_instructions.querySelector("#show_instructions_from").innerText=indicaciones[index].from.name;
    div_instructions.querySelector("#show_instructions_to").innerText=indicaciones[index].to.name;
    div_instructions.querySelector("#show_instructions_all").innerHTML="";
    indicaciones[index].instructions.forEach(instruction=>{
        div_instructions.querySelector("#show_instructions_all").innerHTML+=`<li>${instruction}</li>`;
    })
    div_instructions.querySelector("#show_instructions_time").innerText=`${indicaciones[index].minutes} min`;
    div_instructions.querySelector("#show_instructions_distance").innerText=`${indicaciones[index].distance} km`;
    div_instructions.querySelector("#show_instructions_money").innerText=`$${indicaciones[index].tolls_total}`;
    div_instructions.querySelector("#show_instructions_0").innerText=indicaciones[index].instructions[0];
}

const returnToRoutes=()=>{
    let div_instructions=document.querySelector("#show_instructions_div");
    div_instructions.style.display="none";
    let div_routes=document.querySelector("#show_routes_div");
    div_routes.style.display="flex";
}
