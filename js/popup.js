document.getElementById('runexec').addEventListener("click", () => {
    let userIP = null;

    const getIP = async() => {
        return await fetch('https://api.ipify.org?format=json')
            .then(response => response.json());
    }

    const getInfo = async(ip) => {
        return await fetch('https://ipwhois.app/json/' + ip + '?lang=es')
            .then(response => response.json());
    }

    getIP().then(response => {
        userIP = response.ip;
        getInfo(userIP).then(location => {
            if (location) {
                var vpn = location.country;
                if (vpn == "Colombia") {
                    sendCBCommandPage("startMensajes", "", "");
                } else {
                    alert("Debes tener una VPN Activa para ejecutar esta extension");
                }
            }
        })
    });
});

document.getElementById('stopexec').addEventListener("click", () => {
    sendCBCommand("stopProcess", "", "");
});

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