let dominio = "apps.phoenixstd.com";
let url_api = "https://" + dominio + "/api/";
//let url_api = "http://localhost/proyectos/apps.phoenixstd.com/api/";
let api_sedes = url_api + "sedes.php";

let contraseña = "Fenix2023.";

//Codigo a Ejecutar al Cargar la Pagina
let sedes = [];

fetch( api_sedes )
    .then(response => response.json())
    .then(function (json) {
        mostrarSedes(json.body);
    }).catch(error => console.log(error));

    
function mostrarSedes(data) {
    sedes = data;
    let sedeHTML = document.getElementById("sede");    
    sedes.forEach(sede => {
        sedeHTML.innerHTML += "<option value='" + sede.id + "'>" + sede.sede + "</option>";
    });

    chrome.storage.sync.get('sede', ({sede}) => {
        if ( sede !== undefined ){
            var tituloSede = document.getElementById("nombreSede");
            tituloSede.innerHTML = " - Sede " + sedes[sede].sede;
            tituloSede.hidden  = false;
        }else{
            var tituloSede = document.getElementById("nombreSede");
            tituloSede.innerHTML = " Sin Sede";
            tituloSede.hidden  = true;
        }
    });
}

const btnSede = document.getElementById('botonSede');

btnSede.addEventListener("click", () => {
    var password = prompt("Ingrese Contraseña para Ejecutar esta acción");
    if(password == contraseña){
        let idSede = document.getElementById('sede').value;
        chrome.storage.sync.set({sede: idSede});

        var tituloSede = document.getElementById("nombreSede");
        tituloSede.innerHTML = " - Sede " + sedes[idSede].sede;
        tituloSede.hidden  = false;
    }else{
        alert("Contraseña Incorrecta");
    }
});


// -----------------------------------------------------------------------
// Horas de Transmision

let json = [];
let usuario;
let existCargar = !!document.getElementById("cargar");

function fechaFinal() {
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear() + "-" + (month) + "-" + (day);

    var fMA = new Date(today);
    fMA.setDate(fMA.getDate() - 31);
    var dayfMA = ("0" + fMA.getDate()).slice(-2);
    var monthfMA = ("0" + (fMA.getMonth() + 1)).slice(-2);
    var fechMesAtras = fMA.getFullYear() + "-" + (monthfMA) + "-" + (dayfMA);

    var fechafn = document.getElementById('fechaFin');
    fechafn.setAttribute("max", today);
    fechafn.setAttribute("min", fechMesAtras);
    fechafn.setAttribute("value", today);

    var fechaIn = document.getElementById('fechaIni');
    fechaIn.setAttribute("max", today);
    fechaIn.setAttribute("min", fechMesAtras);
    fechaIn.setAttribute("value", fechMesAtras);
}


if (existCargar == true) {
    $("#respuesta").hide();
    fechaFinal();
    // Realiza la condicion de ejecutar el codigo cuando se le dé click al boton de cargar
    document.getElementById('cargar').addEventListener("click", () => {
        var textUsuariosChatur = document.getElementById('usuariosChatur').value;
        var textUsuariosStrip = document.getElementById('usuariosStrip').value;

        var linesChatur = textUsuariosChatur.split('\n');
        for (var i = 0; i < linesChatur.length; i++) {
            if (linesChatur[i] !== "") {
                dataCt = { user: linesChatur[i], plataforma: "chaturbate" };
                json.push(dataCt);
            }
        }

        var linesStrip = textUsuariosStrip.split('\n');
        for (var i = 0; i < linesStrip.length; i++) {
            if (linesStrip[i] !== "") {
                dataSt = { user: linesStrip[i], plataforma: "stripchat" };
                json.push(dataSt);
            }
        }
        console.log(json);
        ejecutarTodo(json);
    });

    document.getElementById('btnDescargarData').addEventListener("click", () => {
        mostrarDatosTraidos("btnNormal");
    });

    document.getElementById('btnDescargarDataExcel').addEventListener("click", () => {
        mostrarDatosTraidos("btnExcel");
    });

    document.getElementById('limpiarDatos').addEventListener("click", () => {
        mostrarDatosTraidos("btnLimpiar");
        sendCBCommand("limpiarData", "", "", "");
    });

    document.getElementById("btnDatosChatur").addEventListener("click", () => {
        if (document.getElementById("btnDatosChatur").value == "on") {
            $("#tablaChatur").hide();
            document.getElementById("btnDatosChatur").value = "off";
            document.getElementById("btnDatosChatur").innerHTML = "Mostrar Datos Chatur";
        } else if (document.getElementById("btnDatosChatur").value == "off") {
            $("#tablaChatur").show();
            document.getElementById("btnDatosChatur").textContent = "Ocultar Datos Chatur";
            document.getElementById("btnDatosChatur").value = "on";
        }

    });

    document.getElementById("btnDatosStrip").addEventListener("click", () => {
        if (document.getElementById("btnDatosStrip").value == "on") {
            $("#tablaStrip").hide();
            document.getElementById("btnDatosStrip").textContent = "Mostrar Datos Strip";
            document.getElementById("btnDatosStrip").value = "off";
        } else if (document.getElementById("btnDatosStrip").value == "off") {
            $("#tablaStrip").show();
            document.getElementById("btnDatosStrip").textContent = "Ocultar Datos Strip";
            document.getElementById("btnDatosStrip").value = "on";
        }
    });

    console.log("Message para solicitar informacion'" + "solicitarData" + "' sent to tab number !");

}

