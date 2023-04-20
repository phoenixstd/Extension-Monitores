// Configuracion del Dominio
let dominio = "apps.phoenixstd.com";
//let dominio = "pruebas";

let url_api_tippers = "https://" + dominio + "/api/tippers.php";
let url_api_mensajes = "https://" + dominio + "/api/mensajes_telegram.php";
/*let url_api_tipperspru = "http://localhost/web/" + dominio + "/api/tippers.php";
let url_api_mensajes_telegram = "http://localhost/web/" + dominio + "/api/mensajes_telegram.php";*/

let tippersMensajes = [];
let windowTipper = 0;
let tabWindowTipper = 0;

let userName = "";

let ejecutarExtension = true;
let contPagMensaje = 0;
let contadorMensajes = 0;

// Proceso Inicial
console.log('INICIANDO BACKGROUND');
console.log(`Proceso Iniciado:  ${getCurrentDateTimeString()}`);

function getCurrentDateTimeString() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
}

async function getTippers(modelo) {
    try {
        let res = await fetch(url_api_tippers+"?modelo="+modelo);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
    if (msg.txt == "EnviarTipper") {
        const data = new FormData();
        data.append('nombre', msg.param);
        data.append('modelo', msg.param2);
    
        fetch(url_api_tippers, {
            body: data,
            method: "post",
        })
            .then(response => response.json())
            .then(function(json) {
                if(json["itemCount"] > 0 ){
                    console.log(JSON.stringify(seleccionUsuarios));
                }else{
                    console.log("Ocurrio un error al cargar la base de datos");
                }
            }).catch(error  => console.log(error));
        return true;
    
    } else if (msg.txt == "startMensajes"){
        ejecutarExtension = true;
        chrome.action.setBadgeText({
            text: "ON",
        });
        userName = msg.userName;
        tippersMensajes = await getTippers(userName);
        if(tippersMensajes["itemCount"] > 0 ){
            console.log(JSON.stringify(tippersMensajes["body"]));
            tippersMensajes = tippersMensajes["body"];
            const nombres = tippersMensajes.map(tippers => tippers.nombre);
            //mensajesAlerta("ntf",nombres);
            abrirTipper()
        }else{
            console.log("La modelo no tiene tippers cargados");
            mensajesAlerta("ntf","La modelo no tiene tippers cargados");
        }
        return true;
    
    } else if ( msg.txt == "nextTipper" ){
        console.log(contadorMensajes);
        if( msg.param == "enviado" ){
            contadorMensajes++;
        }
        if( contadorMensajes < 5){
            abrirTipper();
            console.log("Cerrando Ventana " + windowTipper);
            chrome.windows.remove(windowTipper);
        }else{
            mensajesAlerta("finMsg","Ya se cargo el limite de mensajes permitidos por ejecucion");
            setTimeout(() => {
                console.log("Cerrando Ventana " + windowTipper);
                chrome.windows.remove(windowTipper);
            }, 5000);
        }

        /*console.log("Cerrando Ventana " + windowTipper);
        chrome.windows.remove(windowTipper);*/

    } else if (msg.txt == "stopProcess") {
        console.log("Se canceló el proceso");
        ejecutarExtension = false;
        chrome.action.setBadgeText({
            text: "OFF",
        });
        return true;
    }
});

function mensajesAlerta(accion, texto){
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, { accion: accion, message: texto, txt:"alertMensaje"});
    });
}

function abrirTipper(){
    if( contPagMensaje < tippersMensajes.length ){
        var nomTipper = tippersMensajes[contPagMensaje].nombre;
        chrome.windows.create({
            url: "https://chaturbate.com/dm/"+nomTipper,
            type: "normal",
            focused: true,
            height:900,
            width:1200, 
            top:0,
            left:0
        },
            function (window) {
                windowTipper = window.id;
                tabWindowTipper = window.tabs[0].id;
                console.log("Abriendo Ventana " + windowTipper);
                function ejecutar(userName, nomTipper) {
                    mensaje(userName, nomTipper);
                };
                chrome.scripting.executeScript({
                    target: { tabId: tabWindowTipper },
                    function: ejecutar,
                    args: [userName, nomTipper],
                })
            }
        );
        contPagMensaje++;
    }
}