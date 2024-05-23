<template>
    <el-dialog v-model="showCreateRoom" title="创建房间" width="700" height="550" class="personal-info-dialog"
        @opened="() => { }" @close="showCreateRoom = false" top>
        <template #header>
            <span>创建房间</span>
        </template>
        <div class="room-info">
            <div class="room-avatar">
                <div class="avatar-setting" @click="changeRoomAvatar">
                    <img class="avatar" :src="avatar" alt="头像图片">
                    <img class="change-avatar" src="change-avatar.png" alt="更换头像图片">
                </div>
            </div>
            <el-form class="form-item-margin">
                <el-form-item label="房间名称">
                    <el-input v-model="roomValue" placeholder="请输入房间名称"></el-input>
                </el-form-item>
                <el-form-item label="成员列表" class="form-item-margin">
                    <el-transfer v-model="value" filterable :filter-method="filterMethod"
                        :render-content="renderFunc"
                        filter-placeholder="输入名称关键字搜索..." :data="data" :titles="['我的好友', '已选成员']"
                        @change="handleChange"/>
                </el-form-item>

            </el-form>
        </div>
        <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createRoom">
        创建房间
        </el-button>
      </div>
    </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'
let showCreateRoom = ref(false);
let memberList = reactive([])
let avatar = ref('default-room-pic.png')
let roomValue = ref('')

let selectedUser = []

defineExpose({
    showCreateRoom
})
function changeRoomAvatar() {
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

function handleChange(value, direction, movedKeys) {
     selectedUser=data.value.filter(item => {
        return value.includes(item.key)
    })
    console.log('选择的用户',selectedUser)
}

function createRoom() {
    if(selectedUser.length==0){
        ElMessage.error('请选择成员')
        return
    }
    if(roomValue.value==''){
        ElMessage.error('请输入房间名称')
        return
    }
   let roomId = Math.random().toString(36).substr(2, 10);
   selectedUser.push({
       key:Cookies.get('user_id'),
   })
   let roomInfo = {
       id:roomId,
       avatar:avatar.value,
       memberList:selectedUser.map(item=>item.key),
       name:roomValue.value
   }
   fetch('/api/createRoom',{
       method:'POST',
       body:JSON.stringify(roomInfo),
       headers:{
           'Content-Type':'application/json'
       }
   }).then(res=>res.json()).then(data=>{
       if(data.name==='ok'){
        ElMessage({message:'创建成功',type:'success'})
        showCreateRoom.value = false
       }
   })
   
}

function renderFunc(h, option) {
    return h('span',null,[h('img', {
        style: {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            marginRight: '10px',
            verticalAlign: 'middle'
        },
            src: option.avatar
    }, null),h('span',{style:{
        verticalAlign:'middle'
    }},option.value)]);
}


const generateData = () => {
  const data = reactive([])
  let  states = ref([])
  fetch('/api/getFriends', {
    method: 'POST',
    body: JSON.stringify({
      user_id: Cookies.get('user_id')
    })
  })
    .then(res => {
      return res.json()
    }).then(result => {
        states.value = result
        console.log(states.value)
        states.value.forEach((user, index) => {
    data.push({
      value: user.username,
      avatar:user.avatar,
      direction:'right',
      key: user.user_id
    })
  })
        })

  return data
}
const data = ref(generateData())
const value = ref([])


const filterMethod = (query, item) => {
  return item.value.includes(query)
}
console.log('create room')
</script>
<style lang='less' scoped>
.room-avatar {
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;

    .avatar-setting {
        width: 150px;
        height: 150px;
        margin: 0 auto;
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

.form-item-margin {
    margin-top: 20px
}

.member-list {
    width: 297px;
    height: 180px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    border-radius: 4px;
    float: left;
    text-align: center;
}

.add-member-button {
    float: left;
    margin-left: 10px
}

.add-member-button::after {
    display: block;
    clear: both;
    content: ''
}
</style>