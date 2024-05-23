<template>
  <div class="login-wrap">
      <el-form :rules="rules" ref="formIns" :model="ruleForm" class="login-panel">
      <p class="title">登录</p>
      <el-form-item label="用户名：" prop="username">
        <el-input v-model="ruleForm.username"  />
    </el-form-item>
    <el-form-item label="密码：" prop="password">
        <el-input v-model="ruleForm.password"  type="password"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit(formIns)">登录</el-button>
    </el-form-item>
    <div>
    </div>
    </el-form>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref, reactive} from 'vue'
import { useRouter } from 'vue-router';
import emitter from '@/mitt/mitt'
import Cookies from 'js-cookie';
import { useWebSocketStore} from '@/store/websocket'
import {initWs} from "@/tools/initWs"

let store = useWebSocketStore()
let router = useRouter()
let ruleForm = reactive({
    username: '',
    password: ''
})
let formIns = ref()
let userInfo = reactive({})

let rules = reactive({username:[{required: true,message: '请输入用户名', trigger: 'blur'}],password:[{ required: true,message:'请输入密码', trigger: 'blur' }]})
function onSubmit(formEl){
    formEl.validate((valid)=>{
        if(valid){
            console.log('当前是否登录',Cookies.get('isLogin'))
            // Cookies.set('isLogin',1)
            // 发送请求
            fetch('/api/login',{method: 'POST',body: JSON.stringify(ruleForm),headers: { 'Content-Type': 'application/json' }}).then(res=>res.json()).then(res=>{
              if(res.username){
                ElMessage.success('登录成功')
                store.ws = initWs(res.user_id)
                // setTimeout(()=>{
                //   emitter.emit('ws_init')
                // },0)
                localStorage.setItem('expires',Math.floor(Date.now())+30*24*60*60*1000)
                localStorage.setItem('user_id',res.user_id)
                emitter.emit('login',{status:1,name:res.username,avatar_:res.avatar,signature_:res.signature,sex_:res.sex})
                router.push({name:'main'})
              }else{
                ElMessage.error('登录失败')
              }
            })
        }else{
            console.log('error submit!')
            return false
        }
    })
}
</script>
<style lang='less' scoped>
/deep/ .el-form-item__label{
    font-size: 16px;
    display: inline-block;
    width:100px;
}
.login-wrap{
    height: calc(100% - 70px - 10px);
    margin-top:10px;
    .login-panel{
        background-color: #fff;
        border-radius: 5px;
        padding: 20px;
        box-shadow: 0px 0px 10px #ccc;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        .title{
            font-size: 30px;
            font-weight: bold;
            text-align: center;
        }
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        width:350px;
        height:400px;
        padding:20px;
        box-shadow: inset -2px 0px 8px #0000006c;
    }
}
</style>