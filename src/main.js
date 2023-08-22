import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import axios from 'axios'
import myConfig from './config'

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.config.productionTip = false

axios.defaults.baseURL = myConfig.APIBaseURL

// http request 拦截器
axios.interceptors.request.use(
  config => {
    if(config.url !== '/api/index/index/userlogin') {
      if (JSON.parse(localStorage.getItem("loginuser")) && JSON.parse(localStorage.getItem("loginuser")).token) { // 判断是否存在token，如果存在的话，则每个http header都加上token
        config.headers.token = `${JSON.parse(localStorage.getItem("loginuser")).token}`
      }
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// http response 拦截器
axios.interceptors.response.use(
  response => {
    if (response.data.code === 500) {
      router.replace({
        path: '/login'
      })
    }
    return response
  }
)

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
