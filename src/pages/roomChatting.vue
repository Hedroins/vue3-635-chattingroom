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
                            </el-icon><span style="vertical-align: middle;margin-left: 8px;">成员列表</span>
                        </div>
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
                                @current-change="changeToPage" />
                            <el-button @click="startShowScreen" type="primary"
                                style="margin-left: 40px;">分享屏幕</el-button>
                        </div>
                    </div>
                    <div v-else style="width:100%;height:100%">
                        <div id="screenParentCon" style="height: calc(80% - 20px);">
                            <video id="screenVideo" style="width:100%;height:100%" autoplay controls></video>
                        </div>
                        <div style="height:20%;margin-top:20px;display: flex;justify-content: flex-start;">
                            <div id="userCon" style="display: flex;justify-content: flex-start;overflow: auto;height: 100%;" :style="{width:currentShowScreenUserId!==user_id?'100%':'calc(100% - 100px)'}"></div>
                            <el-button @click="stopShowScreen" type="primary" v-if="user_id===currentShowScreenUserId" style="align-self: center;">停止共享</el-button>
                        </div>
                       
                    </div>
                </div>


            </el-col>
            <el-col :span="5" style="height:100%">
                <div style="height: 100%;border:1px solid #ddd">
                    <div style="height: 100%;border: 1px solid #ddd;">
                        <div
                            style="height: 45px;background-color: green;line-height: 45px;padding: 0 20px;color: #fff;">
                            <el-icon :size="20" style="vertical-align:middle">
                                <ChatDotRound />
                            </el-icon><span style="vertical-align: middle;margin-left: 8px;">消息</span>
                        </div>
                        <div style="height: calc(100% - 85px);overflow: auto;padding: 20px;position: relative;">
                            <div id="message-box" style="height:calc(100% - 42px);overflow: auto;"></div>
                            <div
                                style="width:16%;height: 32px;display: flex;justify-content: space-between;position: fixed;bottom: 13px;right: 40px;">
                                <el-input v-model="message" style="width: 70%;"
                                    @keypress.enter="sendMessage"></el-input>
                                <el-button type="primary" style="width:calc(30% - 10px)"
                                    @click="sendMessage">发送</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount, onBeforeUnmount, nextTick } from 'vue'
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
let currentPage = ref(1)
let memberInfoMap = {}
let screenStream
let currentShowScreenUserId = ref('');


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
            memberInfoMap[item.user_id] = { avatar: item.avatar, username: item.username }
        })
        memberList.value.sort((a, b) => b.isLogin - a.isLogin)
    })
}

function changeToPage(num) {
    currentPage.value = num
    console.log(currentPage.value)
    activeView(num)
}

function createMessageBox(user_id, message) {
    let messageBox = document.createElement('div')
    messageBox.className = 'message-box'
    messageBox.style.display = 'none'
    messageBox.style.width = '90%'
    messageBox.style.display = 'flex';
    messageBox.style.flexDirection = 'row';
    messageBox.style.justifyContent = 'flex-start';
    messageBox.style.alignItems = 'center';
    messageBox.style.marginBottom = '10px';
    messageBox.style.marginTop = '10px';
    let avatarNameCon = document.createElement('div')
    avatarNameCon.style.display = 'flex'
    avatarNameCon.style.alignItems = 'center'
    avatarNameCon.style.justifyContent = 'flex-start'
    avatarNameCon.style.minHeight = '65px'
    avatarNameCon.style.height = '100%'
    avatarNameCon.style.overflow = 'hidden';
    avatarNameCon.style.whiteSpace = 'nowrap';
    avatarNameCon.style.textOverflow = 'ellipsis';
    avatarNameCon.style.flexFlow = "column nowrap"
    let avatar = document.createElement('img')
    avatar.setAttribute('width', '50px')
    avatar.setAttribute('height', '50px')
    avatar.setAttribute('src', memberInfoMap[user_id].avatar)
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
    messageCon.innerText = message;
    messageCon.style.fontSize = '14px';
    messageCon.style.borderRadius = '5px'
    messageCon.style.backgroundColor = '#F5F5F5';
    messageCon.style.wordBreak = 'break-all'
    messageCon.style.border = '3px double #000000'
    messageCon.style.marginLeft = '10px'
    messageBox.appendChild(avatarNameCon)
    messageBox.appendChild(messageCon)
    return messageBox
}

