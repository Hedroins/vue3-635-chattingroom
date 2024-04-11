import {createApp} from "vue"
import App from "@/App.vue"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './main.less'
import router from '@/router/router.js'

let app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')