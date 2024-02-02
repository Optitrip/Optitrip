import { useState, createContext, useEffect, useContext, useRef } from 'react'
import './App.css'
import './style.css'
import * as here from './here.js'; 
var API_KEY="IA6wsOsWVEGNVl1rjQ8REXSMmQCkW5sfBpkGL4I1kng";
const OpenModalContext = createContext(null);
var avoid_zone_index=0;
var avoid_zone_props=null;
var default_state={
    created:false,
    modals_opened:[],
    current_position:{
        lat:0,
        lng:0
    },
    destinations:[],
    transportation:"",
    type_of_truck:"Trailer",
    number_of_axles:"two_axle",
    type_of_trailer:"Remolque",
    number_of_trailers:"Simple",
    time:"",
    time_type:"Salir ahora",
    mode:"",
    traffic:true,
    avoid_parameters:[],
    avoid_highways:[],
    avoid_zones:[],
    edit_avoid_zone:0,
    avoid_zone_event_listener:false,
    response:"",
    incorrect:false,
    score:0,
    modal_opened:false,
    modal_parameter_opened:"destinations_parameter",
    ephemiral_marker:[]
};
var platform = new H.service.Platform({
    'apikey': 'IA6wsOsWVEGNVl1rjQ8REXSMmQCkW5sfBpkGL4I1kng'
});
var defaultLayers = platform.createDefaultLayers();
var map = new H.Map(document.getElementById('map'),
defaultLayers.vector.normal.map,{
center: {lat: 21.12908,lng:-101.685086},
zoom: 13,
pixelRatio: window.devicePixelRatio || 1
});
var mapEvents = new H.mapevents.MapEvents(map);
// add behavior control
var behavior = new H.mapevents.Behavior(mapEvents);
window.addEventListener('resize',() => map.getViewPort().resize());
var ui = H.ui.UI.createDefault(map,defaultLayers);
function moveMapToPlace(map,lat,lon){
    map.setCenter({lat: lat,lng: lon});
    map.setZoom(18);
}  

