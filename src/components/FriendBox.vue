<template>
    <div name="FriendBox">
        <div class="friend-box">
            <div class="user-box">
                <div class="avatar-box" ><img :src="avatarUrl" alt=""></div>
                <div class="username">{{ username }}</div>
                <img :src="sex === '1' ? 'male.png' : 'female.png'"
                    style="width:20px;margin-left: 5px;height: 20px;align-self: center;">
                <slot name="dot"></slot>
                <slot name="middle" class="text-style"></slot>
            </div>
            <slot name="tail"></slot>
        </div>
        <slot name="footer"></slot>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
defineProps(['avatarUrl', 'username', 'sex'])
</script>
<style lang='less' scoped>
div[name="FriendBox"] {
    width: 80%;
    height: 70px;
    position: relative;
    border: 1px solid #888888;
    border-radius: 35px;
    border-bottom: none;
    box-shadow: 0px 7px 5px -5px #888888;
    margin-top: 20px;
    flex-shrink: 0;


}

.friend-box {
    height: 50px;
    position: absolute;
    inset: 0;
    margin: auto auto auto 50px;

    .user-box {
        display: inline-flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        width: calc(80% - 45px);
        .username {
            line-height: 50px;
            flex:0 1 auto;
            margin-left: 10px;
            height: 50px;
            font-size: 20px;
            color: #000000;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;

        }
    }
}

div[name="FriendBox"]:hover {
    background-color: #00800080;
}

.avatar-box {
    display: inline-block;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    flex:0 0 50px;
    img {
        width: 50px;
    }
}
</style>