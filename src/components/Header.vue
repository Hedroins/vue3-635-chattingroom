<template>
    <div class="header-wrap">
        <div class="logo">635</div>
        <span class="logo-text">635聊天室</span>

        <div class="application-box" v-if="!(+isLogin)">
            <RouterLink to="/login">登录</RouterLink>
            <RouterLink to="/register">注册</RouterLink>
        </div>
        <div class="application-box" v-else>
            <div class="avatar-container">
                <img :src="avatarUrl" alt="">
            </div>
            <div class="username">
                <span>您好！{{ username }}</span>
                <a href="#" @click.prevent="showPersonalInfo = true">个人中心</a>
            </div>

        </div>
        <el-dialog v-model="showPersonalInfo" title="个人中心" width="500" center class="personal-info-dialog"
            @opened="personalInfoDialogOpened">
            <template #header>
                <span>个人信息</span>
            </template>
            <div class="personal-info">
                <div class="left-content">
                    <div class="avatar-setting" @click="changeAvatar">
                        <img class="avatar" :src="avatar" alt="头像图片">
                        <img class="change-avatar" src="change-avatar.png" alt="更换头像图片">
                    </div>
                    <div class="user-info">
                        <span style="font-size:20px;margin-top:10px">{{ _username }}<i><img
                                    :src="_sex === '1' ? 'male.png' : 'female.png'"
                                    style="width:20px;margin-left: 5px;vertical-align: middle;"></i></span>
                    </div>
                    <div style="margin-top:15px">
                        <el-button type="primary" @click="savePersonalInfoChange">保存修改</el-button>
                        <el-button type="danger" @click="userLogout">退出登录</el-button>
                    </div>
                </div>
            
                <div class="right-content">
                    <label>用户名:</label>
                    <el-input v-model="_username" style="width: 240px" placeholder="请输入用户名" @input="usernameChange" />
                    <label>性别:</label>
                    <el-radio-group v-model="_sex" class="ml-4" style="width: 240px">
                        <el-radio value="1">男</el-radio>
                        <el-radio value="2">女</el-radio>
                    </el-radio-group>
                    <label>个性签名:</label>
                    <el-input v-model="_signature" type="textarea" style="width: 240px;height:120px"
                        placeholder="请输入个性签名" :autosize="{ minRows: 5, maxRows: 5 }" />
                </div>
            </div>

            <!-- <template #footer>
                <div class="dialog-footer">
                    <el-button @click="centerDialogVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="centerDialogVisible = false">
                        Confirm
                    </el-button>
                </div>
            </template> -->
        </el-dialog>
        <teleport to="body">
            <CallIn :userInfo="userInfo" ref="call_in"></CallIn>
        </teleport>

        <teleport to="body">
            <VedioView ref="videoViewRef" :toUser="video_user_id"></VedioView>
        </teleport>
        <teleport to="body">
            <AudioView ref="audioViewRef" :toUser="audio_user_id"></AudioView>
        </teleport>
    </div>
</template>
<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import emitter from '@/mitt/mitt'
import Cookies from 'js-cookie'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { base64ToStr } from '@/tools/tool'
import { useWebSocketStore } from '@/store/websocket'
import { initWs } from '@/tools/initWs'
import CallIn from '@/components/Call_In.vue'
import VedioView from '@/components/VedioView.vue'
import {ElNotification} from 'element-plus'
import AudioView from '@/components/AudioView.vue'


let store = useWebSocketStore()
let router = useRouter()
let username = Cookies.get('name') ? ref(base64ToStr(Cookies.get('name'))) : ref('')
let _username = ref(username.value)
let isLogin = Cookies.get('isLogin') ? ref(Cookies.get('isLogin')) : ref(0)
let avatarUrl = Cookies.get('avatar') ? ref(Cookies.get('avatar')) : ref('')
let avatar = ref(avatarUrl.value);
let signature = Cookies.get('signature') ? ref(base64ToStr(Cookies.get('signature'))) : ref('')
let _signature = ref(signature.value)
let sex = Cookies.get('sex') ? ref(Cookies.get('sex')) : ref('1')
let _sex = ref(sex.value)
let showPersonalInfo = ref(false)
let userInfo = reactive({})
let call_in = ref();
let video_user_id = ref('')
let audio_user_id = ref('')
let videoViewRef = ref();
let audioViewRef =ref();
let offerData;
let answerData;
let iceData;