function stopShowScreen(){
    showScreen.value = false;
    for(let peerKey in peerMap){
        if(peerKey.startsWith('screen')){
            peerMap[peerKey].close()
            delete peerMap[peerKey];
        }
    }
    screenStream?.getTracks?.()?.forEach?.(track=>track.stop())
    store.ws.send(JSON.stringify({
        type: 'room_screen_off',
        room_id: room,
        fromUserId: user_id
    }))

        nextTick(()=>{
            let parentCon = document.getElementById('videoParentCon');
            for(let view of videoSet.value ){
                view.VM[0].style.flex = '0 1 calc(48% - 10px)';
                view.VM[0].style.width='auto'
                view.VM[0].style.height='calc(48% - 10px)'
                view.VM[0].style.boxSizing ='border-box'
                parentCon.appendChild(view['VM'][0]);
            }
            activeView(currentPage.value)
        })
}

function startShowScreen() {
    showScreen.value = true
    store.ws.send(JSON.stringify({
        type: 'room_screen',
        room_id: room,
        fromUserId: user_id
    }))
    let remoteUserChatting = currentChatting.value.filter(item=>item!=user_id)

  
    
    for (let viewDom of videoSet.value) {
        viewDom.VM[0].style.display = 'block';
        viewDom.VM[0].style.width = '200px'
        viewDom.VM[0].style.flex = '0 0 200px'
        viewDom.VM[0].style.height = '100%';
        viewDom.VM[0].style.boxSizing='border-box'
        viewDom.VM[1].style.objectFit = 'cover'
        nextTick(()=>{
            let parentCon = document.getElementById('userCon')
        parentCon.appendChild(viewDom.VM[0]);
        })
    }
    let screenVideoStream;
    const displayMediaOptions = {
        video: {
            displaySurface: ["browser", "monitor", "window"],
        },
        audio:true,
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        systemAudio: "include",
        surfaceSwitching: "include",
        monitorTypeSurfaces: "include",
    };
    if(navigator?.mediaDevices?.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then(stream => {
        screenStream = stream;
        let localVideo = document.getElementById('screenVideo');
        localVideo.srcObject = stream;
        for(let userKey of remoteUserChatting){
       peerMap['screen'+userKey] = initPeer(userKey,true,true)
    }
    }).catch(err => console.error(err))
    }else if(navigator.getDisplayMedia){
        navigator.getDisplayMedia(displayMediaOptions).then(stream => {
        screenStream = stream;
        let localVideo = document.getElementById('screenVideo');
        localVideo.srcObject = stream;
        for(let userKey of remoteUserChatting){
       peerMap['screen'+userKey] = initPeer(userKey,true,true)
    }
    }).catch(err => console.error(err))
    }
   
}

