<template>
    <div name="roomChatting" style="height:calc(100% - 92px);margin-top:20px">
        <el-row style="height:100%" :gutter="20">
            <el-col :span="5" style="height:100%">
                <div style="height: 100%;border:1px solid #ddd">
                    <div style="height: 100%;border: 1px solid #ddd;">
                        <div
                            style="height: 45px;background-color: green;line-height: 45px;padding: 0 20px;color: #fff;">
                            <el-icon :size="20" style="vertical-align:middle">
                                <Avatar />
                            </el-icon><span style="vertical-align: middle;margin-left: 8px;">成员列表</span></div>
                        <div style="height: calc(100% - 85px);overflow: auto;padding: 20px;">
                            <el-card v-for="(item) in memberList" :key="item.user_id"
                                style="margin-bottom:8px;position: relative; vertical-align: middle;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                <img :src="item.avatar"
                                    style="width: 30px;height: 30px;border-radius: 50%;vertical-align: middle;">
                                <span class="status-dot"
                                    :style="{ color: item.isLogin == 1 ? 'rgb(40,227,36)' : 'rgb(223,35,35)' }">.</span>
                                <span style="vertical-align: middle;margin-left: 20px;font-size: 20px;">{{ item.username
                                    }}</span>
                                <img :src="item.sex === '1' ? 'male.png' : 'female.png'"
                                    style="width: 15px;vertical-align: middle;margin-left: 10px;">
                            </el-card>
                        </div>
                    </div>

                </div>
            </el-col>
            <el-col :span="14" style="height:100%">
                <div style="height: 100%;border:1px solid #ddd">
                    <div v-if="!showScreen" style="width:100%;height:100%">
                        <div style="height: calc(100% - 45px);margin-bottom: 10px;display:flex;flex-flow: row wrap;overflow: hidden;justify-content: space-between;"
                            id="videoParentCon">

                        </div>
                        <div style="height: 35px;display: flex;justify-content: center;"><el-pagination background
                                layout="prev, pager, next ,total" :total="currentChatting.length" :page-size="4"
                                @current-change="changeToPage" /></div>
                    </div>
                    <div v-else style="width:100%;height:100%"></div>
                </div>


            </el-col>
            <el-col :span="5" style="height:100%">
                <div style="height: 100%;border:1px solid #ddd">
                    <div style="height: 100%;border: 1px solid #ddd;">
                        <div
                            style="height: 45px;background-color: green;line-height: 45px;padding: 0 20px;color: #fff;">
                            <el-icon :size="20" style="vertical-align:middle">
                                <ChatDotRound />
                            </el-icon><span style="vertical-align: middle;margin-left: 8px;">消息</span></div>
                        <div style="height: calc(100% - 85px);overflow: auto;padding: 20px;position: relative;" >
                            <div id="message-box" style="height:calc(100% - 42px);overflow: auto;"></div>
                            <div
                                style="width:16%;height: 32px;display: flex;justify-content: space-between;position: fixed;bottom: 13px;right: 40px;">
                                <el-input v-model="message" style="width: 70%;"></el-input>
                                <el-button type="primary" style="width:calc(30% - 10px)" @click="sendMessage">发送</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router';
import { ChatDotRound, Avatar } from '@element-plus/icons-vue'
import { useWebSocketStore } from '@/store/websocket'
import emitter from '@/mitt/mitt'
import Cookies from 'js-cookie'


let route = useRoute();
let room = route.params.id;
let message = ref('')
let memberList = ref([])
let currentChatting = ref([])
let peerMap = {};
let videoSet = ref([])
let localStream
let showScreen = ref(false)
let user_id = Cookies.get('user_id')
let store = useWebSocketStore()
let currentPage  =ref(1)
let memberInfoMap = {}


function getMemberList(room) {
    fetch('/api/getMemberList', {
        method: 'POST',
        headers: {
            ContentType: 'application/json'
        }, body: JSON.stringify({
            room_id: room
        })
    }).then(res => res.json()).then(res => {
        console.log('memberList', res)
        memberList.value = res
        memberList.value.forEach(item => {
            memberInfoMap[item.user_id] = {avatar: item.avatar, username: item.username}
        })
        memberList.value.sort((a, b) => b.isLogin - a.isLogin)
    })
}

function changeToPage(num) {
    currentPage.value = num
    console.log(currentPage.value)
    activeView(num)
}

