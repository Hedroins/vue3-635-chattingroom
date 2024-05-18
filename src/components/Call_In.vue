<template>
    <el-dialog v-model="showCallIn" title="来电显示" width="500" height="550" class="personal-info-dialog" @opened="()=>{}">
            <template #header>
                <span>{{ userInfo.fromUser }}来电</span>
            </template>
            <div class="call-in">
                <div style="width:100px;height:100px;border-radius: 50%;overflow: hidden;margin: 0 auto;">
                    <img :src="userInfo.avatar" width="100%" height="100%" alt="用户头像">
                </div>
                <div style="text-align: center;margin-top: 10px;">
                    <span style="font-size: 20px;">{{ userInfo.fromUser }}</span>
                </div>
                <div style="text-align: center;margin-top: 20px;display: flex;justify-content: center;padding-bottom: 20px;">
                    <el-button type="success" size="large" @click="joinInCall">接听</el-button>
                    <el-button type="danger" size="large" style="margin-left:50px" @click="hangup">挂断</el-button>
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
</template>

<script setup>
import { ref, reactive} from 'vue'
import {useWebSocketStore} from '@/store/websocket' 
import Cookies from 'js-cookie'   
import {base64ToStr} from '@/tools/tool'
import emitter from '@/mitt/mitt'
let showCallIn = ref(false)
let store = useWebSocketStore()
let props = defineProps(['userInfo'])
defineExpose({
    showCallIn
})
function joinInCall() {
    let isCallSide = false
    console.log('data',props.userInfo.callType)
    emitter.emit('click_accept', {data:props.userInfo,isCallSide})
    if(props.userInfo.callType==='video'){
        emitter.emit('video_user_id',props.userInfo.fromUserId)
    }
    if(props.userInfo.callType==='audio'){
        emitter.emit('audio_user_id',props.userInfo.fromUserId)
    }
    store.ws.send(JSON.stringify({
        type: "call_accept",
        fromUserId:Cookies.get('user_id'),
        toUserId: props.userInfo.fromUserId,
        fromUser:base64ToStr(Cookies.get('name')),
         avatar:Cookies.get('avatar'),
        callType:props.userInfo.callType
    }))
    showCallIn.value = false;
}

function hangup(){
    store.ws.send(JSON.stringify({
        type: "call_refuse",
        fromUserId:Cookies.get('user_id'),
        toUserId: props.userInfo.fromUserId,
        content:'对方拒绝了你的请求'
    }))
    showCallIn.value = false;
}
</script>
<style lang='less' scoped>

</style>