<template>
  <v-container class="white" style="min-height: 100%; max-width: 600px">
    <v-btn @click="cancle()" color="grey" x-small dark fixed top right fab>
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-row align="center">
      <p class="text-h6 px-8 pt-4 primary--text">预约时间</p>
      <v-date-picker
        :first-day-of-week="1"
        color="primary"
        locale="cn"
        full-width
        v-model="sdate"
        no-title
        :min="minDay"
        :max="maxDay"
        :allowed-dates="allowedDates"
        @update:picker-date="getWorkingDaysByMonth"
        @change="getWorkingScopeByDay"
      ></v-date-picker>
    </v-row>
    <v-row>
      <v-progress-circular :size="20" v-if="scopeLoading"
      indeterminate style="width:100%;"
      color="grey"
    ></v-progress-circular>
      <v-chip-group column active-class="grey--text" class="time-scope px-4" style="width:100%;" v-model="scope">
        <v-chip
          class="ma-1" 
          v-for="tscope in tscopes"
          :key="tscope.time"
          :value="tscope.period"
          :disabled="expire(tscope.time) || tscope.num == 0"
        >
          {{ tscope.time }} 余{{ tscope.num }}
        </v-chip>
      </v-chip-group>
    </v-row>
    <v-row align="center">
      <p class="text-h6 px-8 pt-4 primary--text">预约项目</p>
    </v-row>
  <v-row class="mx-5">
      <div class="text-subtitle-2 grey--text">固定项目</div>
      </v-row
    >
    <v-row class="mx-5">
      <v-chip-group column v-model="mains" multiple disabled>
        <v-chip disabled v-for="m in mains" :key="m" :value="m"> {{m}} </v-chip>
      </v-chip-group>
    </v-row
    >

    <v-row class="mx-5">
      <div class="text-subtitle-2 grey--text">辅助项目</div></v-row
    >
    <v-row class="mx-5 mb-4">
      <v-chip-group column v-model="subsidiary">
        <v-chip v-for="m in subsidiarys" :key="m" :value="m"> {{m}} </v-chip>
      </v-chip-group></v-row
    >
    <v-row class="px-8 mb-2" v-if="allSelected">
      <v-alert
        prominent
        type="info"
        text
        color="brown"
        style="width: 100%; text-align: left"
      >
        <h3 class="mb-2">预约详情</h3>

      <tbody class="text-caption">
        <tr>
          <td width="40" class="tb">日期：</td>
          <td>{{ sdate }}</td>
        </tr>
        <tr>
          <td class="tb">时间：</td>
          <td>{{ getPeriod(scope) }}</td>
        </tr>
        <tr>
          <td class="tb">主项：</td>
          <td>{{ main }}</td>
        </tr>
        <tr>
          <td class="tb">辅项：</td>
          <td>{{ mysubsidiary }}</td>
        </tr>
      </tbody>
      </v-alert>
    </v-row>
    <v-row class="px-8 pb-8">
      <v-btn :disabled="!allSelected" depressed x-large block color="primary" @click="apply"> 预约 </v-btn>
    </v-row>
    <v-snackbar
      class="mt-16 text-wrapper"
      top
      multi-line
      text
      :color="verifyed ? 'green darken-2' : 'red darken-2'"
      v-model="snackbar"
    >{{ msg }}<template v-slot:action="{ attrs }">
        <v-btn
          :color="verifyed ? 'green darken-2' : 'red darken-2'"
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

  </v-container>
</template>

