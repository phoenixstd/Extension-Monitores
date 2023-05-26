// Configuracion del Dominio
let dominio = "apps.phoenixstd.com";
//let dominio = "pruebas";

let ejecutarExtension = true;

// Proceso Inicial
console.log('INICIANDO BACKGROUND');
console.log(`Proceso Iniciado:  ${getCurrentDateTimeString()}`);


let arrayChatur = [];
let arrayStrip = [];
let cantidadPestañas = 0;
let windowIdModelo = 0;
let tabwindowIdModelo = 0;
let contadorPestañasAbiertas = 0;
let link = "";
var usuariosModelos = [];

/*chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({sede: 0});
})*/

function getCurrentDateTimeString() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
}

chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
    if (msg.txt == "stopProcess") {
        console.log("Se canceló el proceso");
        ejecutarExtension = false;
        chrome.action.setBadgeText({
            text: "OFF",
        });
        return true;
    } else if (msg.txt == "enviarData") {
        usuariosModelos = JSON.parse(msg.param);
        console.log('received in background ');
        cantidadPestañas = usuariosModelos.length;
        console.log(cantidadPestañas);
        console.log(usuariosModelos);

        if (usuariosModelos[0].plataforma == "chaturbate") {
            link = "https://www.cbhours.com/user/" + usuariosModelos[0].user + ".html";
        } else {
            link = "https://www.striphours.com/user/" + usuariosModelos[0].user + ".html";
        }

        chrome.windows.create({
                url: link,
                type: "normal",
                focused: true,
                width: 1500,
                height: 1100
            },
            function(window) {
                windowIdModelo = window.id;
                tabwindowIdModelo = window.tabs[0].id;
                contadorPestañasAbiertas = contadorPestañasAbiertas + 1;
                function abrirPestañas() {
                    traerData();
                };
                chrome.scripting.executeScript({
                    target: { tabId: tabwindowIdModelo },
                    function: abrirPestañas,
                });
            }
        );
    } else if (msg.txt == "limpiarData") {
        arrayChatur = [];
        arrayStrip = [];
    } else if (msg.txt == "siguientePestaña") {
        console.log("Recibido");
        var dataExtraida = msg.param2;

        if (msg.param3 === "Chaturbate") {
            for (i = 0; i < dataExtraida.length; i++) {
                arrayChatur.push(dataExtraida[i]);
            }
        }
        if (msg.param3 === "Strip") {
            for (i = 0; i < dataExtraida.length; i++) {
                arrayStrip.push(dataExtraida[i]);
            }
        }

        if (contadorPestañasAbiertas < cantidadPestañas) {
            console.log(contadorPestañasAbiertas);
            console.log(cantidadPestañas);
            console.log(usuariosModelos);
            if (usuariosModelos[contadorPestañasAbiertas].plataforma == "chaturbate") {
                link = "https://www.cbhours.com/user/" + usuariosModelos[contadorPestañasAbiertas].user + ".html";
            } else {
                link = "https://www.striphours.com/user/" + usuariosModelos[contadorPestañasAbiertas].user + ".html";
            }

            chrome.tabs.create({
                    url: link,
                    "windowId": windowIdModelo,
                    "active": true,
                    "selected": true
                },
                function(windowTab) {
                    contadorPestañasAbiertas = contadorPestañasAbiertas + 1;
                    function abrirPestañas() { 
                        traerData();
                    };
                    chrome.scripting.executeScript({
                        target: { tabId: windowTab.id },
                        function: abrirPestañas
                    });
                }
            );
        } else {
            chrome.windows.remove(windowIdModelo);
            sendResponse({ "finalizado": true });
            console.log("Finalizado");
        }
    } else if (msg.txt == "solicitarData") {
        sendResponse({ "arrayChatur": arrayChatur, "arrayStrip": arrayStrip });
    }
});

function mensajesAlerta(accion, texto){
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, { accion: accion, message: texto, txt:"alertMensaje"});
    });
}