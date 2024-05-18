
const scokertS = {}
const userS = {}
const WebSocket = require('ws')

const WebSocketServer = WebSocket.Server;

//在4000端口上打开了一个WebSocket Server，该实例由变量wss引用。
const wss =new WebSocketServer({
    port:4000
})

//如果有WebSocket请求接入，wss对象可以响应connection事件来处理这个WebSocket：
wss.on('connection',function(ws){  //在connection事件中，回调函数会传入一个WebSocket的实例，表示这个WebSocket连接。
    console.log(`[SERVER] connection()`);
    ws.on('message',function(message){  //我们通过响应message事件，在收到消息后再返回一个ECHO: xxx的消息给客户端。
        console.log(`[SERVER] Received:${message}`);
        // ws.send(`ECHO:${message}` ,(err)=>{
        //     if(err){
        //         console.log(`[SERVER] error:${err}`);
        //     }
        // })
        // console.log('send:ECHO: ' + message);
        let data = JSON.parse(message);
        scokertS[data.fromUserId] = ws;
        let {type,fromUserId,fromUser,toUserId} = data;
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
    })
    ws.on('close',function(message){
        console.log(`[SERVER] close()`+message);
    })
})