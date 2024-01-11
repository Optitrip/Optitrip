import { useState, createContext, useEffect, useContext, useRef } from 'react'
import './App.css'

var API_KEY="IA6wsOsWVEGNVl1rjQ8REXSMmQCkW5sfBpkGL4I1kng";
const OpenModalContext = createContext(null);
export default function App(props) {
    const[state, setState]=useState({
        created:false,
        current_position:{
            lat:0,
            lng:0
        },
        destinations:[],
        transportation:"car",
        type_of_truck:"Trailer",
        number_of_axles:"two_axle",
        type_of_trailer:"Remolque",
        number_of_trailers:"Simple",
        time:"",
        mode:"",
        avoid:"",
        response:"",
        incorrect:false,
        score:0,
        modal_opened:false,
        modal_parameter_opened:"destinations_parameter",
        ephemiral_marker:[]
    })
    useEffect(() => {
        const handleContextMenu = (ev) => {
            if(confirm("¿Deseas agregar este punto a tu ruta?")){
                var pos = map.screenToGeo(ev.viewportX, ev.viewportY);
                addToDestinations(map, pos.lat, pos.lng);
            }
        };

        map.addEventListener('contextmenu', handleContextMenu, false);

        return () => {
            map.removeEventListener('contextmenu', handleContextMenu, false);
        };
    }, [map]);
    const openModal = (modal_opened, modal_parameter_opened=state.modal_parameter_opened) => {
        setState(prevState => ({ ...prevState, modal_opened: modal_opened, modal_parameter_opened:modal_parameter_opened}));
    }
    const deleteState=()=>{
        setState({
            created:false,
            current_position:{
                lat:0,
                lng:0
            },
            destinations:[],
            transportation:"",
            type_of_truck:"",
            number_of_axles:"",
            type_of_trailer:"",
            number_of_trailers:"",
            time:"",
            mode:"",
            avoid:"",
            response:"",
            incorrect:false,
            score:0,
            modal_opened:false,
            modal_parameter_opened:"destinations_parameter",
            ephemiral_marker:[]
        });
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
        icon:new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="32" height="32" viewBox="0 0 263.335 263.335" style="enable-background:new 0 0 263.335 263.335;" xml:space="preserve">
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
            addToDestinations(map, position.coords.latitude, position.coords.longitude);
        }
        setState(prevState => ({ ...prevState, current_position: {lat:position.coords.latitude, lng:position.coords.longitude} }));
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
        else{
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});    
        }
    }
    return (
        <div>
            <div className="container clearfix" style={{zIndex:3, position:"absolute", top:70, left:29, margin:"10px"}}>
            <SearchComponent state={state} setState={setState} userPosition={state.current_position} addToDestinations={addToDestinations} placeholder="Busca lugares" addPoint={false}/>
            </div>
            <div className="circle-component" style={{zIndex:3, position:"absolute", top:70, left:90, margin:"10px"}}>
                <i onClick={()=>state.created?"":createState()} className={`menu-parameters-icons fa-solid fa-plus ${state.created?"bg-secondary":"bg-primary"}`}>
                </i>
            </div>
            <div className="circle-component" style={{zIndex:3, position:"absolute", top:130, left:90, margin:"10px"}}>
                <i onClick={()=>state.created?openModal(true, "destinations_parameter"):""} className={`menu-parameters-icons fa-solid fa-pen ${state.created?"bg-primary":"bg-secondary"}`}>
                </i>
            </div>
            <div className="circle-component" style={{zIndex:3, position:"absolute", top:190, left:90, margin:"10px"}}>
                <i onClick={()=>state.created?deleteState():""} className={`menu-parameters-icons fa-solid fa-trash-can ${state.created?"bg-primary":"bg-secondary"}`}>
                </i>
            </div>
            <OpenModalContext.Provider value={openModal}>
            <MiddleModal open={state.modal_opened} setState={setState} state={state} changeDestination={changeDestination} addToDestinations={addToDestinations} circleComponentId={state.modal_parameter_opened} createMarker={createMarker} deleteState={deleteState}/>
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
                icon:new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="32" height="32" viewBox="0 0 263.335 263.335" style="enable-background:new 0 0 263.335 263.335;" xml:space="preserve">
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
            <button onClick={searchApi} type="button" style={{display:'inline-block', marginLeft: '-45px'}} className="btn"><i className="fa-solid fa-search"></i></button>
            <button onClick={()=>showPlace(props.addPoint, props.userPosition.lat, props.userPosition.lng)} type="button" style={{display:'inline-block', marginLeft: '0px'}} className="btn btn-dark"><i className="fas fa-map-marker-alt"></i></button>
        <div className="shift_started_modal" style={{display:search.reply_places.length<=0?"none":"block"}}>
            <div className="modal-dialog" role="document">
                <div className="modal-content p-3 rounded-4 shadow">
                    <div className="modal-header border-bottom-0">
                        <h5 className="modal-title">Resultados de busqueda:</h5>
                        <h4 className="modal-title btn btn-warning">{props.addPoint?"Añadir punto":"Mostrar lugar"}</h4>
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
        "time_parameter":["TIPO DE VIAJE","¿Cuándo quieres llegar?",<TimeModal setState={props.setState} state={props.state}/>]
    }
    const openModal = useContext(OpenModalContext);
    const move_to_modal=(index)=>{
        switch (index) {
            case -1:
                return;
            case 1:
                if (props.state.destinations.length<=1) {
                    alert("Debes agregar al menos dos destinos");
                    return;
                }
                break;
            case 2:
                if (props.state.destinations.length<=1&&props.state.transportation=="") {
                    alert("Debes escoger un tipo de transporte");
                    return;
                }
                break;
            case 3:
                if (props.state.destinations.length<=1&&props.state.transportation==""&&props.state.mode=="") {
                    alert("Escoge  una forma de viaje")
                    return;
                }
                break;
            case 4:
                if (props.state.destinations.length<=1&&props.state.transportation==""&&props.state.mode=="") {
                    alert("Escoge  una forma de viaje")
                    return;
                }
                break;
            case 5:
                if (props.state.destinations.length<=1&&props.state.transportation==""&&props.state.mode=="") {
                    alert("Escoge  una forma de viaje")
                    return;
                }
                break;
            default:
        }
        console.log("index: "+index)
        setModal({index:index});
        openModal(true, Object.keys(modals)[index])
    }
    return(
    <div className="shift_started_modal" id="transaction-customers-modal" style={{display: props.open?"block":"none", justifyContent: 'center', alignItems: 'center'}}>
      <div className="modal-dialog " role="document">
        <div className="modal-content p-3 rounded-4 shadow mt-5" style={{display:"inline-block", minWidth:"700px"}}>
        <LeftComponents state={props.state} move_to_modal={move_to_modal}/>
        <div className="bg-primary p-1 text-white" style={{position:"absolute", width:"100%", height:"40px", top:"-10px", left:"0", borderRadius:"4px"}}>
        <h4 style={{fontWeight:900}}>{modals[props.circleComponentId][0]}</h4>
        </div>
        <div style={{width:"calc(100% - 60px)", float:"left", marginLeft:10}}>
          <div className="modal-header border-bottom-0 d-flex justify-content-center">
            <h3 className="modal-title" style={{fontFamily:"'Lato', sans-serif"}}>{modals[props.circleComponentId][1]}</h3>
            <img style={{height:40, padding:0, aspectRatio:1, width:40, opacity:1}} className='remove-element' src="/icono minimizar ventana.svg" onClick={()=>openModal(false)} alt="" />
          </div>
          <div className="modal-body py-0">
            {modals[props.circleComponentId][2]}
          </div>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
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
                <div onDragEnd={()=>handleMouseUp(event,index)} draggable style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                    <i className={`fa-solid fa-location-dot m-1 ${marker_color}`} style={{ fontSize: 30 }}></i>
                    <button className='btn btn-light'>
                        <i className="fa-solid fa-grip text-secondary" style={{ fontSize: 25 }}></i>
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
            <div id="destinations-divs" className="container border p-3 rounded shadow-lg m-2" style={{backgroundColor:"#EDEEF0"}}>
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
        <div style={{backgroundColor:"#e3e3e3", padding:"10px", borderRadius:"10px"}}>
        <div style={{display:"flex", justifyContent:"space-between"}}>
            <div onClick={()=>updateTransportation(car)} className={`btn transport-vehicles ${props.state.transportation==car?"btn-primary":""}`}>
                <img src="public\icono auto.svg" alt="" height="40" />
            <p>Coche</p>
            </div>
            <div onClick={()=>updateTransportation(tractorTruck)} className={`btn transport-vehicles ${props.state.transportation==tractorTruck?"btn-primary":""}`}>
            <img src="public\icono camion.svg" alt="" height="40"/>
            <p>Camion</p>
            </div>
            <div onClick={()=>updateTransportation(truck)} className={`btn transport-vehicles ${props.state.transportation==truck?"btn-primary":""}`}>
            <img src="public\icono autobus.svg" alt="" height="40"/>
            <p>Autobus</p>
        </div>
            <div onClick={()=>updateTransportation(train)} className={`btn transport-vehicles ${props.state.transportation==train?"btn-primary":""}`}>
            <img src="public\icono tren.svg" alt="" height="40"/>
            <p>Tren</p>
        </div>
            <div onClick={()=>updateTransportation(emergency)} className={`btn transport-vehicles ${props.state.transportation==emergency?"btn-primary":""}`}>
            <img src="public\icono emergencia.svg" alt="" height="40"/>
            <p>Emergencias</p>
            </div>
            <div onClick={()=>updateTransportation(motorcycle)} className={`btn transport-vehicles ${props.state.transportation==motorcycle?"btn-primary":""}`}>
            <img src="public\icono motocicleta.svg" alt="" height="40"/>
            <p>Motocicleta</p>
        </div>
            <div onClick={()=>updateTransportation(pedestrian)} className={`btn transport-vehicles ${props.state.transportation==pedestrian?"btn-primary":""}`}>
            <img src="public\icono peaton.svg" alt="" height="40"/>
            <p>Peaton</p>
        </div>
        </div>
        <div style={{pointerEvents: `${props.state.transportation=="tractorTruck"?"":"none"}`, opacity:`${props.state.transportation=="tractorTruck"?1:.5}`}}>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Tipo de camión:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div onClick={()=>updateTypeOfTruck(type_of_truck_trailer)} className={`col btn border border-dark m-1 ${props.state.type_of_truck==type_of_truck_trailer?"btn-primary":""}`}>
                    <img src="/vehicle/tipo de camion/Trailer.svg" alt="" height={30}/>
                    Trailer
                    </div>
                <div onClick={()=>updateTypeOfTruck(type_of_truck_rigid)} className={`col btn border border-dark m-1 ${props.state.type_of_truck==type_of_truck_rigid?"btn-primary":""}`}>
                    <img src="/vehicle/tipo de camion/rigido.svg" alt="" height={30}/>
                    Rígido
                    </div>
            </div>
        </div>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Número de ejes:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div onClick={()=>updateNumberOfAxles(two_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==two_axles?"btn-primary":""}`}><img src="/eje1.SVG" alt="" height="30"/>(2)</div>
                <div onClick={()=>updateNumberOfAxles(three_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==three_axles?"btn-primary":""}`}><img src="/eje2.SVG" alt="" height="30"/>(3)</div>
                <div onClick={()=>updateNumberOfAxles(four_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==four_axles?"btn-primary":""}`}><img src="/eje3.SVG" alt="" height="30"/>(4)</div>
                <div onClick={()=>updateNumberOfAxles(five_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==five_axles?"btn-primary":""}`}><img src="/eje4.SVG" alt="" height="30"/>(5)</div>
                <div onClick={()=>updateNumberOfAxles(six_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==six_axles?"btn-primary":""}`}><img src="/eje5.SVG" alt="" height="30"/>(6)</div>
                <div onClick={()=>updateNumberOfAxles(seven_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==seven_axles?"btn-primary":""}`}><img src="/eje6.SVG" alt="" height="30"/>(7)</div>
                <div onClick={()=>updateNumberOfAxles(eight_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==eight_axles?"btn-primary":""}`}><img src="/eje7.SVG" alt="" height="30"/>(8)</div>
                <div onClick={()=>updateNumberOfAxles(nine_axles)} className={`col btn border border-dark m-1 ${props.state.number_of_axles==nine_axles?"btn-primary":""}`}><img src="/eje8.SVG" alt="" height="30"/>(9)</div>
            </div>
        </div>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Tipo de remolque:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div onClick={()=>updateTypeOfTrailer(type_of_trailer_trailer)} className={`col btn border border-dark m-1 ${props.state.type_of_trailer==type_of_trailer_trailer?"btn-primary":""}`}>
                    <img src="/vehicle/tipo de remolque/Remolque.svg" alt="" height={40}/>
                    Remolque
                    </div>
                <div onClick={()=>updateTypeOfTrailer(type_of_trailer_caravan)} className={`col btn border border-dark m-1 ${props.state.type_of_trailer==type_of_trailer_caravan?"btn-primary":""}`}>
                    <img src="/vehicle/tipo de remolque/caravan.svg" alt="" height={50}/>
                    Caravan
                    </div>
            </div>
        </div>
        <div className='border border-dark shadow mt-3 rounded p-1 d-flex'>
            <div style={{float:"left", width:"50%"}}>
            <h5>Número de remolques:</h5>
            </div>
            <div className="row" style={{float:"left", width:"50%"}}>
                <div onClick={()=>updateNumberOfTrailers(number_of_trailers_simple)} className={`col btn border border-dark m-1 ${props.state.number_of_trailers==number_of_trailers_simple?"btn-primary":""}`}>
                    <img src="/vehicle/numero de remolques/simple.svg" alt="" height={50}/>
                    Simple
                    </div>
                <div onClick={()=>updateNumberOfTrailers(number_of_trailers_double)} className={`col btn border border-dark m-1 ${props.state.number_of_trailers==number_of_trailers_double?"btn-primary":""}`}>
                    <img src="/vehicle/numero de remolques/doble.svg" alt="" height={50}/>
                    Doble
                    </div>
            </div>
        </div>
        </div>
        </div>
    )
}

function TimeModal(props) {
    const [state, setState]=useState({
        time_type:"departureTime",
    })
    
    return(
        <div>
                <span className="icon"><i className="fas fa-tachometer-alt"></i></span>
                <h4>Tiempo:</h4>
                <input type="radio" name="time_type" value="departureTime" /> <span className="item">Salida</span>
                <input type="radio" name="time_type" value="arrivalTime" /> <span className="item">Llegada</span>
                <input id="departure-time" className="form-control" type="datetime-local" required />
            </div>
    )
}

function ModeModal(props) {
    return(
        <a>
            <span className="icon"><i className="fas fa-tachometer-alt"></i></span>
            <h4>Forma de viaje:</h4>
            <input type="radio" checked className="mode" value="none" name="mode" id=""/><span>Ninguno</span>
            <input type="radio" className="mode" value="fastest" name="mode" id=""/><span>Rápida</span>
            <input type="radio" className="mode" value="shortest" name="mode" id=""/><span>Corta</span>
        </a>
    )
}

function AvoidModal(props) {
    return (
        <div>
    <div>
        <input type="checkbox" className="avoid" value="seasonalClosure" name="avoid" />
        <span>Clausura estacional</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="controlledAccessHighway" name="avoid" />
        <span>Autopista de acceso controlado</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="carShuttleTrain" name="avoid" />
        <span>Cruce con tren</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="dirtRoad" name="avoid" />
        <span>Camino de tierra</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="uTurns" name="avoid" />
        <span>Vuelta en U</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="difficultTurns" name="avoid" />
        <span>Carretera de cobro</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="ferry" name="avoid" />
        <span>Ferry</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="tunnel" name="avoid" />
        <span>Túnel</span>
    </div>
    <div>
        <input type="checkbox" className="avoid" value="tollRoad" name="avoid" />
        <span>Giros complicados</span>
    </div>
</div>
    )
}

function CircleComponent(props) {
    const icons_clases={
        "destinations_parameter":[`${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.destinations.length?"text-success":"text-secondary"}`, "/iconos principales/destinos.svg"],
        "transportation_parameter":[`${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.transportation?"text-success":"text-secondary"}`, "/iconos principales/Tipo de transporte.svg"],
        "mode_parameter":[`${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.mode?"text-success":"text-secondary"}`, "/iconos principales/tipo de viaje.svg"],
        "avoid_parameter":[`${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.avoid?"text-success":"text-secondary"}`, "/iconos principales/evitar.svg"],
        "time_parameter":[`${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.time?"text-success":"text-secondary"}`, "/iconos principales/programar.svg"],
        "ruta_parameter":[`${props.state.modal_parameter_opened==props.id?"text-warning":"text-secondary"} ${props.state.time?"text-success":"text-secondary"}`, "/iconos principales/ruta.svg"]
    }
    return(
        <div className="circle-component" onClick={()=> props.move_to_modal(Object.keys(icons_clases).indexOf(props.id))}>
            <img src={`${icons_clases[props.id][1]}`} className={`${icons_clases[props.id][0]} menu-parameters-icons bg-dark`}></img>
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

