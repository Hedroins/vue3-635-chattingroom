<template>
  <div name="Aside">
    <el-menu
        :default-active="routeName"
        class="el-menu-vertical-demo"
        :router="true"
      >
            <el-menu-item  index="main">
          <el-icon><icon-menu/></el-icon>
          <span>主页</span>
        </el-menu-item>
        <el-menu-item index="friends">
          <el-icon><List /></el-icon>
          <span>好友列表</span>
        </el-menu-item>
        <el-menu-item index="rooms" d>
          <el-icon><View /></el-icon>
          <span>房间</span>
        </el-menu-item>
        <el-menu-item index="more">
          <el-icon><setting/></el-icon>
          <span>更多</span>
        </el-menu-item>
      </el-menu>
  </div>
</template>

<script setup>
import { ref, reactive} from 'vue'
import {View,Menu as IconMenu,List,Setting} from '@element-plus/icons-vue'
import { useRouter,useRoute } from 'vue-router'

let route = useRoute()
let routeName = route.name
</script>
<style lang='less' scoped>
  *[name='Aside']{
    height:100%;
    border: 1px solid #eee;
  }
</style>