function createSystemMessage(user_id, systemMes) {
    let messageBox = document.createElement('div');
    let message = document.createElement('span');
    console.log('useriNFO',memberInfoMap[user_id])
    message.innerText = memberInfoMap[user_id].username + systemMes;
    message.style.fontSize = '14px';
    message.style.textAlign = 'left';
    message.style.color = '#ddd';
    messageBox.style.textAlign = 'center';
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

function sendMessage() {
    if (message.value.trim() === '')
        return
    store.ws.send(JSON.stringify({
        type: 'room_message',
        room_id: room,
        fromUserId: user_id,
        message: message.value
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
    viewCon.style.height = showScreen.value?'100%':'calc(48% - 10px)';
    viewCon.style.flex =  showScreen.value?'0 0 200px':'0 1 calc(48% - 10px)';
    viewCon.style.padding = '10px';
    viewCon.style.boxSizing =showScreen.value?'border-box':'content-box'
    if(showScreen.value){
        viewCon.style.width='200px'
    }
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

function initPeer(remoteId, sendOffer, isShowScreen) {
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
   if(!isShowScreen){
    peerA.addStream(localStream);
    
   }else if(screenStream){
    peerA.addStream(screenStream);
   }
   
    
    peerA.onicecandidate = (event) => {
        if (event.candidate) { // 发送 ICE 候选
            store.ws.send(JSON.stringify({
                type: 'room_ice',
                fromUserId: user_id,
                toUserId: remoteId,
                sdp: event.candidate,
                room_id: room,
                screen: isShowScreen ? true : false
            })
            );
        }
    }

    peerA.onaddstream = (event) => {
        remoteStream = event.stream;
        if (!isShowScreen) {
            const remoteVideo = videoSet.value.find((item) => item.userId === remoteId);
            remoteVideo['VM'][1].srcObject = remoteStream;
            if(!showScreen.value){
                activeView(currentPage.value)
            }
           
        } else {
            let remoteVideo = document.getElementById('screenVideo');
            remoteVideo.srcObject = remoteStream;

        }
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
                room_id: room,
                sdp: offer,
                screen: isShowScreen ? true : false
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
        let remoteUserChatting = currentChatting.value.filter(item => item !== user_id)
        for (let i = 0; i < remoteUserChatting.length; i++) {
            let remoteVideo = createViewDom('remoteVideo' + (i + 1))
            videoSet.value.push({ 'userId': remoteUserChatting[i], 'VM': remoteVideo })
            let peer = initPeer(remoteUserChatting[i], true);
            peerMap[remoteUserChatting[i]] = peer;
        }
        if(!showScreen.value){
            moutedView();
            activeView(1)
        }else{
            let parentCon = document.getElementById('userCon')
            videoSet.value.forEach(item=>{
                item.VM[0].style.display ='block'
                parentCon.appendChild(item.VM[0])
            })
        }
        
       
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
        if (!(data.fromUserId in peerMap)) {
            if (data.fromUserId !== user_id) {
                peerMap[data.fromUserId] = initPeer(data.fromUserId, false);
                let remoteVideo = createViewDom('remoteVideo' + (videoSet.value.length));
                videoSet.value.push({ 'userId': data.fromUserId, 'VM': remoteVideo });
                let parentCon = showScreen.value?document.getElementById('userCon'):document.getElementById('videoParentCon')
                parentCon.appendChild(remoteVideo[0]);
            } else {
                createLocalStream(room)
            }

            if(showScreen.value&&currentShowScreenUserId.value===user_id){
                peerMap['screen'+data.fromUserId] = initPeer(data.fromUserId,true,true)
                store.ws.send(JSON.stringify({
                    type: 'room_screen',
                    fromUserId:user_id,
                    toUserId: data.fromUserId,
                    room_id: room,
                    screen: true
                }))
            }
        }

    })
    emitter.on('room_leave', (data) => {
        currentChatting.value = data.members
        if(showScreen.value&&data.fromUserId===currentShowScreenUserId.value){
            showScreen.value = false;
            let index = videoSet.value.findIndex((item) => item.userId === data.fromUserId);
        videoSet.value.splice(index, 1);
        peerMap[data.fromUserId].close();
        delete peerMap[data.fromUserId];
        peerMap['screen'+data.fromUserId].close();
        delete peerMap['screen'+data.fromUserId];
        nextTick(()=>{
            let parentCon = document.getElementById('videoParentCon');
            for(let view of videoSet.value ){
                view.VM[0].style.flex = '0 1 calc(48% - 10px)';
                view.VM[0].style.width='auto'
                view.VM[0].style.boxSizing='content-box'
                view.VM[0].style.height='calc(48% - 10px)'
                parentCon.appendChild(view['VM'][0]);
            }
            activeView(currentPage.value)
        })
        }else{
        let parentCon = showScreen.value?document.getElementById('userCon'):document.getElementById('videoParentCon')
        let remoteVideo = videoSet.value.find((item) => item.userId === data.fromUserId);
        let index = videoSet.value.findIndex((item) => item.userId === data.fromUserId);
        videoSet.value.splice(index, 1);
        parentCon.removeChild(remoteVideo['VM'][0]);
        peerMap[data.fromUserId].close();
        delete peerMap[data.fromUserId];
        if(!showScreen.value){
            activeView(currentPage.value)
        }
      
        }
    })
    emitter.on('room_offer', (data) => {
        if (!data['screen']) {
            peerMap[data.fromUserId].setRemoteDescription(data.sdp);
            peerMap[data.fromUserId].createAnswer().then((answer) => {
                peerMap[data.fromUserId].setLocalDescription(answer);
                store.ws.send(JSON.stringify({
                    type: 'room_answer',
                    room_id: room,
                    fromUserId: user_id,
                    toUserId: data.fromUserId,
                    sdp: answer,
                    screen: false
                }))
            }).catch((err) => {
                console.log('房间创建SDP描述失败', err);
            })
        } else {
            peerMap['screen'+data.fromUserId].setRemoteDescription(data.sdp);
            peerMap['screen'+data.fromUserId].createAnswer().then((answer) => {
                peerMap['screen'+data.fromUserId].setLocalDescription(answer);
                store.ws.send(JSON.stringify({
                    type: 'room_answer',
                    room_id: room,
                    fromUserId: user_id,
                    toUserId: data.fromUserId,
                    sdp: answer,
                    screen: true
                }))
            }).catch((err) => {
                console.log('屏幕共享创建SDP描述失败', err);
            })
        }

    })
    emitter.on('room_answer', (data) => {
        if (!data['screen']) {
            peerMap[data.fromUserId].setRemoteDescription(data.sdp);
        } else {
            
            peerMap['screen'+data.fromUserId].setRemoteDescription(data.sdp);
        }

    })
    emitter.on('room_ice', (data) => {
        try {
            if (!data['screen']) {
                peerMap[data.fromUserId].addIceCandidate(data.sdp)
            } else {
                
                peerMap['screen'+data.fromUserId].addIceCandidate(data.sdp)
            }
        } catch (error) {
            console.error('房间添加 ICE 候选失败', error);
        }
    })

    emitter.on('room_message', data => {
        let messageBox = document.getElementById('message-box');
        if (data.message_type === 'system') {
            messageBox.appendChild(createSystemMessage(data.fromUserId, data.message));
        } else {
            messageBox.appendChild(createMessageBox(data.fromUserId, data.message));
        }
        messageBox.scrollTo(0, messageBox.scrollHeight)
    })
    emitter.on('room_screen', data => {
        showScreen.value = true
        currentShowScreenUserId.value = data.fromUserId
        let screenPeer = initPeer(data.fromUserId, false, true);
        peerMap['screen'+data.fromUserId] = screenPeer
        for (let viewDom of videoSet.value) {
        viewDom.VM[0].style.display = 'block';
        viewDom.VM[0].style.width = '200px'
        viewDom.VM[0].style.flex = '0 0 200px'
        viewDom.VM[0].style.height = '100%';
        viewDom.VM[0].style.boxSizing = 'border-box'
        viewDom.VM[1].style.objectFit = 'cover'
        nextTick(()=>{
            let parentCon = document.getElementById('userCon')
        parentCon.appendChild(viewDom.VM[0]);
        })
    }

    })
    emitter.on('room_screen_off', (data) => {
        showScreen.value = false;
        if(data.fromUserId!==user_id){
            peerMap['screen'+data.fromUserId].close()
        }
    
        delete peerMap['screen'+data.fromUserId]
        nextTick(()=>{
            let parentCon = document.getElementById('videoParentCon');
            for(let view of videoSet.value ){
                view.VM[0].style.flex = '0 1 calc(48% - 10px)';
                view.VM[0].style.width='auto'
                view.VM[0].style.boxSizing='content-box'
                view.VM[0].style.height='calc(48% - 10px)'
                parentCon.appendChild(view['VM'][0]);
            }
            activeView(currentPage.value)
        })
      
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
    localStream?.getTracks?.()?.forEach?.(track => track.stop())
    for (let key in peerMap) {
        peerMap[key].close()

    }
    peerMap = {}
    emitter.off('room_join')
    emitter.off('room_leave')
    emitter.off('room_offer')
    emitter.off('room_answer')
    emitter.off('room_ice')
    emitter.off('room_message')
    emitter.off('room_screen')
    emitter.off('room_screen_off')

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