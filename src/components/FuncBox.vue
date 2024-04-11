<template>
  <div name="FuncBox">
    <div class="module-box">
        <div class="img-box">
            <img :src="img" alt="创建房间">
        </div>
     <p>{{ text }}</p>
     </div>
  </div>
</template>

<script setup>
import { ref, reactive} from 'vue'
    defineProps(['img','text'])
</script>
<style lang='less' scoped>
  .module-box{
        width:200px;
        height: 300px;
        .img-box{
            height: 200px;
            img{
                width:100%;
                height: 100%;
            }
        }
        p{
            font-size: 30px;
            text-align: center;
        }

    }
    .module-box:hover{
        border: 1px solid #eee;
        transition: border 0.5s;
    }
</style>