export default function App(props) {
    const[state, setState]=useState(default_state)
    useEffect(() => {
        map.addEventListener('contextmenu', handleContextMenu, false);
        return () => {
            map.removeEventListener('contextmenu', handleContextMenu, false);
        };
        
        
    }, [map]);
    const handleContextMenu = (ev) => {
        if(confirm("¿Deseas agregar este punto a tu ruta?")){
            var pos = map.screenToGeo(ev.viewportX, ev.viewportY);
            addToDestinations(map, pos.lat, pos.lng);
        }

    };
    const openModal = (modal_opened, modal_parameter_opened=state.modal_parameter_opened) => {
        setState(prevState => ({ ...prevState, modal_opened: modal_opened, modal_parameter_opened:modal_parameter_opened}));
    }
    const deleteState=()=>{
        setState(default_state);
    }
    const createState=()=>{
        setState({...state, created:true}); 
        openModal(true, "destinations_parameter");
    }
    const changeDestination=(index,lat, lng)=>{
        var destinations=state.destinations;
        destinations[index].string=`${lat},${lng}`;
        destinations[index].marker.setGeometry({lat:lat, lng:lng});   
        setState(prevState => ({ ...prevState, destinations: destinations}));     
    }
    function reverseGeocoding(lat, lng, index){
    fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=es-MX&apiKey=${API_KEY}`)
        .then(response => response.json())
        .then(data=>{
            var destinations=state.destinations;
            destinations[index].name=data["items"][0]["address"]["label"];
            setState(prevState => ({ ...prevState,
                destinations: destinations
            }));
        });
    }
    function createMarker(map, lat, lng, index, destinations, color) {
        if (!destinations[index]) {
            destinations.push({});
        }
        else{
            map.removeObject(destinations[index].marker)
            destinations[index]={};
        }
        var marker=new H.map.Marker({lat:lat, lng:lng, }, {
        volatility: true,
        icon:new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="32" height="32" viewBox="0 0 263.335 263.335" style="enable-background:new 0 0 263.335 263.335;" xml:space="preserve">
        <g>
            <g xmlns="http://www.w3.org/2000/svg">
                <path d="M40.479,159.021c21.032,39.992,49.879,74.22,85.732,101.756c0.656,0.747,1.473,1.382,2.394,1.839   c0.838-0.396,1.57-0.962,2.178-1.647c80.218-61.433,95.861-125.824,96.44-128.34c2.366-9.017,3.57-18.055,3.57-26.864    C237.389,47.429,189.957,0,131.665,0C73.369,0,25.946,47.424,25.946,105.723c0,8.636,1.148,17.469,3.412,26.28" fill="${color}"/>
            <text x="80" y="130" font-family="sans-serif" font-size="5em" fill="white"></text>
            </g>
        </g></svg>`, {size: {w: 32, h: 32}})
        });
        marker.draggable = true;
        map.addObject(marker);
        var destination ={string:`${lat},${lng}`, marker:marker, lat:lat, lng:lng};
        destinations[index]=destination;
        reverseGeocoding(lat, lng, index);
        setState(prevState => ({ 
            ...prevState, 
            destinations: destinations
        }));
        map.addEventListener('dragstart', function(ev) {
            var target = ev.target;
            var pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
                var targetPosition = map.geoToScreen(target.getGeometry());
                target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
                behavior.disable();
            }
        }, false);

        map.addEventListener('dragend', function(ev) {
        var target = ev.target;
        if (target instanceof H.map.Marker) {
            behavior.enable();
            var newPosition = target.getGeometry();
            if (target==marker) {
                var latitude = newPosition.lat;
                var longitude = newPosition.lng;
                destination.string=`${latitude},${longitude}`;
                setState(prevState => ({ ...prevState, destinations: destinations}));
                reverseGeocoding(latitude, longitude, index)
            }
        }
        }, false);
        map.addEventListener('drag', function(ev) {
        var target = ev.target,
        pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
        }
        
        }, false);
        return marker;
    }
    function addToDestinations(map,lat,lng) {
        var destinations=state.destinations;
        var index=destinations.length;
        if(index==0){
            var marker = createMarker(map, lat, lng, index, destinations, "#007BFF");
        }
        else if (index==1) {
            var marker = createMarker(map, lat, lng, index, destinations, "#DC3545");
        }
        else{
            var marker = createMarker(map, lat, lng, index, destinations, "#DC3545");
            createMarker(map, destinations[index-1].lat, destinations[index-1].lng, index-1, destinations, "#9FA6B2");
        }
        moveMapToPlace(map, lat, lng);
        map.setZoom(18);
        return marker;
    }
    const successCallback = (position) => {
        localStorage.setItem("current_position", JSON.stringify({"lat":position.coords.latitude, "lng":position.coords.longitude}));
        if (state.destinations.length==0) {
            // addToDestinations(map, position.coords.latitude, position.coords.longitude);
        }
        var color="#305fb8";
        var marker=new H.map.Marker({lat:position.coords.latitude, lng:position.coords.longitude, }, {
            volatility: true,
            icon:new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="32" height="32" viewBox="0 0 263.335 263.335" style="enable-background:new 0 0 263.335 263.335;" xml:space="preserve">
            <g>
                <g xmlns="http://www.w3.org/2000/svg">
                    <path d="M40.479,159.021c21.032,39.992,49.879,74.22,85.732,101.756c0.656,0.747,1.473,1.382,2.394,1.839   c0.838-0.396,1.57-0.962,2.178-1.647c80.218-61.433,95.861-125.824,96.44-128.34c2.366-9.017,3.57-18.055,3.57-26.864    C237.389,47.429,189.957,0,131.665,0C73.369,0,25.946,47.424,25.946,105.723c0,8.636,1.148,17.469,3.412,26.28" fill="${color}"/>
                <text x="80" y="130" font-family="sans-serif" font-size="5em" fill="white"></text>
                </g>
            </g></svg>`, {size: {w: 32, h: 32}})
        });
        setTimeout(() => {
            map.addObject(marker);
            setState({
                ...state,
                current_position: {lat:position.coords.latitude, lng:position.coords.longitude},
                ephemiral_marker:[marker]
            })
        }, 1000);
    };
    const errorCallback = (error) => {
        setState(prevState => ({ ...prevState, current_position: {lat:-1, lng:-1} }));
    };
    if (state.current_position.lat===0 && state.current_position.lng===0) {
        if(localStorage.getItem("current_position")){
            var current_position=JSON.parse(localStorage.getItem("current_position"));
            moveMapToPlace(map, current_position.lat, current_position.lng);
            if (state.destinations.length==0) {
                // addToDestinations(map, current_position.lat, current_position.lng);
            }
            map.setZoom(18);
            setState(prevState => ({ ...prevState, current_position: {lat:current_position.lat, lng:current_position.lng} }));
        }
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});    
    }
    return (
        <div>
            <div className="container clearfix" style={{zIndex:3, position:"absolute", top:70, left:200,margin:"10px", width:"500px"}}>
            <SearchComponent state={state} setState={setState} userPosition={state.current_position} addToDestinations={addToDestinations} placeholder="Busca lugares" addPoint={false}/>
            </div>
            <div className="circle-component" style={{zIndex:3, position:"absolute", top:70, left:90, margin:"10px"}}>
                <i onClick={()=>state.created?"":createState()} className={`menu-parameters-icons icon-plus ${state.created?"bg-secondary":"bg-primary"}`}>
                </i>
            </div>
            <div className="circle-component" style={{zIndex:3, position:"absolute", top:130, left:90, margin:"10px"}}>
                <span onClick={()=>state.created?openModal(true, "destinations_parameter"):""} className={`menu-parameters-icons icon-pencil ${state.created?"bg-primary":"bg-secondary"}`}>
                </span>
            </div>
            <div className="circle-component" style={{zIndex:3, position:"absolute", top:190, left:90, margin:"10px"}}>
                <i onClick={()=>state.created?deleteState():""} className={`menu-parameters-icons icon-bin ${state.created?"bg-primary":"bg-secondary"}`}>
                </i>
            </div>
            <OpenModalContext.Provider value={openModal}>
            <MiddleModal open={state.modal_opened} setState={setState} state={state} changeDestination={changeDestination} addToDestinations={addToDestinations} circleComponentId={state.modal_parameter_opened} createMarker={createMarker} deleteState={deleteState}/>
            <SideModal state={state} setState={setState} index={state.edit_avoid_zone}/>
            </OpenModalContext.Provider>
        </div> 
        )
}

function SearchComponent(props) {
    const [search, setSearch]=useState({
        values:[],
        query:"",
        selected_lat_lng:null,
        reply_places:[],
    })
    function updateResponse(event) {
        setSearch({
            ...search,
            query:event.target.value
        })
    }
    function showPlace(addPoint, lat, lng){
        moveMapToPlace(map,lat,lng);
        props.state.ephemiral_marker.forEach(marker => {
            map.removeObject(marker);
        });
        props.setState({
            ...props.state,
            ephemiral_marker:[]
        })
        if (addPoint) {
            props.addToDestinations(map, lat, lng);
        }
        else{
            var color="#03cc00";
            var marker=new H.map.Marker({lat:lat, lng:lng, }, {
                volatility: true,
                icon:new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="32" height="32" viewBox="0 0 263.335 263.335" style="enable-background:new 0 0 263.335 263.335;" xml:space="preserve">
                <g>
                    <g xmlns="http://www.w3.org/2000/svg">
                        <path d="M40.479,159.021c21.032,39.992,49.879,74.22,85.732,101.756c0.656,0.747,1.473,1.382,2.394,1.839   c0.838-0.396,1.57-0.962,2.178-1.647c80.218-61.433,95.861-125.824,96.44-128.34c2.366-9.017,3.57-18.055,3.57-26.864    C237.389,47.429,189.957,0,131.665,0C73.369,0,25.946,47.424,25.946,105.723c0,8.636,1.148,17.469,3.412,26.28" fill="${color}"/>
                    <text x="80" y="130" font-family="sans-serif" font-size="5em" fill="white"></text>
                    </g>
                </g></svg>`, {size: {w: 32, h: 32}})
            });
            map.addObject(marker);
            props.setState({
                ...props.state,
                ephemiral_marker:[marker]
            })
        }
        setSearch({
            ...search,
            reply_places:[]
        })
    }
    function searchApi(){
        var fetch_link="";
        fetch_link=`https://discover.search.hereapi.com/v1/discover?at=${props.userPosition.lat},${props.userPosition.lng}&lang=es&q=${search.query}&apiKey=${API_KEY}`;
        fetch(fetch_link)
        .then(response => response.json())
        .then(data=>{
            let places=[];
            let n=0
            data["items"].forEach(place=>{
                places.push(
                    <button className="btn btn-light border m-1" onClick={()=>showPlace(props.addPoint, place.position.lat, place.position.lng)}>
                    {place.address.label}
                    </button>
                );
                n++;
            })
            setSearch({
                ...search,
                reply_places:places
            })
        });
    }
    return(
        <div style={{display:"flex", justifyContent:"center"}}>
            <input id="query" onKeyUp={updateResponse} type="text" placeholder={props.placeholder} style={{display: 'inline-block', maxWidth:"50vw"}} className="form-control mr-sm-2"/>
            <button onClick={searchApi} type="button" style={{display:'inline-block', marginLeft: '-45px'}} className="btn"><i className="icon-search"></i></button>
            <button onClick={()=>showPlace(props.addPoint, props.userPosition.lat, props.userPosition.lng)} type="button" style={{display:'inline-block', marginLeft: '0px'}} className="btn btn-dark"><i className="icon-location"></i></button>
        <div className="shift_started_modal" style={{display:search.reply_places.length<=0?"none":"block"}}>
            <div className="modal-dialog" role="document">
                <div className="modal-content p-3 rounded-4 shadow">
                    <div className="modal-header border-bottom-0">
                        <h5 className="modal-title">Resultados de busqueda:</h5>
                        <svg className="remove-element btn" style={{opacity:1}} onClick={() => setSearch({...search,reply_places:[]})} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='black'>
                        <path d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/>
                        </svg>
                    </div>
                    <div className="modal-body py-0" style={{maxHeight:500, overflow:"auto"}}>
                        {search.reply_places}
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

function MiddleModal(props) {
    const [modal, setModal]=useState({
        index:0,
    })
    const modals={
        "destinations_parameter":["CREACIÓN DE RUTA","Agregar destinos",<DestinationsModal setState={props.setState} state={props.state} addToDestinations={props.addToDestinations} changeDestination={props.changeDestination} createMarker={props.createMarker}/>],
        "transportation_parameter":["SELECCIÓN DE VEHÍCULO","Selección de transporte",<TransportationModal setState={props.setState} state={props.state}/>],
        "mode_parameter":["PARÁMETROS A EVITAR","¿Qué tan rápido quieres llegar?",<ModeModal setState={props.setState} state={props.state}/>],
        "avoid_parameter":["PROGRAMACIÓN DEL VIAJE","¿Qué quieres evitar?",<AvoidModal setState={props.setState} state={props.state}/>],
        "time_parameter":["TIPO DE VIAJE","¿Cuándo quieres llegar?",<TimeModal setState={props.setState} state={props.state}/>],
        "route_parameter":["TIPO DE VIAJE","¿Cuándo quieres llegar?",<TimeModal setState={props.setState} state={props.state}/>]
    }
    const openModal = useContext(OpenModalContext);
    const move_to_modal=(index)=>{
        switch (index) {
            case -1:
                return;
            case 1:
                if (props.state.destinations.length<2) {
                    alert("Debes agregar al menos dos destinos");
                    return;
                }
                break;
            case 2:
                if (props.state.destinations.length<2||props.state.transportation=="") {
                    alert("Debes escoger un tipo de transporte");
                    return;
                }
                break;
            case 3:
                if (props.state.destinations.length<2||props.state.transportation==""||props.state.mode=="") {
                    alert("Escoge  una forma de viaje")
                    return;
                }
                break;
            case 4:
                if (props.state.destinations.length<2||props.state.transportation==""||props.state.mode=="") {
                    alert("Escoge  una forma de viaje")
                    return;
                }
                break;
            case 5:
                if (props.state.destinations.length<2||props.state.transportation==""||props.state.mode=="") {
                    alert("Escoge  una forma de viaje")
                    return;
                }
                break;
            default:
        }
        setModal({index:index});
        if (!props.state.modals_opened.includes(Object.keys(modals)[index])) {
            props.setState(prevState => ({ ...prevState, modals_opened: [...prevState.modals_opened, Object.keys(modals)[index]]}));
        }
        openModal(true, Object.keys(modals)[index])
    }
    return(
    <div className="shift_started_modal" id="transaction-customers-modal" style={{display: props.open?"block":"none", justifyContent: 'center', alignItems: 'center'}}>
      <div className="modal-dialog " role="document">
        <div className="modal-content p-3 rounded-4 shadow mt-5" style={{display:"inline-block", minWidth:"800px", marginLeft:-150}}>
        <LeftComponents state={props.state} move_to_modal={move_to_modal}/>
        <div className="bg-primary p-1 text-white" style={{position:"absolute", width:"100%", height:"40px", top:"-10px", left:"0", borderRadius:"4px"}}>
        <h4 style={{fontWeight:900}}>{modals[props.circleComponentId][0]}</h4>
        </div>
        <div style={{width:"calc(100% - 60px)", float:"left", marginLeft:10}}>
          <div className="modal-header border-bottom-0 d-flex justify-content-center">
            <h3 className="modal-title" style={{fontFamily:"'Lato', sans-serif"}}>{modals[props.circleComponentId][1]}</h3>
            <i style={{height:40, padding:0, aspectRatio:1, width:40, opacity:1, fontSize:40, color:"white"}} className='remove-element icon-icono-minimizar-ventana' src="/icono minimizar ventana.svg" onClick={()=>openModal(false)} alt="" />
          </div>
          <div className="container modal-body py-0">
            <div style={{backgroundColor:"rgb(140,149,160,0.2)", padding:"10px", borderRadius:"10px", minHeight:"550px"}}>
                {modals[props.circleComponentId][2]}
            </div>
          </div>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-2">
            <button onClick={props.deleteState} type="button" className="btn btn-danger btn-lg px-4 mr-4">Cancelar</button>
            <button onClick={()=>move_to_modal(modal.index-1)} type="button" className="btn btn-secondary btn-lg px-4 mr-4">Atras</button>
            <button onClick={()=>move_to_modal(modal.index+1)} type="button" className="btn btn-primary btn-lg px-4 gap-3 ml-4">Siguiente</button>
        </div>
        </div>
        </div>
        
      </div>
    </div>
    )    
}

function DestinationsModal(props) {
    const eliminateDestination=(index)=>{
        var destinations=props.state.destinations;
        map.removeObject(destinations[index].marker);
        destinations.splice(index, 1);
        props.setState(prevState => ({ ...prevState, destinations: destinations}));
        reorganizaMarkers();
    }
    const reorganizaMarkers=()=>{
        var destinations=props.state.destinations;
        for (let index = 0; index < destinations.length; index++) {
            let color="#9FA6B2";
            if (index==0) {
                color="#007BFF";
            }
            else if(index==destinations.length-1){
                color="#DC3545";
            }
            props.createMarker(map, destinations[index].lat, destinations[index].lng, index, destinations, color);
        }
    }

    const handleMouseUp = (ev, index) => {
        var y_heights=[]
        var children = [].slice.call(document.querySelector('#destinations-divs').children)
        children.forEach(element => {
            y_heights.push(element.getBoundingClientRect().y);
        });
        let offsetY = ev.clientY;
        let new_position=0;
        for (let i = 0; i < y_heights.length; i++) {
            if(offsetY>y_heights[i]){
                new_position=i;
            }
        }
        var destinations=props.state.destinations;
        var temp=destinations[index];
        destinations.splice(index, 1);
        destinations.splice(new_position, 0, temp);
        props.setState(prevState => ({ ...prevState, destinations: destinations}));
        reorganizaMarkers();
    };

    const destinations = () => {
        var destinations = [];
        for (let index = 0; index < props.state.destinations.length; index++) {
            let marker_color = "text-secondary";
            if (index == 0) {
                marker_color = "text-primary";
            } else if (index == props.state.destinations.length - 1) {
                marker_color = "text-danger";
            }
            destinations.push(
                <div onDragEnd={()=>handleMouseUp(event,index)} draggable style={{ display: "flex", cursor: "grab",  alignItems: "center", marginBottom: "15px" }}>
                    <i className={`icon-location m-1 ${marker_color}`} style={{ fontSize: 30 }}></i>
                    <button className='btn btn-light'>
                        <i className="fa-solid fa-grip text-secondary" style={{ fontSize: 25}}></i>
                    </button>
                    <div className="btn btn-light border-dark m-1 d-flex align-items-center">
                    <p style={{width:"calc(100% - 36px)", height:20, overflow:"hidden", margin:0}}>{props.state.destinations[index].name}</p>
                    <button className="btn btn-light border rounded ml-1" onClick={() => eliminateDestination(index)}>X</button>
                    </div>
                </div>
            );
        }
        return destinations;
    }
    return (
        <div style={{display: "flex", alignItems: "center", marginBottom:"15px"}}>
            <div className="form-group w-100">
            <SearchComponent state={props.state} setState={props.setState}  userPosition={props.state.current_position} addToDestinations={props.addToDestinations} placeholder="Seleccionar destino" addPoint={true}/>
            <div id="destinations-divs" className="container border p-3 rounded shadow-lg m-2" style={{backgroundColor:"#EDEEF0", maxHeight:450, overflow:"auto"}}>
                {destinations()}
            </div>
            </div>
        </div>
    )
}

function TransportationModal(props) {
    const car="car";
    const tractorTruck="tractorTruck";
    const truck="truck";
    const train="train";
    const emergency="emergency";
    const motorcycle="motorcycle";
    const pedestrian="pedestrian";
    const type_of_truck_trailer="Trailer";
    const type_of_truck_rigid="Rigido";
    const two_axles="two_axle";
    const three_axles="three_axle";
    const four_axles="four_axle";
    const five_axles="five_axle";
    const six_axles="six_axle";
    const seven_axles="seven_axle";
    const eight_axles="eight_axle";
    const nine_axles="nine_axle";
    const type_of_trailer_trailer="Remolque";
    const type_of_trailer_caravan="Caravan";
    const number_of_trailers_simple="Simple";
    const number_of_trailers_double="Doble";
    const updateTransportation=(vehicle)=>{
        props.setState(prevState => ({ ...prevState, transportation: vehicle}));
    }
    const updateTypeOfTruck=(type_of_truck)=>{
        props.setState(prevState => ({ ...prevState, type_of_truck: type_of_truck}));
    }  
    const updateNumberOfAxles=(number_of_axles)=>{
        props.setState(prevState => ({ ...prevState, number_of_axles: number_of_axles}));
    }
    const updateTypeOfTrailer=(type_of_trailer)=>{
        props.setState(prevState => ({ ...prevState, type_of_trailer: type_of_trailer}));
    }
    const updateNumberOfTrailers=(number_of_trailers)=>{
        props.setState(prevState => ({ ...prevState, number_of_trailers: number_of_trailers}));
    }
    return(
        <div>
        <div style={{display:"flex", justifyContent:"space-between"}}>
            <div onClick={()=>updateTransportation(car)} className={`btn transport-vehicles ${props.state.transportation==car?"btn-primary":""}`}>
            <i className='icon-icono-auto display-4'></i>
            <p>Auto</p>
            </div>
            <div onClick={()=>updateTransportation(motorcycle)} className={`btn transport-vehicles ${props.state.transportation==motorcycle?"btn-primary":""}`}>
            <i className='icon-icono-motocicleta display-4'></i>            <p>Motocicleta</p>
            </div>
            <div onClick={()=>updateTransportation(tractorTruck)} className={`btn transport-vehicles ${props.state.transportation==tractorTruck?"btn-primary":""}`}>
            <i className='icon-Icono-camion display-4'></i>            <p>Camión</p>
        </div>
            <div onClick={()=>updateTransportation(truck)} className={`btn transport-vehicles ${props.state.transportation==truck?"btn-primary":""}`}>
            <i className='icon-icono-autobus display-4'></i>            <p>Autobus</p>
        </div>
            <div onClick={()=>updateTransportation(train)} className={`btn transport-vehicles ${props.state.transportation==train?"btn-primary":""}`}>
            <i className='icon-icono-tren display-4'></i>            <p>Tren</p>
            </div>
            <div onClick={()=>updateTransportation(emergency)} className={`btn transport-vehicles ${props.state.transportation==emergency?"btn-primary":""}`}>
            <i className='icon-icono-emergencia display-4'></i>            <p>Emergencias</p>
        </div>
            <div onClick={()=>updateTransportation(pedestrian)} className={`btn transport-vehicles ${props.state.transportation==pedestrian?"btn-primary":""}`}>
            <i className='icon-icono-peaton display-4'></i>            <p>Peaton</p>
        </div>
        </div>
        <div style={{pointerEvents: `${props.state.transportation=="tractorTruck"?"":"none"}`, opacity:`${props.state.transportation=="tractorTruck"?1:.5}`}}>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex align-items-center text-center'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Tipo de camión:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div onClick={()=>updateTypeOfTruck(type_of_truck_trailer)} className={`vehicles-buttons col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.type_of_truck==type_of_truck_trailer?"text-primary":""}`}>
                    <i className='icon-Trailer' style={{fontSize:30}}></i>
                    Trailer
                    </div>
                <div onClick={()=>updateTypeOfTruck(type_of_truck_rigid)} className={`vehicles-buttons col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.type_of_truck==type_of_truck_rigid?"text-primary":""}`}>
                    <i className='icon-rigido'></i>
                    Rígido
                    </div>
            </div>
        </div>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex align-items-center text-center'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Número de ejes:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div style={{width:"50%"}}>
                     <div onClick={()=>updateNumberOfAxles(two_axles)} className={`col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.number_of_axles==two_axles?"text-primary":""}`}>
                    <i className="icon-eje1"></i>
                    (2)
                </div>
                <div onClick={()=>updateNumberOfAxles(three_axles)} className={`col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.number_of_axles==three_axles?"text-primary":""}`}>
                    <i className="icon-eje2"></i>
                    (3)
                </div>
                <div onClick={()=>updateNumberOfAxles(four_axles)} className={`col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.number_of_axles==four_axles?"text-primary":""}`}>
                <i className="icon-eje3"></i>                    (4)
                </div>
                <div onClick={()=>updateNumberOfAxles(five_axles)} className={`col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.number_of_axles==five_axles?"text-primary":""}`}>
                <i className="icon-eje4"></i>                    (5)
                </div>
                </div>
               <div style={{width:"50%"}}>
                <div onClick={()=>updateNumberOfAxles(six_axles)} className={`col btn m-1 d-flex justify-content-center align-items-center ${props.state.transportation==tractorTruck&&props.state.number_of_axles==six_axles?"text-primary":""}`}>
                <i className="icon-eje5 mr-1" style={{fontSize:21}}></i>                    (6)
                </div>
                <div onClick={()=>updateNumberOfAxles(seven_axles)} className={`col btn  m-1 d-flex justify-content-center align-items-center ${props.state.transportation==tractorTruck&&props.state.number_of_axles==seven_axles?"text-primary":""}`}>
                <i className="icon-eje6 mr-1" style={{fontSize:30}}></i>                    (7)
                </div>
                <div onClick={()=>updateNumberOfAxles(eight_axles)} className={`col btn  m-1 d-flex justify-content-center align-items-center ${props.state.transportation==tractorTruck&&props.state.number_of_axles==eight_axles?"text-primary":""}`}>
                <i className="icon-eje7 mr-1" style={{fontSize:30}}></i>                    (8)
                </div>
                <div onClick={()=>updateNumberOfAxles(nine_axles)} className={`col btn  m-1 d-flex justify-content-center align-items-center ${props.state.transportation==tractorTruck&&props.state.number_of_axles==nine_axles?"text-primary":""}`}>
                <i className="icon-eje8 mr-1" style={{fontSize:30}}></i>                    (9)
                </div>
               </div>
            </div>
        </div>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex align-items-center text-center'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Tipo de remolque:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div onClick={()=>updateTypeOfTrailer(type_of_trailer_trailer)} className={`vehicles-buttons col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.type_of_trailer==type_of_trailer_trailer?"text-primary":""}`}>
                    <i className="icon-Remolque"></i>
                    Remolque
                    </div>
                <div onClick={()=>updateTypeOfTrailer(type_of_trailer_caravan)} className={`vehicles-buttons col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.type_of_trailer==type_of_trailer_caravan?"text-primary":""}`}>
                    <i className="icon-caravan" style={{fontSize:30}}></i>
                    Caravan
                    </div>
            </div>
        </div>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex align-items-center text-center'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Número de remolques:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div onClick={()=>updateNumberOfTrailers(number_of_trailers_simple)} className={`vehicles-buttons col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.number_of_trailers==number_of_trailers_simple?"text-primary":""}`}>
                    <i className="icon-simple"></i>
                    Simple
                    </div>
                <div onClick={()=>updateNumberOfTrailers(number_of_trailers_double)} className={`vehicles-buttons col btn  m-1 ${props.state.transportation==tractorTruck&&props.state.number_of_trailers==number_of_trailers_double?"text-primary":""}`}>
                    <i className="icon-doble-remolque"></i>
                    Doble
                    </div>
            </div>
        </div>
        </div>
        </div>
    )
}

function ModeModal(props) {
    var fast="rapido";
    var short="corto";
    var balanced="balanceado";
    var economic="economico";
    var landscaper="paisajista";
    const updateMode=(mode)=>{
        props.setState(prevState => ({ ...prevState, mode: mode}));
    }  
    const updateTraffic=(boolean)=>{
        props.setState(prevState => ({ ...prevState, traffic: boolean}));
    }  
    return(
        <div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center", flexWrap:"wrap"}}>
            <button onClick={()=>updateMode(fast)} className={`btn btn-primary boton-icono-evitar ${props.state.mode==fast?"active":""}`}><i className='icon-icono-rapido' style={{fontSize:175, marginLeft:-28}}></i><h5 style={{marginTop:-20}}>Rápido</h5></button>
            <button onClick={()=>updateMode(short)} className={`btn btn-primary boton-icono-evitar ${props.state.mode==short?"active":""}`}><i className='icon-icono-corto display-1'></i><h5>Corto</h5></button>
            <button onClick={()=>updateMode(balanced)} className={`btn btn-primary boton-icono-evitar ${props.state.mode==balanced?"active":""}`}><i className='icon-icono-balanceado display-1'></i><h5>Balanceado</h5></button>
            <button onClick={()=>updateMode(economic)} className={`btn btn-primary boton-icono-evitar ${props.state.mode==economic?"active":""}`}><i className='icon-icono-economico display-1'></i><h5>Económico</h5></button>
            <button onClick={()=>updateMode(landscaper)} className={`btn btn-primary boton-icono-evitar ${props.state.mode==landscaper?"active":""}`}><i className='icon-icono-paisajista display-1'></i><h5>Paisajista</h5></button>
        </div>
        <div style={{display:"flex", justifyContent:"flex-end", alignItems:"center"}}>
            <span>Optimizar ruta para el tráfico:</span> 
            <button onClick={()=>updateTraffic(false)} className={`${props.state.traffic?"btn btn-secondary":"btn btn-danger"}`}>No</button>
            <button onClick={()=>updateTraffic(true)} className={`${props.state.traffic?"btn btn-success":"btn btn-secondary"}`}>Si</button>
        </div>
        </div>
        
    )
}
const handleAvoidZoneClick = (ev) => {
    var index=avoid_zone_index;
    var props=avoid_zone_props;
    if (index>=0) {
        var pos = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
        var zones=props.state.avoid_zones;   
        var edit_avoid_zone=index;
        if (index==-1) {
            var lineString = new H.geo.LineString();
            var zone={name:`Zona ${props.state.avoid_zones.length}`, points:[], LineString:lineString};
            zones.push(zone);
            edit_avoid_zone=0;
        }
        else{
            var zone=zones[index];
            try{
                map.removeObject(zone.polygon);
            }
            catch{}
            
        }
        console.log(zone.name)
        zone.points.push([pos.lat, pos.lng]);
        zone.LineString.pushPoint({lat:pos.lat,lng:pos.lng});
        var polygon= new H.map.Polygon(zone.LineString, {
            style: {
            fillColor: '#ee0000',
            strokeColor: '#FF0000',
            lineWidth: 4
            }
        })
        zone.polygon=polygon;
        map.addObject(polygon);
        props.setState(prevState => ({ ...prevState, avoid_zones: zones, edit_avoid_zone:edit_avoid_zone}));
   }
}
function AvoidModal(props) {
    const openModal = useContext(OpenModalContext);
    const onClickEvitar=(value, add)=>{
        var avoid_parameters=props.state.avoid_parameters;
        if (add&&!avoid_parameters.includes(value)){
            avoid_parameters.push(value);
        }
        else if(avoid_parameters.includes(value)&&!add){
            avoid_parameters.splice(avoid_parameters.indexOf(value), 1);
        }
        props.setState(prevState => ({ ...prevState, avoid_parameters: avoid_parameters}));
    }
    const onClickCarretera=(value, add)=>{
        var avoid_highways=props.state.avoid_highways;
        if (add&&!avoid_highways.includes(value)){
            avoid_highways.push(value);
        }
        else if(avoid_highways.includes(value)&&!add){
            avoid_highways.splice(avoid_highways.indexOf(value), 1);
        }
        props.setState(prevState => ({ ...prevState, avoid_highways: avoid_highways}));

    }
    var parameters={
        evitar:{
            labels:["Carreteras de cuota", "Caminos de Tierra", "Ferry", "Giros complicados", "Túneles", "Giros en U"],
            parameters:["Carreteras de cuota", "Caminos de Tierra", "Ferry", "Giros complicados", "Túneles", "Giros en U"],
            onClickFunction:onClickEvitar},
        carretera:{
            labels:["ET", "A", "B", "C", "D"],
            parameters:["ET", "A", "B", "C", "D"],
            onClickFunction:onClickCarretera},
    }
    const makeParameters=(key)=>{
        var parameters_html=[];
        var avoid_list=key=="evitar"?props.state.avoid_parameters:props.state.avoid_highways;
        for (let index = 0; index < parameters[key].parameters.length; index++) {
            parameters_html.push(
                <div style={{display:"flex", alignContent:"center", margin:"5px", width:300, fontSize:15}}>
                    <button style={{height:30, borderRadius:"10px 0 0 10px", minWidth:40}} className={`btn m-0 p-0 ${avoid_list.includes(parameters[key].parameters[index])?"btn-secondary":"btn-danger"}`} onClick={()=>parameters[key].onClickFunction(parameters[key].parameters[index],false)}>No</button>
                    <button style={{height:30, borderRadius:"0px 10px 10px 0px", minWidth:40}} className={`btn m-0 mr-1 p-0 ${avoid_list.includes(parameters[key].parameters[index])?"btn-success":"btn-secondary"}`} onClick={()=>parameters[key].onClickFunction(parameters[key].parameters[index],true)}>Si</button>
                    <h5 className="m-0">
                        {parameters[key].labels[index]}
                    </h5>
                </div>
            )
        }
        parameters_html=
        <div className='container' style={{display:"flex", flexWrap:"wrap",height:130}}>
            {parameters_html}
        </div>
        return parameters_html;
    }
    const editZone=(index)=>{
        var zones=props.state.avoid_zones;
        if (index==-1) {
            var line=new H.geo.LineString();
            var polygon= null;
            zones.push({name:`Zona ${zones.length}`, points:[], LineString:line, polygon:polygon, color:"#ee0000"});
            index=zones.length-1;
        }
        props.setState(prevState => ({ ...prevState, avoid_zones:zones, edit_avoid_zone:index, avoid_zone_event_listener:true}));
        openModal(false);
        console.log(map)
        avoid_zone_index=index;
        avoid_zone_props=props;
        document.querySelector("#avoid_zone_name").value="";
        document.querySelector("#avoid_zone_color_p").innerText=zones[index].color;
        document.querySelector("#avoid_zone_color").value=zones[index].color;
        map.addEventListener('tap',handleAvoidZoneClick, false);
    }
    
    const eliminateZone=(index)=>{
        var avoid_zones=props.state.avoid_zones;
        map.removeObject(avoid_zones[index].polygon);
        avoid_zones.splice(index, 1);
        props.setState(prevState => ({ ...prevState, avoid_zones: avoid_zones}));
    }
    const avoid_zones = () => {
        var zones_html = [];
        for (let index = 0; index < props.state.avoid_zones.length; index++) {
            zones_html.push(
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px", width:"100%"}}>
                    <div style={{width:"calc(100% - 36px)"}} className="btn btn-light border-dark m-1 d-flex align-items-center shadow">
                        <p style={{minHeight:"100%", height:20, overflow:"hidden", margin:0}}>{props.state.avoid_zones[index].name}</p>
                    </div>
                    <button className="btn btn-light border rounded ml-1" onClick={() => eliminateZone(index)}><strong>X</strong></button>
                </div>
            );
        }
        return zones_html;
    }
    return (
        <div>
            <div>
                <h5>Seleccione los parámetros que desee evitar en la ruta</h5>
                {makeParameters("evitar")}
            </div>
            <hr />
            <div>
                <h5>Seleccione los tipos de carretera que desee evitar en la ruta</h5>
                {makeParameters("carretera")}
            </div>
            <hr />
            <div>
                <h5>Dibujar área</h5>
                <div style={{ marginBottom: "15px", float:"right", marginTop:"-40px"}}>
                    <button className="btn btn-light border rounded ml-1" onClick={() => editZone(-1)}><strong>Nuevo +</strong></button>
                </div>
                <div style={{display:"flex",justifyContent:"center", flexDirection:"column",alignContent:"space-around", width:"100%"}}>
                    {avoid_zones()}
                </div>
            </div>
        </div>
    )
}

function SideModal(props) {
    const [color, setColor]=useState("#ffffff");
    const openModal = useContext(OpenModalContext);
    var past_zone={}
    useEffect(() => {
        past_zone=props.state.avoid_zones[props.state.edit_avoid_zone];
    }, [])
    var zone={"name":"", "color":"", "points":""}
    if(props.state.avoid_zones.length>props.index){
        zone=props.state.avoid_zones[props.index]
    }
    var name=zone.name;
    const saveZone=(zone,save)=>{
        var zones=props.state.avoid_zones;
        var name=document.querySelector("#avoid_zone_name").value;
        if (save) {
            if(zone.points.length<3){
                alert("Debes seleccionar al menos tres puntos");
                return;
            }
            if (name=="") {
                alert("Debes seleccionar un nombre");
                return;
            }
            var color=document.querySelector("#avoid_zone_color").value;
            var zone=zones[props.index];
            zone.name=name;
            zone.color=color;
        }
        else{
            console.log(zone)
            map.removeObject(zone.polygon);
            zones.splice(props.index, 1);
            console.log(zones)
        }
        props.setState(prevState => ({ ...prevState, avoid_zones: zones, avoid_zone_event_listener:false}));
        openModal(true, "avoid_parameter")
        map.removeEventListener("tap", handleAvoidZoneClick);
    }
    const points=()=>{
        var points=[];
        try{
        for (let index = 0; index < props.state.avoid_zones[props.state.edit_avoid_zone].points.length; index++) {
            points.push(
                <li>{props.state.avoid_zones[props.state.edit_avoid_zone].points[index]}</li>
            )
        }
        }catch{}
        return points;
    }
    const changeInColor=(event)=>{
        setColor(event.target.value);
        map.removeObject(zone.polygon)
        var polygon= new H.map.Polygon(zone.LineString, {
            style: {
            fillColor: `${event.target.value}`,
            strokeColor: `${event.target.value}`,
            lineWidth: 4,
            strokeOpacity: 0.1,
            fillOpacity: 0.1
            }
        })
        zone.polygon=polygon;
        map.addObject(polygon);
    }
    return (
        <div className='rounded' style={{position:"absolute", top:80, right:10, zIndex:2, backgroundColor:"white", height:600, width:300, padding:10, display:`${props.state.avoid_zone_event_listener?"block":"none"}`}}>
           <div style={{fontWeight:"bold"}}>
           <div className='d-flex justify-content-center align-items-center p-1 m-1' style={{width:"100%"}}>
            <p style={{width:"30%", margin:0}}>Nombre:</p><input style={{width:"70%"}} id="avoid_zone_name" className="form-control required" type="text" required />
            </div>           
            <div className='d-flex justify-content-center align-items-center p-1 m-1' style={{width:"100%"}}>
            <p style={{width:"30%", margin:0}}>Color:</p><p className='p-0 m-0 border border-dark rounded ' style={{width:"70%", fontWeight:"normal"}}><input id="avoid_zone_color" type='color' onInput={(event)=>changeInColor(event)} defaultValue="#ee0000" style={{width:"30px"}}/><span id="avoid_zone_color_p">{color}</span></p>
            </div>
           </div>
            <div className='border rounded p-2' style={{height:450}}>
                <h5>Puntos:</h5>
                <div>
                    <p>Latitud & Longuitud</p>
                    <ul style={{maxHeight:"350px", overflow:"auto"}}>
                        {points()}
                    </ul>
                </div>
            </div>
            <div className='d-flex justify-content-center align-items-center'>
                <button className='btn btn-danger m-1 btn-block' onClick={()=>saveZone(zone,false)}>Eliminar</button>
                <button className='btn btn-primary m-1 btn-block' onClick={()=>saveZone(zone,true)}>Guardar</button>
            </div>
        </div>
    )
}
function TimeModal(props) {
    const values_select_time=[["Salir ahora", "Salir ahora"], ["Llegar a las", "smt"], ["Salir a las", "Salir a las"]];
    const options=()=>{
        var options=[];
        values_select_time.forEach(value=>{
            options.push(
                <option value={value[1]}>{value[0]}</option>
            )
        })

        return options;
    }
    const updateTime=()=>{
        var time=document.getElementById("select-time").value;
        var date=document.getElementById("select-type").value;
        props.setState(prevState => ({ ...prevState, time: time, time_type: date }));
    } 
    return(
        <div>
                <span className="icon"><i className="fas fa-tachometer-alt"></i></span>
                <h4>Tiempo:</h4>
                <select id="select-type" style={{width:"200px"}} className='form-control mb-5' onChange={updateTime}>
                    {options()}
                </select>
                <div style={{display:`${props.state.time_type=="Salir ahora"?"none":"block"}`}}>
                <input id="select-time" onInput={updateTime} className="form-control" type="datetime-local" required />

                </div>
            </div>
    )
}


function CircleComponent(props) {
    const icons_clases={
        "destinations_parameter":`icon-destinos ${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.destinations.length>1?"text-success":"text-secondary"}`,
        "transportation_parameter":`icon-Tipo-de-transporte ${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.destinations.length>1&&props.state.transportation&&props.state.modals_opened.includes("transportation_parameter")?"text-success":"text-secondary"}`,
        "mode_parameter":`icon-tipo-de-viaje ${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.mode&&props.state.destinations.length>1&&props.state.transportation&&props.state.modals_opened.includes("mode_parameter")?"text-success":"text-secondary"}`,
        "avoid_parameter":`icon-evitar ${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.mode&&props.state.destinations.length>1&&props.state.transportation&&props.state.modals_opened.includes("avoid_parameter")?"text-success":"text-secondary"}`,
        "time_parameter":`icon-programar ${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.mode&&props.state.destinations.length>1&&props.state.transportation&&props.state.modals_opened.includes("time_parameter")?"text-success":"text-secondary"}`,
        "ruta_parameter":`icon-ruta ${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.mode&&props.state.destinations.length>1&&props.state.transportation&&props.state.modals_opened.includes("route_parameter")?"text-success":"text-secondary"}`
    }
    return(
        <div className="circle-component" onClick={()=> props.move_to_modal(Object.keys(icons_clases).indexOf(props.id))}>
            <i className={`${icons_clases[props.id]} menu-parameters-icons bg-dark`}></i>
        </div>
    )
}
function LeftComponents(props) {
    return(
        <div style={{width:"50px", float:"left"}}>
            <CircleComponent id="destinations_parameter" state={props.state} move_to_modal={props.move_to_modal}/>
            <CircleComponent id="transportation_parameter" state={props.state} move_to_modal={props.move_to_modal}/>
            <CircleComponent id="mode_parameter" state={props.state} move_to_modal={props.move_to_modal}/>
            <CircleComponent id="avoid_parameter" state={props.state} move_to_modal={props.move_to_modal}/>
            <CircleComponent id="time_parameter" state={props.state} move_to_modal={props.move_to_modal}/>
            <CircleComponent id="ruta_parameter" state={props.state} move_to_modal={props.move_to_modal}/>
        </div>
    )
}

