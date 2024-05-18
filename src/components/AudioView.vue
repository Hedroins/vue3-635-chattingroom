<template>
  <div v-show="show" class="audio-view audio-border" draggable="true">
    <audio id="localAudio" autoplay muted controls style="display: none;"></audio>
    <audio id="remoteAudio" autoplay controls style="display: none;"></audio>
    <div class="audio-view-left">
      <div class="redio-avatar"  style="width:60px;height:60px;border-radius: 50%;margin: 0 auto;">
        <div style="width:60px;height:60px;border-radius: 50%;overflow: hidden" >
                    <img :src="callingData.avatar" width="100%" height="100%" alt="用户头像" >
                </div>
                <div style="text-align: center;">
                    <span style="font-size: 20px;">{{ callingData.fromUser }}</span>
                </div>
      </div>
      
    </div>
    <div class="audio-view-right">
        <div class="callingTimer" style="text-align: center;">
         {{ timerStr }}
        </div>
        <div class="callingButtons">
            <el-button type="danger">禁用</el-button>
            <el-button type="danger" @click="closeLocalStream(true)"> 挂断</el-button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick} from 'vue'
import {initWs,closeWs} from "@/tools/initWs"
import emitter from '@/mitt/mitt'
import { useWebSocketStore } from '@/store/websocket';
import Cookies from 'js-cookie'
import {formatTime} from '@/tools/tool'
let show =ref(false)
let props = defineProps(['toUser'])
let store = useWebSocketStore()
let peerStatus = ref(0)
let callingData = reactive({})
let callBackCode = ref('')
let timerStr = ref('00:00:00')
let timer = 0
defineExpose({
    show,
    peerStatus,
    closeLocalStream
})
let localStream;
let remoteStream;
let peer;
function closeLocalStream(close){
    const localAudio = document.getElementById('localAudio');
    localStream?.getTracks?.()?.forEach?.(track=>track.stop())
   
    // remoteVideo.srcObject?.getTracks().stop()
    // remoteVideo.srcObject = null;
    if(close){
        store.ws.send(JSON.stringify({
        type:'1V1CLOSE',
        fromUserId:Cookies.get('user_id'),
        toUserId:props.toUser,
        callType:'audio'
    }))
    }
   
    console.log('curentPeer',peer)
    if(peer){
      console.log('curentPeer',peer)
        peer.close()
        peerStatus.value =0
        peer = null
        emitter.emit('audio_peer_closed')
    }
    localAudio.srcObject =null;
    show.value = false;
    clearInterval(callBackCode.value)
    timer= 0
}

 function createLocalStream(data,isCallSide=true){
    const localAudio = document.getElementById('localAudio');
    console.log('localAudio',localAudio)
    const remoteAudio = document.getElementById('remoteAudio');
// 创建数据源
   console.log('userId',props.toUser)
//    webscoket = initWs(props.toUser)
navigator.mediaDevices.getUserMedia({
video: false,
audio: true,
}).then((stream)=>{
  localAudio.srcObject = localStream = stream;
    peer = initPeer(data,isCallSide)
    peerStatus.value = 1
    callBackCode.value = setInterval(()=>{
       timerStr.value = formatTime(timer++)
    },1000)
    emitter.emit('audio_peer_created')
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
            callType:'audio'
        })
        );
    }
}

peerA.onaddstream=(event)=>{
    remoteStream = event.stream;
    const remoteAudio = document.getElementById('remoteAudio');
    remoteAudio.srcObject = remoteStream;
        }
if(isCallSide){
    peerA.createOffer({
    offerToReceiveAudio: 1}).then(offer=>{
        peerA.setLocalDescription(offer);
        store.ws.send(JSON.stringify({
            type: '1V1OFFER',
            fromUserId:data.toUserId,
            toUserId:data.fromUserId,
            sdp:offer,
            callType:'audio'
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
  emitter.on('audio_ready',({data,isCallSide})=>{
    console.log('isCallSide',isCallSide)
    console.log('audio_ready',data)
        Object.assign(callingData,data)
        createLocalStream(data,isCallSide)
  })
  emitter.on('audio_ice_created',(data)=>{
    try{
         console.log('audio_ice_created')
        // setTimeout(()=>{
            peer.addIceCandidate(data.sdp)
        // },0)
       
    }catch(error){
        console.error('添加 ICE 候选失败', error);
    }
  })
  emitter.on('audio_offer_created',(data)=>{
     try{
            console.log('audio_offer_created')
            peer.setRemoteDescription(data.sdp);
      peer.createAnswer().then(answer=>{
        peer.setLocalDescription(answer);
        store.ws.send(JSON.stringify({
            type: '1V1ANSWER',
            fromUserId:data.toUserId,
            toUserId:data.fromUserId,
            sdp:answer,
            callType:'audio'
        })
        );
      }).catch(error=>{
        console.error('创建 SDP 描述失败', error);
      })
    
     }catch(e){

     }
  })
  emitter.on('audio_answer_created',(data)=>{
     try{
        console.log('audio_answer_created')
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
     .audio-view{
      z-index: 2002;
      position: fixed;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      bottom: 10px;
      right:20px;
      width: 300px;
      height:80px;
      padding:20px;
      .audio-view-left{
        width:150px;
        height:100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .audio-view-right{
        width:calc(100% - 160px);
        margin-left:10px;
        height:100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .commit{
            animation-name: dsp;
            animation-duration: 2.5s;
            animation-timing-function: linear;
            animation-iteration-count:infinite;
        }
        @keyframes dsp {
            0% {
                opacity:1;
                transform: scale(1);
            }
            50% {
                opacity:0.5;
                transform: scale(1.2);
            }
            80% {
                opacity:0.2;
                transform: scale(1.6);
            }
        }
    }
</style>