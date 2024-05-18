<template>
 <el-dialog v-model="show" title="视频通话" width="1300" height="900" center draggable  @close="closeLocalStream('close')">
    <template #header><span>视频通话</span></template>
    <div style="height:580px;width:100%;" id="video">
        <video id="localVideo" autoplay muted controls></video>
        <video id="remoteVideo" autoplay controls></video>
    </div>
 </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick} from 'vue'
import {initWs,closeWs} from "@/tools/initWs"
import emitter from '@/mitt/mitt'
import { useWebSocketStore } from '@/store/websocket';
import Cookies from 'js-cookie'
let show =ref(false)
let props = defineProps(['toUser'])
let store = useWebSocketStore()
let peerStatus = ref(0)
defineExpose({
    show,
    peerStatus,
    closeLocalStream
})
let localStream;
let remoteStream;
let peer;
function closeLocalStream(close){
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');

    localStream?.getTracks?.()?.forEach?.(track=>track.stop())
   
    // remoteVideo.srcObject?.getTracks().stop()
    // remoteVideo.srcObject = null;
    if(close){
        store.ws.send(JSON.stringify({
        type:'1V1CLOSE',
        fromUserId:Cookies.get('user_id'),
        toUserId:props.toUser,
        callType:'video'
    }))
    }
   
    console.log('curentPeer',peer)
    if(peer){
        peer.close()
        peerStatus.value =0
        peer = null
    }
    localVideo.srcObject =null;
}

 function createLocalStream(data,isCallSide=true){
    const localVideo = document.getElementById('localVideo');
    console.log('localVideo',localVideo)
    const remoteVideo = document.getElementById('remoteVideo');
// 创建数据源
//    webscoket = initWs(props.toUser)
navigator.mediaDevices.getUserMedia({
video: true,
audio: true,
}).then((stream)=>{
    localVideo.srcObject = localStream = stream;
    peer = initPeer(data,isCallSide)
    peerStatus.value = 1
    emitter.emit('video_peer_created')
  
}).catch((error)=>{
    console.error('获取本地流失败', error);
})
// 将本地流绑定到 video 标签

// 显示数据源，localVideo 是 html 中的 video 标签
}
function initPeer(data,isCallSide){
let peerA = new RTCPeerConnection({
    iceServers: [
        {
            urls:'stun:47.120.71.102:3478'
        },
        {
            urls:'turn:47.120.71.102:3478',
            username:'hedroins',
            credential:'899765'
        }
    ],
});

// 添加本地流
peerA.addStream(localStream);
peerA.onicecandidate = (event)=>{
    if (event.candidate) { // 发送 ICE 候选
        store.ws.send(JSON.stringify({
            type: '1V1ICE',
            fromUserId:data.toUserId,
            toUserId:data.fromUserId,
            sdp:event.candidate,
            callType:'video'
        })
        );
    }
}

peerA.onaddstream=(event)=>{
    remoteStream = event.stream;
    const remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = remoteStream;
        }
if(isCallSide){
    peerA.createOffer({
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1,}).then(offer=>{
        peerA.setLocalDescription(offer);
        store.ws.send(JSON.stringify({
            type: '1V1OFFER',
            fromUserId:data.toUserId,
            toUserId:data.fromUserId,
            sdp:offer,
            callType:'video'
        })
        );
    }).catch(error=>{
        console.error('创建 SDP 描述失败', error);
    })
}

    return peerA;
// 创建 SDP 描述


}

onMounted(()=>{
  emitter.on('video_ready',({data,isCallSide})=>{
    console.log('isCallSide',isCallSide)
    console.log('video_ready',data)
        createLocalStream(data,isCallSide)
  })
  emitter.on('video_ice_created',(data)=>{
    try{
         console.log('video_ice_ready')
        // setTimeout(()=>{
            peer.addIceCandidate(data.sdp)
        // },0)
       
    }catch(error){
        console.error('添加 ICE 候选失败', error);
    }
  })
  emitter.on('video_offer_created',(data)=>{
     try{
            console.log('video_offer_created')
            peer.setRemoteDescription(data.sdp);
      peer.createAnswer().then(answer=>{
        peer.setLocalDescription(answer);
        store.ws.send(JSON.stringify({
            type: '1V1ANSWER',
            fromUserId:data.toUserId,
            toUserId:data.fromUserId,
            sdp:answer,
            callType:'video'
        })
        );
      }).catch(error=>{
        console.error('创建 SDP 描述失败', error);
      })
    
     }catch(e){

     }
  })
  emitter.on('video_answer_created',(data)=>{
     try{
        console.log('video_answer_created')
        // setTimeout(()=>{
            peer.setRemoteDescription(data.sdp);
        // },0)
     
     }catch(e){

     }
  })

})
// 创建本地流


</script>
<style lang='less' scoped>
#video{
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#localVideo{
    width: calc(50% - 10px);
    height: 100%;
    border: 1px solid #000;
}
#remoteVideo{
    width:calc(50% - 10px);
    height: 100%;
    border: 1px solid #000;
}

</style>