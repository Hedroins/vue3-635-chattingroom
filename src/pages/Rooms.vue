<template>
  <div name="Rooms" class="Rooms">
     <el-row style="height:calc(100% - 20px);">
       <el-col :span="8" style="height: 100%;">
        <div style="height: 100%;margin: 10px auto 10px 10px;border: 1px solid #ddd;">
          <div style="height: 45px;background-color: green;line-height: 45px;padding: 0 20px;color: #fff;"><el-icon :size="20" style="vertical-align:middle"><ChatDotRound  /></el-icon><span style="vertical-align: middle;margin-left: 8px;">房间列表</span></div> 
          <div style="height: calc(100% - 85px);overflow: auto;padding: 20px;">
            <el-card v-for="(item) in roomList" :key="item.room.room_id" @click="getMemberList(item.room)" style="margin-bottom:20px;overflow: hidden;">
              <div style="position: relative;"><img :src="item.room.room_avatar" style="width: 50px;height: 50px;border-radius: 50%;vertical-align: middle;">
           <span style="vertical-align: middle;margin-left: 10px;">{{ item.room.room_name }}</span>
           <span style="vertical-align: middle;color:#909399;top:50%;position: absolute;right: 10px;transform: translateY(-50%);">在线:{{ item.online }}/ {{ item.room.room_members.length }}</span>
        </div>
      </el-card>
          </div>
        </div>
        
      </el-col>
       <el-col :span="16"  style="height: 100%;">
        <div style="height:100%;margin: 10px auto 10px 10px;border: 1px solid #ddd;">
          <div style="height: 45px;background-color: green;line-height: 45px;padding: 0 20px;color: #fff;"><el-icon :size="20" style="vertical-align:middle"><Avatar  /></el-icon><span style="vertical-align: middle;margin-left: 8px;">成员列表</span></div> 
          <div style="height: calc(100% - 85px);overflow: auto;padding: 20px;position: relative;">
            <div style="height: 40px;color:#909399;position: static;width: calc(100% - 40px);z-index:9999">房间名称:&nbsp;&nbsp;&nbsp;&nbsp;{{ _room.room_name }}
              <el-button type="primary" style="position: absolute;right: 40px;" @click="joinInRoom">进入房间</el-button>
            </div>
          <el-card v-for="(item) in memberList" :key="item.user_id" style="margin-bottom:20px;position: relative; vertical-align: middle;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
           <img :src="item.avatar" style="width: 50px;height: 50px;border-radius: 50%;vertical-align: middle;">
           <span class="status-dot" :style="{color: item.isLogin == 1 ? 'rgb(40,227,36)' : 'rgb(223,35,35)'}">.</span>
           <span style="vertical-align: middle;margin-left: 20px;font-size: 20px;">{{ item.username }}</span>
           <img :src="item.sex==='1'?'male.png':'female.png'" style="width: 20px;vertical-align: middle;margin-left: 10px;">
           <span class="text-style">{{ item.signature }}</span>
        </el-card>
          </div>
        </div>
      </el-col>
     </el-row>
  </div>
</template>

<script setup>
import { ref, reactive} from 'vue'
import {useRouter} from 'vue-router'
import Cookies from 'js-cookie'
import {ChatDotRound,Avatar} from '@element-plus/icons-vue'
let roomList = reactive([])
let memberList = ref([])
let _room = reactive({})
let router = useRouter()
function getRoomList(){
  fetch('/api/getRoomList',{
    method:'POST',
    headers:{
      ContentType:'application/json'
    },body:JSON.stringify({
      user_id:Cookies.get('user_id')
    })
  }).then(res=>res.json()).then(res=>{
    console.log('roomInfo',res)
     Object.assign(roomList,res)
     if(res[0]){
      getMemberList(res[0].room)
     }
    
  })
}
function joinInRoom(){
router.push({
  name:'roomChatting',
  params:{
    id:_room.room_id
  }
})

}
function getMemberList(room){
   Object.assign(_room,room)
    fetch('/api/getMemberList',{
      method:'POST',
      headers:{
        ContentType:'application/json'
      },body:JSON.stringify({
        room_id:room.room_id
      })
    }).then(res=>res.json()).then(res=>{
      console.log('memberList',res)
      memberList.value = res
      memberList.value.sort((a,b)=>b.isLogin-a.isLogin)
    })
}
getRoomList()
</script>
<style lang='less' scoped>
   .Rooms{
    box-sizing: border-box;
    height: 100%;
    padding: 10px 20px;
    .status-dot {
      display: inline;
      font-size: 78px;
      position: absolute;
      left: 50px;
      top: 43%;
      vertical-align: middle;
      line-height: 0;
    }
    .text-style {
      display: inline-block;
      font-size: 14px;
      margin-left: 10px;
      vertical-align: middle;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color:#909399
    }
   }
</style>