function mostrarDatosTraidos(tipoBoton) {
    let fechaIni = document.getElementById('fechaIni').value;
    let fechaFin = document.getElementById('fechaFin').value;

    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        let msg2 = {
            txt: "solicitarData",
            tab: tabs[0].id
        }
        console.log("solicitarData");
        chrome.runtime.sendMessage(msg2, function(response) {
            var hoy = new Date();
            var fecha = hoy.getDate() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getFullYear() + "_" + hoy.getHours() + '-' + hoy.getMinutes() + '-' + hoy.getSeconds();

            var dataArrayChatur = response.arrayChatur;
            var dataArrayStrip = response.arrayStrip;

            var dataArrayChaturFinal = [];
            var dataArrayStripFinal = [];

            var fechaIniParse = Date.parse(fechaIni);
            var fechaFinParse = Date.parse(fechaFin);

            for (i = 0; i < dataArrayChatur.length; i++) {
                var fechaDato = dataArrayChatur[i].Fecha;
                var fechaDatoParse = Date.parse(fechaDato);
                if (fechaDatoParse >= fechaIniParse && fechaDatoParse <= fechaFinParse) {
                    console.log(fechaDato + "Esta en el rango");
                    dataArrayChaturFinal.push(dataArrayChatur[i]);
                } else {
                    console.log(fechaDato + "No esta en el rango");
                }
            }

            for (j = 0; j < dataArrayStrip.length; j++) {
                var fechaDato = dataArrayStrip[j].Fecha;
                var fechaDatoParse = Date.parse(fechaDato);
                if (fechaDatoParse >= fechaIniParse && fechaDatoParse <= fechaFinParse) {
                    console.log(fechaDato + "Esta en el rango");
                    dataArrayStripFinal.push(dataArrayStrip[j]);
                } else {
                    console.log(fechaDato + "No esta en el rango");
                }
            }

            if (tipoBoton == "btnExcel") {
                var wsCt = XLSX.utils.json_to_sheet(dataArrayChaturFinal); // worksheet
                var wsSt = XLSX.utils.json_to_sheet(dataArrayStripFinal);

                var wb = XLSX.utils.book_new(); // workbook, worksheet

                XLSX.utils.book_append_sheet(wb, wsCt, "Horas Chaturbate");
                XLSX.utils.book_append_sheet(wb, wsSt, "Horas Strip");

                XLSX.writeFile(wb, "Horas Chatur " + fecha + ".xlsx"); // Crear Archivo 
            }
            if (tipoBoton == "btnNormal") {
                console.log(dataArrayChaturFinal);
                console.log(dataArrayStripFinal);

                rellenarTablaChatur(dataArrayChaturFinal);
                rellenarTablaStrip(dataArrayStripFinal);

                $("#respuesta").show();
                //sendCBCommand("crearTabla" , dataArrayChaturFinal, dataArrayStripFinal);

                console.log("Message para solicitar informacion'" + "solicitarData" + "' sent to tab number " + tabs[0].id + "!");
            }
            if (tipoBoton == "btnLimpiar") {
                dataArrayChaturFinal = [];
                dataArrayStripFinal = [];

                if (!!document.getElementById("tChat")) {
                    document.getElementById("tChat").remove();
                }
                if (!!document.getElementById("tStrip")) {
                    document.getElementById("tStrip").remove();
                }
            }
        });
    });
}

function rellenarTablaChatur(datosChat) {
    // Tabla de Stripchat
    var mytable = document.getElementById('tablaChatur');
    var cuerpoTabla = document.createElement('tbody');
    cuerpoTabla.id = "tChat";
    datosChat.forEach(p => {
        var fila = document.createElement('tr');

        var td = document.createElement('td');
        td.innerText = p.Usuario;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Fecha;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Dia;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Transmision;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Plataforma;
        fila.appendChild(td);

        cuerpoTabla.appendChild(fila);
    });

    mytable.appendChild(cuerpoTabla);
}

function rellenarTablaStrip(datosStrip) {
    // Tabla de Stripchat
    var mytable = document.getElementById('tablaStrip');
    var cuerpoTabla = document.createElement('tbody');
    cuerpoTabla.id = "tStrip";

    datosStrip.forEach(p => {
        var fila = document.createElement('tr');

        var td = document.createElement('td');
        td.innerText = p.Usuario;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Fecha;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Dia;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Transmision;
        fila.appendChild(td);

        td = document.createElement('td');
        td.innerText = p.Plataforma;
        fila.appendChild(td);

        cuerpoTabla.appendChild(fila);
    });

    mytable.appendChild(cuerpoTabla);
}


function ejecutarTodo(myArr) {
    let arreDatos = JSON.stringify(myArr);
    sendCommand("enviarData", arreDatos, "");
}

//----------------------------------------------------------------------------


function sendCommand(command, param, param2) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        let msg = {
            txt: command,
            tab: tabs[0].id,
            param,
            param2
        }
        chrome.runtime.sendMessage(msg);
    });
}

function sendCBCommand(command, param1, param2) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        let msg = {
            txt: command,
            tab: tabs[0].id,
            param: tabs[0].url,
            param1: param1
        }
        chrome.runtime.sendMessage(msg);
    });
}

function sendCBCommandPage(command, param1, param2) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        let msg = {
            txt: command,
            tab: tabs[0].id,
            param1,
            param2,
        }
        //chrome.runtime.sendMessage(msg);
        chrome.tabs.sendMessage(tabs[0].id, msg);
        console.log("Mensaje " + command + " " + JSON.stringify(msg) + " enviado!");
    });
}