emitter.on('click_accept', ({ data, isCallSide }) => {
    if(data.callType === 'video'){
        videoViewRef.value.show = true;
        nextTick(() => {
        emitter.emit('video_ready', { data, isCallSide })
    })
    }
    if(data.callType === 'audio'){
        audioViewRef.value.show = true;
        nextTick(() => {
        emitter.emit('audio_ready', { data, isCallSide })
    })
    }
    
})

emitter.on('call_accept', (data) => {
   
    if(data.callType==='video'){
        videoViewRef.value.show = true;
        nextTick(() => {
        emitter.emit('video_ready', { data })
    })
    }else if(data.callType ==="audio"){
        audioViewRef.value.show = true;
        nextTick(() => {
        emitter.emit('audio_ready', { data })
    })
    }
   
})


emitter.on('video_peer_created', () => {
    console.log('dom创建完成')
    console.log('offerData',offerData)
    console.log('answerData',answerData)
    console.log('iceData',iceData)
    
    if (offerData) {
        emitter.emit('video_offer_created', offerData)
    }
    if (answerData) {
        emitter.emit('video_answer_created', answerData)
    }
})

emitter.on('audio_peer_created', () => {  
    if (offerData) {
        emitter.emit('audio_offer_created', offerData)
    }
    if (answerData) {
        emitter.emit('audio_answer_created', answerData)
    }
})


emitter.on('1V1OFFER', (data) => {
    offerData = data
   if(data.callType === 'video'){
    if (document.getElementById('localVideo')&& videoViewRef.value.peerStatus === 1) {
        emitter.emit('video_offer_created', offerData)
    }
   }
   if(data.callType === 'audio'){
    if (document.getElementById('localAudio')&& audioViewRef.value.peerStatus === 1) {
        emitter.emit('audio_offer_created', offerData)
    }
   }
  
})

emitter.on('1V1ANSWER', data => {
    answerData = data
    if(data.callType === 'video'){
    if (document.getElementById('localVideo')&& videoViewRef.value.peerStatus === 1) {
        emitter.emit('video_answer_created', answerData)
    }
}
    if(data.callType === 'audio'){
    if (document.getElementById('localAudio')&& audioViewRef.value.peerStatus === 1) {
        emitter.emit('audio_answer_created', answerData)
    }
}

})

emitter.on('audio_peer_closed',()=>{
    offerData = null;
        answerData =null;
        iceData =null;
})

emitter.on('video_peer_closed',()=>{
    offerData = null;
        answerData =null;
        iceData =null;
})

emitter.on('1V1ICE', data => {
    iceData = data
   if(data.callType === 'video'){
    if (document.getElementById('localVideo')&&videoViewRef.value.peerStatus === 1) {
        emitter.emit('video_ice_created', iceData)
    }
   }
   if(data.callType === 'audio'){
    if (document.getElementById('localAudio')&& audioViewRef.value.peerStatus === 1) {
        emitter.emit('audio_ice_created', iceData)
    }
   }

})


emitter.on('video_user_id', (id) => { video_user_id.value = id })
emitter.on('audio_user_id', (id)=>{audio_user_id.value = id})
function usernameChange() {
    console.log(_username.value, '用户名')
}

function personalInfoDialogOpened() {
    let clossBtn = document.querySelector('.personal-info-dialog  .el-dialog__headerbtn')
    clossBtn.addEventListener('click', dislogClose)
}


function dislogClose() {
    _username.value = username.value;
    _signature.value = signature.value;
    _sex.value = sex.value;
    avatar.value = avatarUrl.value;
    console.log('关闭弹窗')
}

