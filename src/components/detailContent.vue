<template>
  <div name="DetailContent" class="detial-wrap">
      <RouterView></RouterView>
  </div>
</template>

<script setup>
import { ref, reactive} from 'vue'
import {RouterView} from 'vue-router'

</script>
<style lang='less' scoped>
    .detial-wrap{
        height: 100%;
        border:1px solid #dcdfe6;
    }
</style>