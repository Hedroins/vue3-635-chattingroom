<template>
  <div name="Friends" class="friends">
    <el-input
      v-model="searchValue"
      style="width: 60%;margin-top:20px;height:50px;margin-left: 20%;"
      placeholder="搜索好友"
      :prefix-icon="Search"
    />
    <div class="friends-container">
      <FriendBox v-for="(item, index) in users_copy"  :avatarUrl="item.imgUrl" :key="index" :username="item.username" :sex="'1'" class="friendBox">
        <template #footer>
          <div class="scrollFooter" v-if="index===users_copy.length-1"></div>
        </template>
      </FriendBox>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive,onMounted,nextTick} from 'vue'
import avatar from '~/images/199.png'
import FriendBox from '@/components/FriendBox.vue'
import { Search } from '@element-plus/icons-vue'
let searchValue = ref('')
// let users = [{
//   imgUrl:avatar,
//   username:'1'
// },{
//   imgUrl:avatar,
//   username:'2'
// },{
//   imgUrl:avatar,
//   username:'3'
// },{
//   imgUrl:avatar,
//   username:'4'
// },{
//   imgUrl:avatar,
//   username:'5'
// },{
//   imgUrl:avatar,
//   username:'6'
// },{
//   imgUrl:avatar,
//   username:'7'
// },{
//   imgUrl:avatar,
//   username:'8'
// },{
//   imgUrl:avatar,
//   username:'9'
// },{
//   imgUrl:avatar,
//   username:'10'
// },{
//   imgUrl:avatar,
//   username:'11'
// },{
//   imgUrl:avatar,
//   username:'12'
// },{
//   imgUrl:avatar,
//   username:'13'
// },{
//   imgUrl:avatar,
//   username:'14'
// },{
//   imgUrl:avatar,
//   username:'15'
// },{
//   imgUrl:avatar,
//   username:'16'
// },{
//   imgUrl:avatar,
//   username:'17'
// },{
//   imgUrl:avatar,
//   username:'18'
// },{
//   imgUrl:avatar,
//   username:'19'
// },{
//   imgUrl:avatar,
//   username:'20'
// },{
//   imgUrl:avatar,
//   username:'21'
// },{
//   imgUrl:avatar,
//   username:'22'
// },{
//   imgUrl:avatar,
//   username:'23'
// },{
//   imgUrl:avatar,
//   username:'24'
// },{
//   imgUrl:avatar,
//   username:'25'
// },{
//   imgUrl:avatar,
//   username:'26'
// },{
//   imgUrl:avatar,
//   username:'27'
// },{
//   imgUrl:avatar,
//   username:'28'
// },{
//   imgUrl:avatar,
//   username:'29'
// },{
//   imgUrl:avatar,
//   username:'30'
// },{
//   imgUrl:avatar,
//   username:'31'
// },{
//   imgUrl:avatar,
//   username:'32'
// },{
//   imgUrl:avatar,
//   username:'33'
// }]

let users=new Array(1000000).fill({
  imgUrl:avatar,
  username:Math.random().toString().slice(3,16)
})
console.log(users.length,'length')
let limitValue = 10;
let users_copy = ref(users.slice(0,limitValue));
let currentIndex =10
onMounted(()=>{
  let footerFlag = document.querySelector('.scrollFooter');
  console.log('footerFlag',footerFlag)
let intersectionObserver = new IntersectionObserver((entries)=>{
  entries.forEach((entry,index)=>{
       if(entry.intersectionRatio===1){
        users_copy.value = users.slice(0,currentIndex+limitValue);
        console.log('users_copy.value',users_copy.value)
        currentIndex+=limitValue;
         nextTick(()=>{
           let footerFlag = document.querySelector('.scrollFooter');
           console.log('footerFlag',footerFlag)
           intersectionObserver.observe(footerFlag);
         })
       }
  })
})
intersectionObserver.observe(footerFlag);
})


</script>
<style lang='less' scoped>
.friends{
  height: 100%;
  .friends-container{
    display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
    height: calc(100% - 70px);
  }
  
}
</style>