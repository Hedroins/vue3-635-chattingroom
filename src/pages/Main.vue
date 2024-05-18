<template>
    <div class="main-wrap">
        <div class="func-box">
            <FuncBox :img="createRoom" text="创建房间" @click="creatRooms"></FuncBox>
            <FuncBox :img="addFriends" text="添加好友" @click="showFriendSearch = true"></FuncBox>
        </div>
        <el-dialog v-model="showFriendSearch" title="添加好友" width="700" center class="search-friend-dialog">
            <template #header>
                <span>添加好友</span>
            </template>
            <div class="search-friend-wrap">
                <div class="search-box">
                    <el-input v-model="searchContent" style="width: 60%;margin-top:20px;height:50px;flex-shrink: 0;"
                        placeholder="请输入好友ID或好友名称搜索" :prefix-icon="Search" />
                    <el-button type="primary" style="flex-shrink: 0;margin-left:30px;margin-top:20px;height:50px"
                        @click="searchFriends" roundsize="large">搜索</el-button>
                </div>

                <div class="search-content-wrap">
                    <span v-if="currentFriends.length === 0">暂无好友</span>
                    <template v-else>
                        <FriendBox v-for="(item, index) in currentFriends" :avatarUrl="item.avatar" :key="item.user_id"
                            :username="item.username"  :sex="item.sex" class="friendBox">
                            <template #middle><span class="text-style">{{ item.signature }}</span></template>
                            <template #tail> <el-button type="primary" roundsize="small" style="position: absolute;right: 50px;top:0;bottom: 0;margin-top: auto;margin-bottom:auto;height: 25px;" @click="addFriend(item.user_id)">添加</el-button  ></template>
                        </FriendBox>
                    </template>
                </div>

            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import createRoom from '~/images/creat-room.png'
import addFriends from '~/images/add-friends.png'
import FuncBox from '@/components/FuncBox.vue'
import FriendBox from '@/components/FriendBox.vue'
import { Search } from '@element-plus/icons-vue'
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'

let showFriendSearch = ref(false);
let currentFriends = reactive([])
let searchContent = ref('')

function searchFriends() {
    fetch('/api/searchFriends', { method: 'POST', body: JSON.stringify({ searchContent: searchContent.value,user_id:Cookies.get("user_id")}) }).then(res => res.json()).then(data => {
        console.log('get data', data)
        currentFriends.length = 0
        currentFriends.push(...data)
    })
}

function creatRooms() {
    fetch('http://localhost:5027/api', { method: 'POST' }).then(res => res.json()).then(data => {
        console.log('get data', data)
    })
}

function addFriend(id) {
    if(id == Cookies.get("user_id")){
        ElMessage({
        type:'error',
        message:'不能添加自己'
       })
       return
    }
    fetch('/api/addFriend', { method: 'POST', body: JSON.stringify({user_id:Cookies.get("user_id"),friend_id: id})}).then(res => res.json()).then(data => {
      if(data.status == 1){
       ElMessage({
        type:'success',
        message:'添加成功'
       })
      }else{
       ElMessage({
        type:'error',
        message:'你已添加该好友'
       })
      }
    })
}
</script>
<style lang='less' scoped>
.main-wrap {
    height: 100%;
}

.func-box {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
}

.search-friend-wrap {
    width: 100%;
    height: 500px;

    .search-box {
        width: 100%;
        display: flex;
        justify-content: center;

    }

    .search-content-wrap {
        height: calc(100% - 90px);
        margin-top: 20px;
        display: flex;
        flex-flow: column nowrap;
        align-items: center;

        .text-style {
            display: inline-block;
            font-size: 14px;
            width: 70px;
            margin-left:10px;
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



    }
}
</style>