<script>
export default {
  name: "AppointmentPicker",

  props: {
    open: Boolean,
  },

  data: () => ({
    mains: [],
    subsidiarys: [],
    subsidiary: "",
    sdate: "",
    scope: "",
    tscopes: [],
    noDays:[],
    scopeLoading: false,
    verifyed: false,
    msg: '',
    snackbar: false
  }),

  computed: {
    today: function () {
      return new Date().toLocaleString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-").substr(0, 10)
    },
    minDay: function () {
      return this.getDateStr(this.loginuser.ordersetting.lateday) + "T" + "00:00:00"
    },
    mysubsidiary: function () {
      return this.subsidiary.replace(/（.*?）/g,'')
    },
    main: function () {
      return this.mains.toString().replace(/（.*?）/g,'')
    },
    maxDay: function () {
      if(this.loginuser.ordersetting.earlyday === 0){
        return undefined
      }else
        return this.getDateStr(this.loginuser.ordersetting.earlyday) + "T" + "00:00:00"
    },
    allSelected: function () {
      if(this.subsidiary === ''  || this.subsidiary === undefined ||
      this.scope === '' || this.scope === undefined || this.sdate === '' || this.sdate === undefined)
        return false
      else 
        return true
    },
    loginuser: function () {
      return JSON.parse(localStorage.getItem("loginuser"))
    },
  },

  watch: {
    open: function () {
      if (this.open) {
        this.getProjects()
        this.getWorkingDaysByMonth()
      }
    },
  },

  mounted() {
    this.getProjects()
    this.getWorkingDaysByMonth()
  },

  methods: {
    getDateStr(AddDayCount) {   
      var dd = new Date()
      dd.setDate(dd.getDate()+AddDayCount)//获取AddDayCount天后的日期  
      var y = dd.getFullYear();  
      var m = (dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1)//获取当前月份的日期，不足10补0  
      var d = dd.getDate()<10?"0"+dd.getDate():dd.getDate()//获取当前几号，不足10补0  
      console.log(y+"-"+m+"-"+d)
      return y+"-"+m+"-"+d
    },
    getDenyDate(shijiancuo, days) {
      console.log(shijiancuo + "+" + days)
      var dd = new Date(shijiancuo*1000)
      console.log(shijiancuo)
      dd.setDate(dd.getDate()+days)//获取AddDayCount天后的日期  
      var y = dd.getFullYear();  
      var m = (dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1)//获取当前月份的日期，不足10补0  
      var d = dd.getDate()<10?"0"+dd.getDate():dd.getDate()//获取当前几号，不足10补0  
      console.log(y+"-"+m+"-"+d)
      return y+"-"+m+"-"+d
    },
    getWorkingScopeByDay(){
      this.tscopes = []
      this.scopeLoading = true
      this.$http
      .post('/service/schedule/useage',{
        date: this.sdate
      })
      .then((response) => {
        response.data.schedule.period.forEach((s, index)=>{
          if(s > 0) {
            this.tscopes.push({
              time: this.getPeriod(index),
              num: response.data.order[index] === undefined ? s : s-response.data.order[index],
              period: index
            })
          }
        })
        this.scopeLoading = false
      })
    },

    getPeriod (period) {
      if(period === '' || period === undefined) {
        return ''
      }else{
        return (period < 10 ? '0'+period : period) + ':00-' + ((period+1) < 10 ? '0'+(period+1) : (period+1)) +':00'
      }
    },

    getWorkingDaysByMonth(month) {
      let qureyMonth = month === undefined ? new Date().toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-").substr(0,7) : month
      this.noDays = []
      this.$http
      .post('/service/schedule/getusemonth',{
        month: qureyMonth
      })
      .then((response) => {
        response.data.schedules.forEach((s, index)=>{
          if(!s.open || (s.num - s.order) == 0) {
            this.noDays.push(index+1)
          }
        })
      })
      console.log(this.noDays)
    },

    getProjects() {
      this.$http.get("/service/subject/get")
      .then((response) => {
        console.log(response.data)
        this.mains = response.data.subject[0].items
        this.subsidiarys = response.data.subject[1].items
      })
    },

    allowedDates(date) {
      const [, , day] = date.split("-");
      if (this.noDays.includes(parseInt(day)))
        return false;
      else return true;
    },

    expire(tscope) {
      const hour = new Date().getHours()
      if (tscope.substr(-5, 2) <= hour && this.sdate === this.today)
        return true;
      else return false;
    },

    apply(){
      this.msg = ''
      if(this.subsidiary === ''  || this.subsidiary === undefined) {
        this.msg = '请选择预约辅助项目'
      }
      if(this.scope === ''|| this.scope === undefined) {
        this.msg = '请选择预约时间段'
      }
      if(this.sdate === ''|| this.sdate === undefined) {
        this.msg = '请选择预约日期'
      }
      if(this.msg !== '') {
        this.snackbar = true
        return
      }
      this.$http
      .post('/service/order/add',{
        date: this.sdate,
        period: this.scope,
        subject: this.main + '+' + this.mysubsidiary
      })
      .then((response) => {
        if(response.data.code==200){
          this.verifyed = true
          this.msg = '预约成功！'
          this.snackbar = true
          this.sdate = ''
          this.scope = ''
          this.subsidiary = ''
          this.$emit("addOrder")

          setTimeout(() => {
              this.cancle()
            }, 1000)
        }
        else if(response.data.errcode==-31105) {
          this.verifyed = false
          this.msg = '您30天内未签到预约已超过'+this.loginuser.ordersetting.expirednum+'次，预约已锁定至'
          +this.getDenyDate(this.loginuser.userinfo.lastexpireddate, this.loginuser.ordersetting.denyday)+'，预约服务后请按时签到使用。'
          this.snackbar = true
        }
        else {
          this.msg = response.data.msg
          this.snackbar = true
        }
      })
    },

    cancle() {
      this.sdate = ''
      this.scope = ''
      this.subsidiary = ''
      this.tscopes = []
      this.$emit("cancle");
    },
  },
};
</script>

<style>
.time-scope .v-slide-group__content {
  justify-content: center;
}

.v-chip-group .v-chip--active {
  color: #fff !important;
  background-color: #795548 !important;
}

.text-wrapper {
  white-space: pre-wrap;
}
.tb {
  vertical-align: top;
}
</style>