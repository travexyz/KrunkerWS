// ==UserScript==
// @name         Krunker Nasa
// @author       Lemons
// @include      /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?.+)$/
// @run-at       document-start
// @grant        none
// ==/UserScript==

setTimeout(() => {

    var sendQueue = [];

    var nasaFreeze = false;
    var nasaPeek = false;

    var lastPitch;
    var lastYaw;

    window.WebSocket = class extends WebSocket {
        constructor() {
            super(...arguments);
        }
        send(message) {
            if (nasaPeek) return sendQueue.push(message);

            while (sendQueue.length) {
                var data = sendQueue.shift();
                super.send.apply(this, [data]);
            }

            return super.send.apply(this, arguments);
        }
    }

    var push = Array.prototype.push;
    Array.prototype.push = function(data, ...rest) {
        if (data instanceof Array && data.length === 13) {

            var isn = data[0];
            var delta = data[1];
            var pitch = data[2];
            var yaw = data[3];
            var move = data[4];
            var mouseDownL = data[5];
            var mouseDownR = data[6];
            var jump = data[7];
            var crouch = data[8];
            var reload = data[9];

            if (nasaFreeze) {
                if (pitch === lastPitch || yaw === lastYaw) {
                    delta = 0;
                } else {
                    delta = 0.1;
                }
            }

            if (nasaPeek && mouseDownL && !(nasaPeek = false)) {
                var nasa = document.getElementById('nasa');
                nasa.style.color = '#FF0000';
                nasa.innerText = 'OFF';
            }

            lastPitch = pitch;
            lastYaw = yaw;

            data[0] = isn;
            data[1] = delta;
            data[2] = pitch;
            data[3] = yaw;
            data[4] = move;
            data[5] = mouseDownL;
            data[6] = mouseDownR;
            data[7] = jump;
            data[8] = crouch;
            data[9] = reload;
        }

        return push.apply(this, [data, ...rest]);
    }

    var menuHTML = '';
    menuHTML += '<div style="background-color: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 10px; position: absolute; left: 10%; top: 25%; z-index: 999999; color: #FFFFFF;">';
    menuHTML += 'NasaPeek (F): <b style="color: #FF0000;" id="nasa">OFF</b>';
    menuHTML += '<br>';
    menuHTML += 'Freeze (V): <b style="color: #FF0000;" id="freeze">OFF</b>';
    menuHTML += '</div>';

    var div = document.createElement('div');
    div.innerHTML = menuHTML;
    document.body.appendChild(div);

    window.addEventListener('keydown', (event) => {

        if (document.activeElement !== document.body) return;

        var char = event.key.toUpperCase();

        switch (char) {
            case 'F':
                var nasa = document.getElementById('nasa');
                nasa.innerText = (nasaPeek = !nasaPeek) ? 'ON' : 'OFF';
                nasa.style.color = nasaPeek ? '#00FF00' : '#FF0000';
                break;

            case 'V':
                var freeze = document.getElementById('freeze');
                freeze.innerText = (nasaFreeze = !nasaFreeze) ? 'ON' : 'OFF';
                freeze.style.color = nasaFreeze ? '#00FF00' : '#FF0000';
                break;
        }
    });

}, 750);