function savePersonalInfoChange() {
    if (_sex.value !== sex.value || _signature.value !== signature.value || username.value != _username.value || avatar.value.length !== avatarUrl.value.length) {
        let paramData = { user_id: Cookies.get('user_id'), expires: localStorage.getItem('expires') }

        if (_username.value !== username.value) {
            paramData.username = _username.value
        }
        if (_sex.value !== sex.value) {
            paramData.sex = _sex.value
        }
        if (_signature.value !== signature.value) {
            paramData.signature = _signature.value
        }
        if (avatar.value !== avatarUrl.value) {
            paramData.avatar = avatar.value
        }
        console.log('参数对象', paramData)

        fetch('/api/updateUserInfo', { method: 'POST', body: JSON.stringify(paramData) }).then(res => res.json()).then(res => {
            let userObj = res
            if (userObj.username) {
                emitter.emit('login', { status: Cookies.get('isLogin'), name: userObj.username, avatar_: userObj.avatar, signature_: userObj.signature, sex_: userObj.sex })
                showPersonalInfo.value = false;
                ElMessage({
                    message: '修改成功',
                    type: 'success'
                })
            }

        })
    } else {
        ElMessage({
            message: '未修改任何信息',
            type: 'warning'
        })
    }
}

function userLogout() {
    console.log(store.ws, 'ws_inst')
    store.ws.send(JSON.stringify({
        type: 'logout',
        fromUserId: Cookies.get('user_id'),
    }))
    fetch('/api/logout', { method: 'POST', body: JSON.stringify({ user_id: Cookies.get('user_id') }) }).then(res => res.json()).then(res => {
        console.log(res, '退出登录')
        if (res.message === '退出成功') {
            store?.ws?.close?.()
            ElMessage({
                message: '退出成功',
                type: 'success'
            })
        }
    })
    console.log(router, 'router')
    showPersonalInfo.value = false
    Cookies.remove('name');
    Cookies.remove('isLogin');
    Cookies.remove('avatar');
    Cookies.remove('sex');
    Cookies.remove('signature');
    Cookies.remove('user_id');
    isLogin.value = 0;
    emitter.emit('updateHeader')

    router.push('/login')

}


function changeAvatar() {
    let file = document.createElement('input')
    file.type = 'file'
    file.click();
    file.onchange = function (e) {
        console.log(e.target.files[0])
        let currentFile = e.target.files[0];
        console.log('当前文件', currentFile)
        let reader = new FileReader()
        reader.readAsDataURL(currentFile)
        reader.onload = function (e) {
            console.log(e.target.result);
            avatar.value = e.target.result
        }

    }
}

