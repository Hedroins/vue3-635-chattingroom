<template>
  <div name="Friends" class="friends">
    <el-input v-model="searchValue" style="width: 60%;margin-top:20px;height:50px;margin-left: 20%;" placeholder="搜索好友"
      :prefix-icon="Search" />
    <div class="friends-container">
      <FriendBox v-for="(item, index) in users_copy" :avatarUrl="item.avatar" :key="item.user_id"
        :username="item.username" :sex="item.sex" :signature="item.signature" class="friendBox">
        <template #footer>
          <div class="scrollFooter" v-if="index === users_copy.length - 1"></div>
        </template>
        <template #middle><span class="text-style">{{ item.signature }}</span></template>
        <template #dot><span class="status-dot" :style="{color: item.isLogin == 1 ? 'rgb(40,227,36)' : 'rgb(223,35,35)'}">.</span></template>
        <template #tail>
          <div class="func-container"
            style="width:calc(20% - 25px);display:inline-flex;height:30px;justify-content: space-between;vertical-align: 0.5em;"
            @click="userFunc($event, item.user_id)">
            <img :src="vedioPhone" alt="视频通话" width="30px">
            <img :src="audioPhone" alt="语音通话" width="30px">
            <img :src="Message" alt="消息" width="30px">
            <img :src="More" alt="更多" width="30px">
          </div>
        </template>
      </FriendBox>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import avatar from '~/images/199.png'
import { ElMessage } from 'element-plus';
import vedioPhone from '~/images/vedio-phone.png'
import audioPhone from '~/images/audio-phone.png'
import Message from '~/images/message.png'
import More from '~/images/more.png'
import FriendBox from '@/components/FriendBox.vue'
import { Search } from '@element-plus/icons-vue'
import Cookies from 'js-cookie'
import { useWebSocketStore} from '@/store/websocket'
import {base64ToStr} from '@/tools/tool'
import emitter from '@/mitt/mitt'

let searchValue = ref('')
let store = useWebSocketStore()
let users = [];
let users_copy = ref([])
let limitValue = 10;
let currentIndex = 10
let current_user_id = ref('')
import { ElNotification } from 'element-plus'


function userFunc(e, user_id) {
  console.log('user_id', user_id)
  let fucType = e.target.getAttribute('alt')
  if (fucType === '语音通话') {
     current_user_id.value = user_id;
     emitter.emit('audio_user_id',user_id)
     let notify = ElNotification({
      title: '提示',
      message: '正在请求语音通话，请稍后<span class="loading-dot"><span>',
      type: 'success',
      duration: 0,
      showClose:false,
      position:'bottom-right',
      dangerouslyUseHTMLString:true

    })
    emitter.on('call_respones',()=>{
       notify.close()
    })
    store.ws.send(JSON.stringify({
            type: 'call_start',
            fromUserId: Cookies.get('user_id'),
            fromUser:base64ToStr(Cookies.get('name')),
            toUserId: user_id,
            avatar:  Cookies.get('avatar'),
            callType:'audio'
     }))

  } else if (fucType === '视频通话') {
    current_user_id.value = user_id;
    emitter.emit('video_user_id',user_id)
    let notify = ElNotification({
      title: '提示',
      message: '正在请求视频通话，请稍后<span class="loading-dot"><span>',
      type: 'success',
      duration: 0,
      showClose:false,
      position:'bottom-right',
      dangerouslyUseHTMLString:true

    })
    emitter.on('call_respones',()=>{
      notify.close()
    })
    store.ws.send(JSON.stringify({
            type: 'call_start',
            fromUserId: Cookies.get('user_id'),
            fromUser:base64ToStr(Cookies.get('name')),
            toUserId: user_id,
            avatar:  Cookies.get('avatar'),
            callType:'video'
     }))
  } else if (fucType === '更多') {
    console.log('更多')
    showVedioDialog.value = true
  } else if (fucType === '消息') {
    console.log('消息')
  } else if (fucType === '更多') {
    console.log('更多')
  }
}

onMounted(() => {
  fetch('/api/getFriends', {
    method: 'POST',
    body: JSON.stringify({
      user_id: Cookies.get('user_id')
    })
  })
    .then(res => {
      return res.json()
    }).then(data => {
      console.log('data', data)
      users = data
      users_copy.value = users.slice(0, currentIndex);
      if (users.length > 10) {
        nextTick(() => {
          let footerFlag = document.querySelector('.scrollFooter');
          let intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
              if (entry.intersectionRatio === 1) {
                users_copy.value = users.slice(0, currentIndex + limitValue);
                console.log('users_copy.value', users_copy.value)
                currentIndex += limitValue;
                nextTick(() => {
                  let footerFlag = document.querySelector('.scrollFooter');
                  console.log('footerFlag', footerFlag)
                  intersectionObserver.observe(footerFlag);
                })
              }
            })
          })
          intersectionObserver.observe(footerFlag);
        })
      }
    })
  
})



</script>
<style lang='less' scoped>
.friends {
  height: 100%;

  .friends-container {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    overflow-y: auto;
    height: calc(100% - 70px);

    .text-style {
      display: inline-block;
      font-size: 14px;
      width: calc(70% - 70px);
      margin-left: 10px;
      vertical-align: 1em;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;

    }

    span {
      font-size: 20px;
      color: #909399;
      margin: auto auto;
    }

    .status-dot {
      display: inline;
      font-size: 78px;
      position: absolute;
      left: 34px;
      top: 17px;
      vertical-align: middle;
      line-height: 0;
    }
  }

  /deep/.el-notification__group .loading-dot{
  display: inline-block;
  font-size: 14px;
   width:3em;
   white-space: pre-wrap;

}

}

</style>