function createMessageBox(user_id,message){
  let messageBox = document.createElement('div')
  messageBox.className = 'message-box'
  messageBox.style.display = 'none'
  messageBox.style.width = '90%'
  messageBox.style.display='flex';
  messageBox.style.flexDirection='row';
  messageBox.style.justifyContent='flex-start';
  messageBox.style.alignItems='center';
  messageBox.style.marginBottom='10px';
  messageBox.style.marginTop='10px';
  let avatarNameCon = document.createElement('div')
  avatarNameCon.style.display = 'flex'
  avatarNameCon.style.alignItems = 'center'
  avatarNameCon.style.justifyContent = 'flex-start'
  avatarNameCon.style.minHeight = '65px'
  avatarNameCon.style.height = '100%'
  avatarNameCon.style.overflow = 'hidden';
  avatarNameCon.style.whiteSpace = 'nowrap';
  avatarNameCon.style.textOverflow = 'ellipsis';
  avatarNameCon.style.flexFlow="column nowrap"
  let avatar = document.createElement('img')
  avatar.setAttribute('width','50px')
  avatar.setAttribute('height','50px')
  avatar.setAttribute('src',memberInfoMap[user_id].avatar)
  avatar.style.borderRadius = '50%'
  let name = document.createElement('span')
  name.innerText = memberInfoMap[user_id].username
  name.style.fontSize = '14px'
  avatarNameCon.appendChild(avatar)
  avatarNameCon.appendChild(name)
  let messageCon = document.createElement('div')
  messageCon.style.maxWidth = 'calc(100% - 90px)'
//   messageCon.style.height = '100%'
  messageCon.style.padding = '5px';
  messageCon.innerText= message;
  messageCon.style.fontSize = '14px';
  messageCon.style.borderRadius = '5px'
  messageCon.style.backgroundColor = '#F5F5F5';
  messageCon.style.wordBreak='break-all'
  messageCon.style.border= '3px double #000000'
  messageCon.style.marginLeft = '10px'
  messageBox.appendChild(avatarNameCon)
  messageBox.appendChild(messageCon)
  return messageBox
}

function createSystemMessage(user_id,systemMes) {
    let messageBox = document.createElement('div');
    let message = document.createElement('span');
    message.innerText = memberInfoMap[user_id].username+systemMes;
    message.style.fontSize = '14px';
    message.style.textAlign = 'left';
    message.style.color = '#ddd';
    messageBox.style.textAlign='center';
    messageBox.style.marginTop = '10px';
    messageBox.style.marginBottom = '10px';
    messageBox.appendChild(message);
    return messageBox
}
function moutedView() {
    // let prePageView = []
    // if(num>1){
    //   prePageView = videoSet.value.slice((num-2)*4,(num-1)*4)
    //   prePageView.forEach(view=>{
    //       view[0].style.display = 'none'
    //   })
    // }
    // let pageView = videoSet.value.slice((num-1)*4,num*4)
    // pageView.forEach(view=>{
    // })
    let parentCon = document.getElementById('videoParentCon')
    videoSet.value.forEach(view => {
        parentCon.appendChild(view['VM'][0])
    })
}

function sendMessage(){
    store.ws.send(JSON.stringify({
        type: 'room_message',
        room_id:room,
        fromUserId:user_id,
        message:message.value
    }))
}

function activeView(index) {
    videoSet.value.forEach(view => {
        view['VM'][0].style.display = 'none'
    })
    let pageView = videoSet.value.slice((index - 1) * 4, index * 4);
    pageView.forEach(view => {
        view['VM'][0].style.display = 'block'

    })
}

function createViewDom(id) {
    let viewCon = document.createElement('div');
    viewCon.className = 'view-con';
    viewCon.style.height = 'calc(48% - 10px)';
    viewCon.style.flex = '0 1 calc(48% - 10px)';
    viewCon.style.padding = '10px';
    viewCon.style.display = 'none'
    let video = document.createElement('video');
    video.id = id;
    video.autoplay = true;
    video.setAttribute('width', '100%');
    video.setAttribute('height', '100%');
    video.setAttribute('muted', true);
    video.style.objectFit = 'cover';
    video.controls = true
    video.muted = true
    viewCon.appendChild(video);
    return [viewCon, video];
}

function initPeer(remoteId,sendOffer) {
    let remoteStream;
    let peerA = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:47.120.71.102:3478'
            },
            {
                urls: 'turn:47.120.71.102:3478',
                username: 'hedroins',
                credential: '899765'
            }
        ],
    });

    // 添加本地流
    peerA.addStream(localStream);
    peerA.onicecandidate = (event) => {
        if (event.candidate) { // 发送 ICE 候选
            store.ws.send(JSON.stringify({
                type: 'room_ice',
                fromUserId: user_id,
                toUserId: remoteId,
                sdp: event.candidate,
                room_id:room
            })
            );
        }
    }

    peerA.onaddstream = (event) => {
        remoteStream = event.stream;
        const remoteVideo = videoSet.value.find((item) => item.userId === remoteId);
        remoteVideo['VM'][1].srcObject = remoteStream;
        activeView(currentPage.value)
    }


    if (sendOffer) {
        peerA.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(offer => {
            peerA.setLocalDescription(offer);
            store.ws.send(JSON.stringify({
                type: 'room_offer',
                fromUserId: Cookies.get('user_id'),
                toUserId: remoteId,
                room_id:room,
                sdp: offer
            })
            );
        }).catch(error => {
            console.error('创建 SDP 描述失败', error);
        })
    }

    return peerA;
    // 创建 SDP 描述

}


