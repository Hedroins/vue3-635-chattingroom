import Main from '@/pages/Main.vue'
import Friends from '@/pages/Friends.vue'
import Rooms from '@/pages/Rooms.vue'
import More from '@/pages/More.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Root from '@/pages/Root.vue'
import Content from '@/pages/Content.vue'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
let routeConfig = [{
    path:'/',
    component:Root,
    redirect:'/func/main',
    children:[
        {
            path: 'login',
            name:'login',
            component: Login
        }, {
            path: 'register',
            name:'register',
            component: Register
        }, {
            path:'func',
            component:Content,
            redirect:'main',
            children:[{
                name:'main',
                path: 'main',
                component: Main
            }, {
                path: 'friends',
                component: Friends,
                name:'friends'
            }, {
                path: 'rooms',
                component: Rooms,
                name:'rooms'
            }, {
                path: 'more',
                component: More,
                name:'more'
            }]
        },
    ]
}]


export default createRouter({
    history: createWebHashHistory(),
    routes: routeConfig
})