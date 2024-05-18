import {defineStore} from 'pinia'

export const useWebSocketStore = defineStore('websocket', {
    state: () => ({
        ws:null
    }),
    persist: true
})