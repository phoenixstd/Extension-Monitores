/*----------------------------------------
        Configuracion del Dominio
----------------------------------------*/
let dominio = "apps.phoenixstd.com";
let url_api = "https://" + dominio + "/api/";
//let url_api = "http://localhost/proyectos/" + dominio + "/api/";

async function putSede(sede) {
    try {
        const data = {
            sede: sede
        };

        let res = await fetch(url_api+"sedes.php", {
            body: JSON.stringify(data),
            method: "put"
        });

        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

window.addEventListener('load', (event) => {    
    try {
        let pagina = window.location.hostname;
        if ( pagina.includes("apps.phoenixstd.com") ){
            chrome.storage.sync.get(["sede"]).then((result) => {
                var sede = result.sede;
                actualizarSede(sede);
            });
            setInterval(() => {
                chrome.storage.sync.get(["sede"]).then((result) => {
                    var sede = result.sede;
                    actualizarSede(sede);
                });
            }, 30000);
        }
    } catch (error) { console.log(error); }
});

async function actualizarSede( sede ){
    if( sede !== undefined){
        //alert(sede);
        console.log("Value currently is " + sede);
        var actSede = await putSede(sede);
        if( actSede["itemCount"] > 0 ){
            console.log("Sede actualizada");
        }else{
            console.log("Sin actualizar Sede");
        }
    }
}

chrome.runtime.onMessage.addListener(gotMessage);

async function gotMessage(request, sender, sendResponse) {
    if( request.txt == "alertMensaje" ){
        if ( request.accion == "ntf" ){
            alert(request.message);
        } else if ( request.accion == "finMsg" ){
            alert(request.message);
        }
    }
}

let userPerfil;
let todasHoras = [];
let historicoTiempo = [];

function traerData() {
    alert("Hello MDF");
    if (window.location.host.includes("www.cbhours.com")) {
        setTimeout(function() {
            if (document.querySelector(".activity-logs > p")) {
                userPerfil = document.querySelector(".name-big").textContent;
                todasHoras = document.querySelectorAll(".activity-logs > p");
                for (i = 0; i < todasHoras.length - 1; i++) {
                    var tiempo = todasHoras[i].innerText;
                    var platform = "Chaturbate";
                    informacion(tiempo, platform);
                }
                sendCommand("siguientePestaña", userPerfil, historicoTiempo, "Chaturbate");
            } else {
                sendCommand("siguientePestaña", userPerfil, " ", "Chaturbate");
            }
        }, 4000);
    }

    if (window.location.host.includes("www.striphours.com")) {
        setTimeout(function() {
            if (document.querySelector(".activity-logs > p")) {
                userPerfil = document.querySelector(".name-big").textContent;
                todasHoras = document.querySelectorAll(".activity-logs > p");
                for (i = 0; i < todasHoras.length - 1; i++) {
                    var tiempo = todasHoras[i].innerText;
                    var platform = "StripChat";
                    informacion(tiempo, platform);
                }
                sendCommand("siguientePestaña", userPerfil, historicoTiempo, "Strip");
            } else {
                sendCommand("siguientePestaña", userPerfil, " ", "Strip");
            }
        }, 4000);
    }
}

function informacion(tiempo, platform) {
    var fecha = tiempo.substring(0, 10);
    var dia = tiempo.substring(11, 14);
    var horaTiempo = tiempo.substring(17, 36);
    var hora = horaTiempo.substring(0, 2);
    var minutos = horaTiempo.substring(9, 11);
    var timeParseado = hora + ":" + minutos + ":00";
    historicoTiempo.push({ "Usuario": userPerfil, "Fecha": fecha, "Dia": dia, "Transmision": timeParseado, "Plataforma": platform });
}

function sendCommand(command, param, param2, param3) {
    let msg = {
        txt: command,
        param: param,
        param2: param2,
        param3
    }
    chrome.runtime.sendMessage(msg);
    console.log("¡Mensaje '" + command + "' enviado!");
}