(function () {
    let print = console.log
    window.debug = false
    window.streamer = false

    setTimeout(() => {
        // if (document.querySelector("body > div:nth-child(32)")) document.querySelector("body > div:nth-child(32)").remove()

        let fakeLagging = false
        let packetLimit = 10
        let packetsQueue = []
        let blockSockets

        let sendMessage = (author, content) => {
            let span = document.createElement("span")
            span.style = "color: #e88000;"
            span.innerHTML = fakeLagging ? `&lrm;${content}&lrm;` : `&lrm;${content}&lrm;`
            span.className = "chatMsg"

            let chatItem = document.createElement("div")
            chatItem.innerHTML = `&lrm;${author}&lrm;: `
            chatItem.className = "chatItem"
            chatItem.append(span)

            let chatList = document.querySelector("#chatList")
            let divClass
            if (chatList.lastElementChild) {
                print(chatList.lastElementChild)
                divClass = `chatMsg_${chatList.lastElementChild.className.split("_")[1] + 1}`
            } else {
                divClass = "chatMsg_0"
            }
            let chatMessage = document.createElement("div")
            chatMessage.setAttribute("data-tab", "-1")
            chatMessage.className = divClass
            chatMessage.append(chatItem)

            chatList.appendChild(chatMessage)
        }

        let visible = true
        let menuHTML = ''
        menuHTML += '<div id="menuz" style="background-color: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 7px; position: absolute; top: 30%; left: 1%; font-size: 10px; text-align: center; color: #FFFFFF; z-index: 100;">'
        menuHTML += 'Fake Lag (F): <b style="float: right color: #FF0000" id="status">&nbsp;OFF</b><br>'
        menuHTML += `Lag Power (G-/H+): <b style="float: right "id="packetLimit">&nbsp;${packetLimit}</b><br>`
        menuHTML += `Queued Packets: <b style="float: right" id="packetsQueue">&nbsp;${packetsQueue.length}</b><br>`
        menuHTML += 'Hide Menu (T)<br>'
        menuHTML += 'by ***'
        menuHTML += '</div>'
        let div = document.createElement('div')
        div.innerHTML = menuHTML
        document.body.appendChild(div)

        window.addEventListener('keydown', (event) => {

            if (document.activeElement !== document.body) return

            let char = event.key.toUpperCase()

            switch (char) {
                case 'F':
                    fakeLagging = !fakeLagging
                    let statusText = document.getElementById('status')
                    statusText.innerText = fakeLagging ? 'ON' : 'OFF'
                    statusText.style.color = fakeLagging ? '#00FF00' : '#FF0000'
                    oldKeybind = document.querySelector("#recTimer").innerHTML
                    if (visible) document.querySelector("#recTimer").innerHTML = fakeLagging ? '[T]' : '[V]'
                    break
                case 'G':
                    if (packetLimit <= 0) break
                    packetLimit--
                    document.getElementById('packetLimit').innerHTML = packetLimit
                    if (visible && !streamer) document.querySelector("#recTimer").innerHTML = `[${packetLimit}]`
                    setTimeout(() => {
                        document.querySelector("#recTimer").innerHTML = "[V]"
                    }, 1500)
                    break
                case 'H':
                    if (packetLimit >= 20) break
                    packetLimit++
                    document.getElementById('packetLimit').innerHTML = packetLimit
                    if (visible) document.querySelector("#recTimer").innerHTML = `[${packetLimit}]`
                    setTimeout(() => {
                        document.querySelector("#recTimer").innerHTML = "[V]"
                    }, 1500)
                    break
                case 'T':
                    let menuz = document.getElementById('menuz')
                    menuz.style.visibility = visible ? "hidden" : "visible"
                    visible = !visible
                    break
            }
        })

        window.WebSocket = class extends WebSocket {
            constructor() {
                super(...arguments)
            }
            send(message) {

                if (!this.url.includes("krunker.io/ws?gameId=")) return alert("Couldn't find required socket.")

                let socket = msgpack.decode(message)
                if (debug) print(socket)

                /* 
                socket[5] = [looking coords]
                socket[6] = {jumping (1-9: 1 = pressing space, 0-9: 0 = not pressing space)}
                socket[6] = {chroucing (1-9: 1 = chrouched, 1-9: 0 = standing)}
                socket[6] = {ads (1-6: 1 = ads-ing, 0-6: 0 = not ads-ing}
                */

                /* (8) ['en', Array(30), 16, 18, false, false, false, false] // CLICK TO PLAY PACKET
                    0: "en"
                    1: (30) [2, 2482, [-1, -1], -1, -1, 2, 0, 0, 1, -1, -1, 1, 0, -1, -1, -1, -1, -1, -1, 0, -1, -1, 1, 1, 1, 1, -1, -1, 1, 0]
                    2: 16
                    3: 18
                    4: false
                    5: false
                    6: false
                    7: false
                    length: 8
                */

                if (fakeLagging && packetsQueue.length < packetLimit) {
                    document.getElementById('packetsQueue').innerHTML = packetsQueue.length
                    return packetsQueue.push(message)
                }

                while (packetsQueue.length) {
                    let data = packetsQueue.shift()
                    super.send.apply(this, [data])
                }

                return super.send.apply(this, arguments)
            }

        }

    }, 750)
})();