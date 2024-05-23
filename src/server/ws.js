
const scokertS = {}
const room = {}
const WebSocket = require('ws')

const WebSocketServer = WebSocket.Server;

//在4000端口上打开了一个WebSocket Server，该实例由变量wss引用。
const wss =new WebSocketServer({
    port:4000
})

let notify = function(room_id,message){
    let clients = Object.values(room[room_id]);
    clients.forEach(client => {
        client.send(message);
    })
}

//如果有WebSocket请求接入，wss对象可以响应connection事件来处理这个WebSocket：
wss.on('connection',function(ws){  //在connection事件中，回调函数会传入一个WebSocket的实例，表示这个WebSocket连接。
    console.log(`[SERVER] connection()`);
    ws.on('message',function(message){  //我们通过响应message事件，在收到消息后再返回一个ECHO: xxx的消息给客户端。
        console.log(`[SERVER] Received:${message}`);
        
        let data = JSON.parse(message);     
        let {type,fromUserId,fromUser,toUserId,room_id} = data;
        scokertS[data.fromUserId] = ws;
        if(type==='login'){
          console.log(`[SERVER] login:${fromUserId}`);
        }
        if(type.includes('room_')){
            if(room_id in room){
                room[room_id][fromUserId]=ws;    
            }else{
                room[room_id] = {[fromUserId]:ws}; 
            }
            if(type === 'room_join'){
                notify(room_id,JSON.stringify({
                    type:'room_join',
                    room_id,
                    fromUserId,
                    members:Object.keys(room[room_id])
                }))
                notify(room_id,JSON.stringify({
                    type:'room_message',
                    fromUserId,
                    room_id,
                    message_type:'system',
                    message:`加入房间`
                }))
            }
            if(type === 'room_leave'){
                if(room_id in room){
                    delete room[room_id][fromUserId];
                    notify(room_id,JSON.stringify({
                        type:'room_leave',
                        room_id,
                        fromUserId,
                        members:Object.keys(room[room_id])
                    }))

                    notify(room_id,JSON.stringify({
                        type:'room_message',
                        fromUserId,
                        room_id,
                        message_type:'system',
                        message:`离开房间`
                    }))
                }
            }
            if(type === 'room_offer'){
                room[room_id][toUserId].send(JSON.stringify({
                    type:'room_offer',
                    room_id,
                    fromUserId,
                    offer:data.offer,
                    toUserId,
                    sdp:data.sdp
                }))
            }
            if(type === 'room_answer'){
                room[room_id][toUserId].send(JSON.stringify({
                    type:'room_answer',
                    room_id,
                    fromUserId,
                    answer:data.answer,
                    toUserId,
                    sdp:data.sdp
                }))
            }
            if(type === 'room_ice'){
                room[room_id][toUserId].send(JSON.stringify({
                    type:'room_ice',
                    room_id,
                    fromUserId,
                    toUserId,
                    sdp:data.sdp
                }))
            }
            if(type === 'room_message'){
                notify(room_id,JSON.stringify({
                    type:'room_message',
                    room_id,
                    fromUserId,
                    message:data.message
                }))
            }
        }else{
           
            if(type === 'call_start'){
                if(toUserId in scokertS){
                    console.log('ws_set',Object.keys(scokertS))
                    scokertS[toUserId].send(JSON.stringify({
                        type:'call_start',
                        fromUserId,
                        fromUser,
                        toUserId,
                        avatar:data.avatar,
                        callType:data.callType,
                    }))
                    // ws.send(JSON.stringify({
                    //     type:'call_start_1',
                    //     fromUserId,
                    //     fromUser,
                    //     toUserId
                    // }))
                }else{
                    ws.send(JSON.stringify({
                        type:'call_start_0',
                        content:'对方不在线'
                    }))
                }
            }
    
            if(type === "call_accept"){
                 scokertS[toUserId].send(JSON.stringify({
                      type:'call_accept',
                      fromUserId,
                      toUserId,
                      avatar:data.avatar,
                      fromUser:data.fromUser,
                      callType:data.callType,
                 }))
            }
    
            if(type === "call_refuse"){
                 scokertS[toUserId].send(JSON.stringify({
                      type:'call_refuse',
                      fromUserId,
                      content:data.content
                 }))
            }
    
            if(type==='logout'){
                delete scokertS[fromUserId];
            }
    
            if(type==='1V1ICE'){
                scokertS[toUserId].send(JSON.stringify({
                    type:'1V1ICE',
                    fromUserId,
                    toUserId,
                    sdp:data.sdp,
                    callType:data.callType
                }))
            }
    
            if(type === '1V1OFFER'){
                scokertS[toUserId].send(JSON.stringify({
                    type:'1V1OFFER',
                    fromUserId,
                    toUserId,
                    sdp:data.sdp,
                    callType:data.callType
                }))
            }
    
            if(type === '1V1CLOSE'){
                scokertS[toUserId].send(JSON.stringify({
                    type:'1V1CLOSE',
                    fromUserId,
                    toUserId,
                    content:'对方已挂断',
                    callType:data.callType
                }))
            }
    
            if(type === '1V1ANSWER'){
                scokertS[toUserId].send(JSON.stringify({
                    type:'1V1ANSWER',
                    fromUserId,
                    toUserId,
                    sdp:data.sdp,
                    callType:data.callType
                }))
            }
        }
   
    })
    ws.on('close',function(message){
        console.log(`[SERVER] close()`+message);
    })
})