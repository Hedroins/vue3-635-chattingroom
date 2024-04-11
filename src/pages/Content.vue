<template>
  <div name="Content" class="content-wrap">
    <div class="aside-wrap">
     <Aside class="sider"></Aside>
   </div>
   <div class="main-wrap">
     <DetailContent ></DetailContent>
   </div>
  </div>
</template>

<script setup>
import { ref, reactive} from 'vue'
import {RouterView} from 'vue-router'
import Aside from '@/components/Aside.vue'
import DetailContent from '@/components/DetailContent.vue'
</script>
<style lang='less' scoped>
.content-wrap{
     display: flex;
     flex-flow: row nowrap;
     justify-content: space-between;
     height:calc(100%  - 70px - 10px);
     margin-top:10px;
}
     .aside-wrap{
        width:20%;
        height:calc(100% - 2px);
   }
   .main-wrap{
       width:calc(80% - 20px);
       height:calc(100% - 2px);
   }

</style>