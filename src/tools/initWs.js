
import Cookies from 'js-cookie'
import { base64ToStr } from '@/tools/tool'
import emmiter from '@/mitt/mitt'
let peer = {}
export function initWs(userId){
    if('WebSocket' in window){
        console.log('websocket')
        let ws = new WebSocket("wss://47.120.71.102/wss");
        ws.onopen = function () {
          emmiter.emit('ws_init')
          console.log('websocket open');
          ws.send(JSON.stringify({
            type:'login',
            fromUserId: userId,
          }))
        }
        // ws.onmessage = function (evt) {
        //   console.log('websocket message', evt)
        // }
        ws.onclose = function () {
          console.log('websocket close');
        }
        return ws;
      }else{
        alert('websocket not support')
      }
}

export function closeWs(ws){
    ws.close();
}

export function WebRTCInit(userId,ws){
    if(peer[userId]){
        peer[userId].close()
    }

    const p = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:47.120.71.102:3478' },
            { urls: 'turn:47.120.71.102:3478', username: 'hedroins', credential: '899765'}]
    })

    p.onicecandidate = (event) => {
    if (event.candidate) {
        ws.send(JSON.stringify({
            type:'_ice',
            toUser: userId,
            fromUserId: Cookies.get('user_id'),
            fromUser:base64ToStr(Cookies.get('name')),
            iceCandidate: event.candidate
        }))
    }
    }

    p.ontrack = (event) => {
        if (event && event.streams) {
            document.getElementById('remoteVideo').srcObject = event.streams[0];
        }
    }

    peer[userId] = p;

    console.log(peer)
}


