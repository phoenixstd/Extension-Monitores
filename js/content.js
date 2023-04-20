/*----------------------------------------
        Configuracion del Dominio
----------------------------------------*/
let dominio = "apps.phoenixstd.com";
let url_api = "https://" + dominio + "/api/";
//let url_api = "http://localhost/proyectos/" + dominio + "/api/";
let mensajeText = [];
let tipperPut = [];

async function getMessage(modelo, tipper) {
    try {
        let res = await fetch(url_api+"mensajes_telegram.php?usuario="+tipper+"&modelo="+modelo);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function putTipperSendMessage(modelo, tipper) {
    try {
        const data = {
            nombre: tipper,
            modelo: modelo,
            publicidad: 1
        };

        let res = await fetch(url_api+"tippers.php", {
            body: JSON.stringify(data),
            method: "put"
        });

        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function postTransmision(modelo, estado, plataforma) {
    try {
        var formData = new FormData();
        formData.append('modelo', modelo);
        formData.append('estado', estado);
        formData.append('plataforma', plataforma);
        
        let res = await fetch(url_api+"transmision.php", {
            method: "POST",
            body: formData
        })
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

window.addEventListener('load', (event) => {
    try {
        let perfil = document.querySelector(".user_information_header_username").textContent.toLowerCase();
        //let transmision = document.querySelector(".gender-tab.tabElement.active.tabBorder.activeRoom.tabElementLink").textContent.toLowerCase();
        let url_transmision = window.location.toString();
        if( url_transmision.includes(perfil) && url_transmision.includes("chaturbate.com/b/") ){
            try {
            
                // Selecciona el elemento que contiene los resultados de la consulta
                const targetNode = document;
                // Opciones para el observador (que mutaciones observar)
                const config = { attributes: false, childList: true, subtree: true };

                // Crear una instancia del observador con una función callback
                const observer = new MutationObserver(function(mutationsList, observer) {
                    // Iterar por cada mutación
                    let encontrado = false;
                    for(let mutation of mutationsList) {
                        // Si se agregó un nuevo nodo
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0 && encontrado == false) {
                            // Verificar si el nuevo nodo contiene resultados de la consulta
                            const newNodes = mutation.addedNodes;
                            for (let i = 0; i < newNodes.length; i++) {
                                try {
                                    const queryResult = newNodes[i].querySelectorAll(".hasBg.isTip.roomNotice > div > div");
                                    if (queryResult.length > 0) {
                                        var tipper = queryResult[0].textContent;
                                        console.log(tipper);
                                        encontrado = true;
                                        sendCommand("EnviarTipper", tipper, perfil, "");
                                    }
                                } catch (e) { }
                            }
                        }
                    }
                });

                // Comenzar a observar el nodo objetivo para mutaciones especificadas en la configuración
                observer.observe(targetNode, config);
            } catch (error) { }
            try {
                // Selecciona el elemento que deseas observar
                const elementoObservado = document.querySelector("span.roomStatus");
                var estadoTransmision = "";
                // Crea una instancia de MutationObserver con una función de devolución de llamada
                const observador = new MutationObserver(function(mutations) {
                    mutations.forEach(async function(mutation) {
                        if( mutation.addedNodes.length > 0 ){
                            if( estadoTransmision !== mutation.addedNodes[0].data ){
                                estadoTransmision = mutation.addedNodes[0].data;
                                //alert(estadoTransmision);
                                console.log('Estado de Transmision:'+ estadoTransmision);
                                var textTransmision = await postTransmision(perfil, estadoTransmision, "chaturbate");
                                if( textTransmision["itemCount"] > 0 ){
                                    console.log('Estado de Transmision POST ->'+ estadoTransmision);
                                }
                            } 
                        }
                    });
                });

                // Configura las opciones para el observador (en este caso, observar cambios en el contenido y atributos)
                const opcionesObservador = {
                    childList: true,
                    attributes: true,
                    subtree: true
                };

                // Inicia la observación del elemento observado con las opciones especificadas
                observador.observe(elementoObservado, opcionesObservador);
            } catch (error) { }  
        }
    } catch (error) {}
});

function mensaje(userName, nomTipper) {
    try {
        setTimeout(async () => {
            var msgSaliente = document.querySelectorAll(".me");
            //var msgEntrantes = document.querySelectorAll(".other");
            var alertNotMessage = document.querySelectorAll(".logMessage");
            var contAlerta = 0;
            var contRepetidos = 0;
            var enviado = false;

            for(var i = 0; i < alertNotMessage.length; i++){
                if( alertNotMessage[i].textContent.includes("You must be a supporter, fan club member, moderator, or have received a tip today from this user to send this direct message.") ){
                    contAlerta++;
                }
            }

            if( contAlerta == 0 ){
                if( msgSaliente.length > 0 ){
                    for(var i = 0; i < msgSaliente.length; i++){
                        console.log(msgSaliente[i].textContent);
                        if( msgSaliente[i].textContent.includes("@notonly_friends") ){
                           contRepetidos++;
                        }
                    }
                    if( contRepetidos == 0) {
                        mensajeText = await getMessage(userName, nomTipper);
                        console.log(JSON.stringify(mensajeText));
                        if(mensajeText["itemCount"] > 0){
                            var message = mensajeText["body"]["mensaje"]; 
                            console.log(message);
                            document.querySelector("div.pmWindowInput > textarea.noScrollbar").textContent = message;
                            document.querySelector(".sendButton").click();
                            tipperPut = await putTipperSendMessage(userName, nomTipper);
                            if( mensajeText["itemCount"] > 0 ){
                                enviado = true;
                            }
                        }
                    }
                } else {
                    mensajeText = await getMessage(userName, nomTipper);
                    console.log(JSON.stringify(mensajeText));
                    if(mensajeText["itemCount"] > 0){
                        var message = mensajeText["body"]["mensaje"]; 
                        console.log(message);
                        document.querySelector("div.pmWindowInput > textarea.noScrollbar").textContent = message;
                        document.querySelector(".sendButton").click();
                        tipperPut = await putTipperSendMessage(userName, nomTipper);
                        if( mensajeText["itemCount"] > 0 ){
                            enviado = true;
                        }
                    }
                }
            }

            setTimeout(() => {
                if( enviado ){
                    sendCommand("nextTipper", "enviado", "", "");
                }else{
                    sendCommand("nextTipper", "", "", "");
                }
            }, 2500);
        }, 3000);
    } catch (error) {
        setTimeout(() => {
            sendCommand("nextTipper", "", "", "");
        }, 3000);
    }
}

chrome.runtime.onMessage.addListener(gotMessage);

async function gotMessage(request, sender, sendResponse) {
    if( request.txt == "alertMensaje" ){
        if( request.accion == "ntf" ){
            alert(request.message);
        } else if( request.accion == "finMsg" ){
            alert(request.message);
        }
    }
    if (request.txt == "startMensajes") {
        try {
            var userName = document.querySelector(".user_information_header_username").textContent;
            console.log("Revisando acceso para mensajes");
            let msg = {
                txt: "startMensajes",
                tab: request.tab,
                userName: userName,
                param: request.param,
                param2: request.param2
            }
            chrome.runtime.sendMessage(msg);
        } catch (error) {
            alert("Debes estar logueado en Chaturbate");   
        }
    }
}

function sendCommand(command, param, param2, param3) {
    let msg = {
        txt: command,
        param: param,
        param2: param2,
        param3
    }
    chrome.runtime.sendMessage(msg);
    console.log("¡Mensaje '" + command + "' enviado! tipper => " + msg.param + "   modelo => " + msg.param2);
}