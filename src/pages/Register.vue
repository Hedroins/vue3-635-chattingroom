<template>
    <div class="register-wrap">
        <div class="register-panel">
            <el-form :rules="rules" ref="formIns" :model="ruleForm">
                <p class="title">注册</p>
                <el-form-item label="用户名：" prop="username">
                    <el-input v-model="ruleForm.username" />
                </el-form-item>
                <el-form-item label="性别：" prop="sex">
                    <el-radio-group v-model="ruleForm.sex" class="ml-4">
                        <el-radio value="1">男</el-radio>
                        <el-radio value="2">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                    <el-input v-model="ruleForm.password" type="password" />
                </el-form-item>
                <el-form-item label="确认密码：" prop="comfrimPassword">
                    <el-input v-model="ruleForm.comfrimPassword" type="password" />
                </el-form-item>
                <el-form-item label="邮箱: " prop="email">
                    <el-input v-model="ruleForm.email" />
                </el-form-item>
                <el-form-item prop="submit">
                    <el-button type="primary" @click="onSubmit(formIns)">注册</el-button>
                </el-form-item>
                <div>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
let ruleForm = reactive({
    user_id: '',
    sex: '1',
    username: '',
    password: '',
    email: '',
    comfrimPassword: ''
})
let formIns = ref()

let rules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
    password: [{ required: true, validator: validatePass, trigger: 'blur' }],
    comfrimPassword: [{ required: true, validator: checkPass, trigger: 'blur' }],
    email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
})

function validatePass(rule, value, callback) {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        console.log(ruleForm.comfrimPassword, '1112222')
        if (ruleForm.comfrimPassword?.trim?.()) {
            formIns.value.validateField('comfrimPassword')
        }
        callback()
    }
}

function checkPass(rule, value, callback) {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (value !== ruleForm.password) {
        callback(new Error('两次输入密码不一致!'))
    } else {
        callback()
    }
}


function checkEmail(rule, value, callback) {
    if (value === '') {
        callback(new Error('请输入邮箱'))
    } else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
    } else {
        callback()
    }
}

function onSubmit(formEl) {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
        } else {
            console.log('error submit!')
            return false
        }
    })

    fetch('/api/checkuser', {
        method: 'POST', headers: {
            "Content-Type": "application/json",
            'Keep-Alive': 'timeout=50, max=1000'
        }, mode: 'cors',
        body: JSON.stringify({
            email: ruleForm.email
        })
    }).then(res => res.json()).then(res => {
        if (res.length && res.length > 0) {
            ElMessage.error('该邮箱已被注册')
        } else {
            fetch('/api/registry', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                mode: 'cors',
                body: JSON.stringify({
                    user_id: Math.random().toString().slice(3,18),
                    username: ruleForm.username,
                    password: ruleForm.password,
                    sex: ruleForm.sex,
                    email: ruleForm.email,
                    avatar:ruleForm.sex=='1'?'default-man.png':'default-woman.png',
                })
            }).then(res => res.json()).then(res => {
                ElMessage.success('注册成功')
            })
        }
    })

}
</script>
<style lang='less' scoped>
/deep/ .el-form-item__label {
    font-size: 16px;
    display: inline-block;
    width: 120px;
}

.register-wrap {
    height: calc(100% - 70px - 10px);
    margin-top: 10px;

    .register-panel {
        background-color: #fff;
        border-radius: 5px;
        padding: 20px;
        box-shadow: 0px 0px 10px #ccc;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        .title {
            font-size: 30px;
            font-weight: bold;
            text-align: center;
        }

        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        width:350px;
        height:450px;
        padding:20px;
        box-shadow: inset -2px 0px 8px #0000006c;
    }
}
</style>