function websocketMessage(e) {
    console.log('收到消息', e.data)
    let data = JSON.parse(e.data)
    console.log(data)
    if (data.type === 'call_start') {
        let { type, ...user } = data;
        Object.assign(userInfo, user);
        console.log('呼叫对象信息', userInfo);
        console.log(call_in.value, 'ssss')
        if(videoViewRef.value.show||audioViewRef.value.show){
            store.ws.send(JSON.stringify({
                type:'call_refuse',
                fromUserId:Cookies.get('user_id'),
                toUserId:userInfo.fromUserId,
                content:'对方正在通话中'
            }))
        }else{
            call_in.value.showCallIn = true
            call_in.value.playAudio()
        }
       
    }
    if (data.type === 'call_start_1') {

    }
    if (data.type === 'call_start_0') {
        ElMessage.error(data.content);
        emitter.emit('call_respones');
    }
    if (data.type === "call_accept") {
        emitter.emit('call_respones');
        emitter.emit('call_accept', data)
    }
    if (data.type === '1V1ICE') {
        emitter.emit('1V1ICE', data)
    }
    if (data.type === '1V1OFFER') {
        emitter.emit('1V1OFFER', data)
    }
    if (data.type === '1V1ANSWER') {
        emitter.emit('1V1ANSWER', data)
    }
    if(data.type === 'call_refuse'){
      emitter.emit('call_respones');
      let notify = ElNotification({
      title: '提示',
      message: data.content,
      type: 'error',
      duration: 3000,
      position:'bottom-right',
    })
    }
    if(data.type === '1V1CLOSE'){
        if(data.callType==='video'){
            videoViewRef.value.closeLocalStream()
            videoViewRef.value.show = false;
        }
        if(data.callType==='audio'){
            audioViewRef.value.closeLocalStream()
            audioViewRef.value.show = false;
        }
        offerData = null;
        answerData =null;
        iceData =null;
    let notify = ElNotification({
      title: '提示',
      message: data.content,
      type: 'error',
      duration: 3000,
      position:'bottom-right',
    })
    }
    
    if(data.type === 'room_join'){
        emitter.emit('room_join', data)
    }
    if(data.type === 'room_leave'){
        emitter.emit('room_leave', data)
    }
    if(data.type === 'room_offer'){
        emitter.emit('room_offer', data)
    }
    if(data.type === 'room_answer'){
        emitter.emit('room_answer', data)
    }
    if(data.type === 'room_ice'){
        emitter.emit('room_ice', data)
    }
    if(data.type === 'room_message'){
        emitter.emit('room_message', data)
    }
    if(data.type === 'room_screen'){
        emitter.emit('room_screen',data)
    }
    if(data.type === 'room_screen_off'){
        emitter.emit('room_screen_off',data)
    }
}

emitter.on('ws_init',()=>{
    store.ws.onmessage = websocketMessage
})

emitter.on('login', ({ status, name, avatar_, signature_, sex_ }) => {
    // console.log('login11111', data)
    console.log(status, name)
    isLogin.value = status;
    username.value = _username.value = name;
    avatarUrl.value = avatar.value = avatar_;
    _signature.value = signature.value = signature_
    sex.value = _sex.value = sex_
})
onMounted(() => {
    if (Cookies.get('isLogin') === '1') {
        if (!(store.ws.send)) {
            store.ws = initWs(Cookies.get('user_id'))
            setTimeout(() => {
                store.ws.onmessage = websocketMessage
            }, 0);
        }

    }
})
</script>
<style lang="less" setup>
.header-wrap {
    height: 70px;
    background-color: green;
    border-radius: 18px;
    position: relative;

    .logo {
        height: 50px;
        width: 50px;
        line-height: 50px;
        text-align: center;
        color: white;
        font-size: 20px;
        border-radius: 50%;
        border: 2px double #fff;
        position: absolute;
        z-index: 1;
        inset: 0;
        margin: auto 10px;
    }

    .logo-text {
        color: white;
        line-height: 70px;
        font-size: 20px;
        font-style: italic;
        font-weight: bold;
        margin-left: 70px
    }

    .personal-info {
        width: 100%;
        height: 300px;
        display: flex;
        justify-content: space-between;

        .left-content {
            width: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;

            .avatar-setting {
                width: 150px;
                height: 150px;

                position: relative;
                overflow: hidden;

                .avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }

                .change-avatar {
                    position: absolute;
                    bottom: 10px;
                    right: 16px;
                    width: 50px;
                    height: 50px;
                }
            }
        }

        .right-content {
            width: calc(100% - 220px);
            margin-left: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
        }

        .user-info {
            width: 150px;
            text-align: center;
            font-size: 16px;
            margin-top: 10px;
        }
    }

    .application-box {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 10px;
        height: 60px;
        margin: auto 10px auto auto;
        line-height: 70px;

        a {
            color: white;
            margin: 0 10px;
            font-size: 20px;
        }

        .avatar-container {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: inline-block;
            overflow: hidden;

            img {
                width: 100%;
            }
        }

        .username {
            display: inline-block;
            height: 60px;
            vertical-align: top;
            line-height: 60px;
            color: white;
            font-size: 18px;
            margin-left: 10px;
        }
    }
}
</style>