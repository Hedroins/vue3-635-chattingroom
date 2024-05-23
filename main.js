import {createApp} from "vue"
import App from "@/App.vue"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './main.less'
import router from '@/router/router.js'
import {createPinia} from 'pinia'
import Cookies from "js-cookie"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


let app = createApp(App)
let pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')



let timer = setInterval(() => {
    import("@/store/user.js").then(res => {
      let user_id = Cookies.get("user_id");
      console.log("user_id",user_id);
      if((!user_id)&&localStorage.getItem('user_id')){
        fetch(`/api/resetUserState`,{method:"POST",body:JSON.stringify({user_id:localStorage.getItem('user_id')})}).then(res =>res.json()).then(data => {
          console.log("用户状态",data);
            if(data.status==1){
                console.log("用户成功退出");
                clearInterval(timer);
            }
          })
      }
    })
},10000)