function createLocalStream() {
    // const localVideo = document.getElementById('localVideo');

    // 创建数据源
    //    webscoket = initWs(props.toUser)
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    }).then((stream) => {
        let localVideo = createViewDom('localVideo')
        localVideo[1].srcObject = localStream = stream;
        videoSet.value.push({ 'userId': Cookies.get('user_id'), 'VM': localVideo })
        let remoteUserChatting = currentChatting.value.filter(item => item !==user_id)
        for (let i = 0; i < remoteUserChatting.length; i++) {
            let remoteVideo = createViewDom('remoteVideo' + (i + 1))
            videoSet.value.push({ 'userId': remoteUserChatting[i], 'VM': remoteVideo })
            let peer = initPeer(remoteUserChatting[i],true);
            peerMap[remoteUserChatting[i]]= peer;
        }
        moutedView();
        activeView(1)

        // peer = initPeer(data,isCallSide)
        // peerStatus.value = 1
        // emitter.emit('video_peer_created')

    }).catch((error) => {
        console.error('获取本地流失败', error);
    })
}
getMemberList(room);



onBeforeMount(() => {
    emitter.on('room_join', (data) => {
        currentChatting.value = data.members
        if(!(data.fromUserId in peerMap)){
            if(data.fromUserId!==user_id){
            peerMap[data.fromUserId] = initPeer(data.fromUserId, false);
        let remoteVideo = createViewDom('remoteVideo' + (videoSet.length));
            videoSet.value.push({ 'userId':data.fromUserId, 'VM': remoteVideo });
            let parentCon = document.getElementById('videoParentCon')
            parentCon.appendChild(remoteVideo[0]);
        }else{
            createLocalStream(room)
        }
        }
  
    })
    emitter.on('room_leave', (data) => {
        currentChatting.value = data.members
        let parentCon = document.getElementById('videoParentCon')
            let remoteVideo = videoSet.value.find((item) => item.userId === data.fromUserId);
            let index = videoSet.value.findIndex((item) => item.userId === data.fromUserId);
            videoSet.value.splice(index, 1);
            parentCon.removeChild(remoteVideo['VM'][0]);
            peerMap[data.fromUserId].close();
           
            delete peerMap[data.fromUserId];
            activeView(currentPage.value)
    })
    emitter.on('room_offer', (data) => {
        peerMap[data.fromUserId].setRemoteDescription(data.sdp);
        peerMap[data.fromUserId].createAnswer().then((answer) => {
            peerMap[data.fromUserId].setLocalDescription(answer);
            store.ws.send(JSON.stringify({
                type: 'room_answer',
                room_id: room,
                fromUserId: user_id,
                toUserId: data.fromUserId,
                sdp: answer
            }))
        }).catch((err) => {
            console.log('房间创建SDP描述失败',err);
        })
    })
    emitter.on('room_answer', (data) => {
        peerMap[data.fromUserId].setRemoteDescription(data.sdp);
    })
    emitter.on('room_ice', (data) => {
        try{
        peerMap[data.fromUserId].addIceCandidate(data.sdp)
    }catch(error){
        console.error('房间添加 ICE 候选失败', error);
    }
    })
    emitter.on('room_message',data=>{
        let messageBox = document.getElementById('message-box');
        if(data.message_type==='system'){
         messageBox.appendChild(createSystemMessage(data.fromUserId,data.message));
        }else{
         messageBox.appendChild(createMessageBox(data.fromUserId,data.message));
        }
      
       messageBox.scrollTo(0,messageBox.scrollHeight)
    })
})

onMounted(() => {
    if (!(store.ws.readyState === 1)) {
        emitter.on('ws_init', (data) => {
            store.ws.send(JSON.stringify({
                type: 'room_join',
                room_id: room,
                fromUserId: Cookies.get('user_id')
            }))
        })
    } else {
        store.ws.send(JSON.stringify({
            type: 'room_join',
            room_id: room,
            fromUserId: Cookies.get('user_id')
        }))
    }
    // createLocalStream(room)
})
onBeforeUnmount(() => {
    store.ws.send(JSON.stringify({
        type: 'room_leave',
        room_id: room,
        fromUserId: user_id
    }))
    localStream?.getTracks?.()?.forEach?.(track=>track.stop())
    for(let key in peerMap){
        peerMap[key].close()
        
    }
    peerMap = {}
    emitter.off('room_join')
    emitter.off('room_leave')
    emitter.off('room_offer')
    emitter.off('room_answer')
    emitter.off('room_ice')
    emitter.off('room_message')

})
</script>
<style lang='less' scoped>
/deep/ .el-row {
    margin-left: 0px !important;
    margin-right: 0px !important;
}

/deep/ .el-card__body {
    padding: 5px 10px;
}




.status-dot {
    display: inline;
    font-size: 70px;
    position: absolute;
    left: 26px;
    top: 15%;
    vertical-align: middle;
    line-height: 0;
}
</style>