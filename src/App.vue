<template>
<Header :key="headerKey"></Header>
<Root></Root>  
</template>
<script setup>
import Root from '@/pages/Root.vue'
import Header from '@/components/Header.vue'
import emitter from '@/mitt/mitt'
import { ref } from 'vue'

let headerKey = ref(Math.random().toString().slice(3,8))
emitter.on('updateHeader', () => {
    console.log('updateHeaderKey')
  headerKey.value= Math.random().toString().slice(3,8)
})
</script>
