<template>
  <v-container style="width:100%;height:100%;max-width:600px;background-size: 100% 100%;"
    :style="{ backgroundImage: 'url(' + require('../assets/bg.jpg') + ')' }" class="pa-4">
    <v-row align="center" class="mt-8">
      <v-col align="center">
        <v-img
          :src="require('../assets/logo-full.png')"
          aspect-ratio="1.5"
          width="80%"
        />
        <!-- <v-img
          :src="require('../assets/bg.jpg')"
          width="100%" style="border-radius: 16px;"
          gradient="to top, rgba(161,91,01,0.8), rgba(101,62,0,0)"
        /> -->
      </v-col>
    </v-row>
    <v-row>
      <v-col >
        <p class="text-sm-h6 subtitle-1 brown--text text--darken-2 both-sides-line font-weight-medium">
          在线预约系统
        </p>
        <v-form ref="loginform" v-model="valid" lazy-validation>
          <v-text-field
            v-model="mobile"
            :rules="mobileRules"
            label="手机号"
          ></v-text-field>
          <v-text-field
            v-model="pswd"
            :rules="pswdRules"
            type="password"
            label="密码"
          ></v-text-field>
        </v-form>
      </v-col>
    </v-row>

    <v-row class="pl-3 pr-3 mb-12"
      justify="space-between"
    >
      <v-btn x-large width="45%" depressed color="primary" @click="login">
        登录
      </v-btn>
      <v-btn x-large width="45%" outlined color="primary" @click="regist">
        注册
      </v-btn>
    </v-row>

    <v-dialog 
      v-model="dialog" fullscreen 
      transition="dialog-bottom-transition" style="max-width: 600px;"
    >
      <Register @cancle="dialog = false"></Register>
    </v-dialog>
    
    <v-snackbar
      class="mt-16"
      top
      multi-line
      text
      :color="loginSuccess ? 'green darken-2' : 'red darken-2'"
      v-model="snackbar"
    >
      {{ msg }}

      <template v-slot:action="{ attrs }">
        <v-btn
          :color="loginSuccess ? 'green darken-2' : 'red darken-2'"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          <v-icon small class="mr-2" :color="verifyed ? 'green darken-2' : 'red darken-2'">
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-footer color="rgba(255, 255, 255, 0)" absolute>
      <v-col
        class="text-center brown--text text-caption"
        cols="12"
      >
        {{ new Date().getFullYear() }} © <strong>西永微电子产业园</strong>  · All Rights Reserved
      </v-col>
    </v-footer>
  </v-container>
</template>

<script>
  import md5 from 'js-md5';
  import Register from '../components/Register.vue'
  export default {
  components: { Register },

    data: () => ({
      dialog: false,
      valid: false,
      snackbar: false,
      verifyed: false,
      msg: '',
      loginSuccess: false,
      mobile: '',
      mobileRules: [(v) => !!v || "手机号必填"],
      pswd: '',
      pswdRules: [(v) => !!v || "密码必填"]
    }),

    computed: {
    },

    mounted () {
      if(localStorage.getItem('loginuser') !== null){
        this.mobile = JSON.parse(localStorage.getItem('loginuser')).userinfo.mobile
        this.pswd = localStorage.getItem('pswd')
        localStorage.clear()
        this.autoLogin()
      }

      let ws = new WebSocket('ws:47.94.101.127:12391')
      let _this = this
      ws.onopen = function () {
        console.log('握手成功')
        _this.ws.send('Hello World')
      }
    },

    methods: {
      validate() {
        return this.$refs.loginform.validate();
      },
      login () {
        if(this.validate()){
          this.$http
          .post('/index/index/userlogin', {
            mobile: this.mobile,
            pass: md5(this.pswd)
          })
          .then((response) => {
            console.log(response.data)
            if(response.data.code === 200){
              this.loginSuccess = true
              this.msg = response.data.msg
              this.verifyed = true
              this.snackbar =true
              localStorage.setItem('loginuser', JSON.stringify(response.data))
              localStorage.setItem('pswd', md5(this.pswd))
              this.$nextTick(()=>{
                this.$router.push('home')
              })
            }else if(response.data.code === 400){
              this.msg = response.data.msg
              this.snackbar =true
            } else {
              this.msg = response.data.msg
              this.snackbar =true
            }
          })
          .catch((error) => {
            console.log(error)
          })
        }
      },
      autoLogin () {
        this.$http
          .post('/index/index/userlogin', {
            mobile: this.mobile,
            pass: this.pswd
          })
          .then((response) => {
            console.log(response.data)
            if(response.data.code === 200){
              this.loginSuccess = true
              this.msg = response.data.msg
              this.verifyed = true
              this.snackbar =true
              localStorage.setItem('loginuser', JSON.stringify(response.data))
              localStorage.setItem('pswd', this.pswd)
              this.$nextTick(()=>{
                this.$router.push('home')
              })
            }else if(response.data.code === 400){
              this.msg = response.data.msg
              this.snackbar =true
            } else {
              this.msg = response.data.msg
              this.snackbar =true
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },
      regist () {
        this.dialog = true
      },
      is_weixin() {
        var ua = navigator.userAgent.toLowerCase()
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true
        } else {
            return false
        }
      }
    },
  }
</script>

<style>
  .both-sides-line{
    text-align: center;
    position: relative;
    width: 100%;
  }
  .both-sides-line:before, .both-sides-line:after{
    content: "";
    position: absolute;
    background: #6D4C41;
    height: 1px;
    width: 36px;
    top: 14px;
  }
  .both-sides-line:before{
    margin-left: -40px;
  }
  .both-sides-line:after{
    margin-left: 4px;
  }
</style>