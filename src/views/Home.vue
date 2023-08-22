<template>
  <v-container
    style="
      width: 100%;
      min-height: 100%;
      max-width: 600px;
      background-size: 100% 100%;
    "
    :style="{ backgroundImage: 'url(' + require('../assets/bg.jpg') + ')' }"
  >
    <v-row class="px-3 pt-3">
      <v-spacer></v-spacer>
      <v-menu bottom left transition="slide-y-transition" offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon color="white">mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="dialog4 = true">
            <v-list-item-title>中心动态</v-list-item-title>
          </v-list-item>
          <v-list-item @click="dialog3 = true">
            <v-list-item-title>修改密码</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout()">
            <v-list-item-title>退出</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>

    <v-row
      align="center"
      :style="{
        backgroundImage: 'url(' + require('../assets/massage-bg.png') + ')',
      }"
      class="topbg"
    >
      <v-col align="center" cols="12">
        <v-avatar size="90" class="elevation-0 my-2">
          <img
            style="object-fit: cover; border: 2px solid #fff"
            :src="'api/v1/' + loginuser.userinfo.headpic"
          />
        </v-avatar>
        <div class="text-h6 white--text">{{ loginuser.userinfo.name }}</div>
        <div class="text-caption white--text">
          {{ loginuser.userinfo.company.name }}
        </div>
        <v-chip
          class="mt-4 text-caption"
          color="brown lighten-5"
          text-color="primary"
          v-if="userStatus == 0"
        >
          <span class="mr-2">已服务:{{ orderUsed }}</span>
          <span class="mx-2">当前预约:{{ orderUnuse }}</span>
          <span class="ml-2"
            >可预约:{{ totalnum - orderUsed - orderUnuse }}</span
          >
        </v-chip>
      </v-col>
    </v-row>

    <v-row class="px-4 pt-4" v-if="hasNews">
      <v-alert
        text
        dismissible
        prominent
        color="primary"
        style="width: 100%; text-align: left"
        class="py-2"
      > 
        <div @click="dialog4 = true">
          <div class="text-caption">【最新动态】</div>
          <div class="text-subtitle-2">
            {{ news.title }}
            <span class="text-caption"> - 点击查看详情 </span>
          </div>
        </div>
      </v-alert>
    </v-row>

    <v-row class="px-4 pt-4" v-if="userStatus == 1">
      <v-alert
        prominent
        type="warning"
        text
        color="primary"
        icon="mdi-comment-alert-outline"
        style="width: 100%; text-align: left"
      >
        <h3 class="mb-2">正在审批中</h3>
        <v-row class="ma-0 text-caption">
          请耐心等待，如有疑问，请联系管理员</v-row
        >
        <v-row class="ma-0 text-caption"> 联系电话：023-656666989 </v-row>
      </v-alert>
    </v-row>

    <v-row class="px-4 pt-4" v-if="userStatus == -2">
      <v-alert
        prominent
        type="warning"
        text
        color="primary"
        icon="mdi-comment-alert-outline"
        style="width: 100%; text-align: left"
      >
        <h3 class="mb-2">审批未通过</h3>
        <v-row class="ma-0 text-caption">
          {{ loginuser.userinfo.info }}，如有需要，可重新注册</v-row
        >
        <v-row class="ma-0 text-caption"> 联系电话：023-656666989 </v-row>
      </v-alert>
    </v-row>

    <v-row class="px-4 pt-4" v-if="noAddRight && userStatus == 0">
      <v-alert
        dense
        text
        width="100%"
        icon="mdi-comment-alert-outline"
        type="info"
        class="mb-0"
      >
        <div class="text-subtitle-2" style="text-align: left">
          {{ warningMsg }}
        </div>
      </v-alert>
    </v-row>

    <v-row class="mt-0 pt-2 mb-8" v-if="userStatus == 0">
      <v-col class="pa-4" cols="6">
        <v-btn
          :disabled="noAddRight"
          depressed
          @click="dialog1 = true"
          color="primary"
          block
          x-large
        >
          <div>预约</div>
        </v-btn>
      </v-col>
      <v-col class="pa-4" cols="6">
        <v-btn
          depressed
          @click="dialog2 = true"
          color="primary"
          block
          x-large
          outlined
          dark
        >
          <div>查询</div>
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="px-4" v-if="showNext && userStatus == 0">
      <v-carousel hide-delimiter-background hide-delimiters height="auto">
        <v-carousel-item v-for="(o, i) in olist" :key="i">
          <v-alert
            class="mb-1 myalert"
            prominent
            text
            color="primary"
            style="width: 100%; text-align: left"
          >
            <div style="display: flex">
              <span class="mb-2 text-h6">当前预约</span>
              <span class="mb-2 text-overline"
                >（{{ i + 1 }}/{{ olist.length }}）</span
              >
            </div>
            <tbody class="text-caption">
              <tr>
                <td width="40" class="tb">日期：</td>
                <td>{{ convertTimestamp(o.date) }}</td>
              </tr>
              <tr>
                <td class="tb">时间：</td>
                <td>{{ getPeriod(o.period) }}</td>
              </tr>
              <tr>
                <td class="tb">主项：</td>
                <td>{{ o.subject.split("+")[0] }}</td>
              </tr>
              <tr>
                <td class="tb">辅项：</td>
                <td>{{ o.subject.split("+")[1] }}</td>
              </tr>
            </tbody>
          </v-alert>
        </v-carousel-item></v-carousel
      >
    </v-row>

    <v-row v-if="!showNext && userStatus == 0">
      <v-col>
        <p
          class="
            text-center
            brown--text
            font-weight-medium
            text-subtitle-1
            mb-0
          "
        >
          当前无预约
        </p>
        <p class="text-center brown--text font-weight-light text-overline">
          预约理疗服务放松一下吧
        </p>
      </v-col>
    </v-row>

    <v-dialog
      fullscreen
      transition="dialog-bottom-transition"
      v-model="dialog1"
      style="max-width: 600px"
    >
      <appointment-picker
        :open="dialog1"
        @cancle="dialog1 = false"
        @addOrder="addOrder"
      ></appointment-picker>
    </v-dialog>

    <v-dialog
      fullscreen
      transition="dialog-bottom-transition"
      v-model="dialog2"
      style="max-width: 600px"
    >
      <requestor
        :open="dialog2"
        @cancle="dialog2 = false"
        @cancleOrder="cancleOrder"
      ></requestor>
    </v-dialog>

    <v-dialog v-model="dialog3" max-width="600px">
      <v-card>
        <v-card-title> 修改密码 </v-card-title>
        <v-card-text class="pb-0 pt-3">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              dense
              outlined
              v-model="newpswd"
              type="password"
              :rules="newpswdRules"
              label="新密码"
            ></v-text-field>
            <v-text-field
              dense
              outlined
              v-model="comfirmpswd"
              type="password"
              :rules="comfirmpswdRules"
              label="确认密码"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-btn color="grey" text @click="cancelDialog3"> 取消 </v-btn>
          <v-btn color="primary" text @click="changePSWD"> 提交 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialog4"
      fullscreen
      transition="dialog-bottom-transition"
      style="max-width: 600px"
    >
      <news :open="dialog4" @cancle="dialog4 = false"></news>
    </v-dialog>

    <v-snackbar
      class="mt-16 text-wrapper"
      top
      multi-line
      text
      :color="verifyed ? 'green darken-2' : 'red darken-2'"
      v-model="snackbar"
    >
      {{ msg }}

      <template v-slot:action="{ attrs }">
        <v-btn
          :color="verifyed ? 'green darken-2' : 'red darken-2'"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          <v-icon
            small
            class="mr-2"
            :color="verifyed ? 'green darken-2' : 'red darken-2'"
          >
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-btn color="primary" dark fixed bottom right fab @click="dialog5 = true">
      <v-icon>mdi-card-account-phone</v-icon>
    </v-btn>

    <v-dialog v-model="dialog5" width="500">
      <v-card>
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <v-card-title class="text-h6 primary--text"
              ><v-img
                width="20"
                class="mr-8"
                style="border-radius: 8px"
                :src="require('../assets/doctor.jpg')"
              ></v-img
              >刘医生</v-card-title
            >

            <v-card-subtitle class="pt-2 pb-0 mb-0 primary--text"
              >联系电话：15683998695</v-card-subtitle
            >
            <v-card-subtitle class="pt-0 mt-0 primary--text text-caption">
              <a href="tel:15683998695" class="call"
                >点击拨号<v-icon size="10" color="primary"
                  >mdi-phone-dial</v-icon
                ></a
              >
            </v-card-subtitle>
          </div>

          <v-avatar class="ma-3" size="125" tile>
            <v-img :src="require('../assets/doc.jpg')"></v-img>
          </v-avatar>
        </div>
      </v-card>
    </v-dialog>

    <v-footer absolute color="rgba(255, 255, 255, 0)">
      <v-col class="text-center primary--text text-caption" cols="12">
        {{ new Date().getFullYear() }} © <strong>微电园脊养中心</strong> · All
        Rights Reserved
      </v-col>
    </v-footer>
  </v-container>
</template>

<script>
import AppointmentPicker from "../components/AppointmentPicker.vue";
import Requestor from "../components/Requestor.vue";
import News from "../components/News.vue";
import md5 from "js-md5";
export default {
  name: "Home",
  components: { AppointmentPicker, Requestor, News },
  mounted() {
    this.getOrder();
    this.getUsedOrder();
    this.getLatestNews();
    this.usenum = this.loginuser.userinfo.usenum;
    this.unusenum = this.loginuser.userinfo.unusenum;
    this.totalnum = this.loginuser.userinfo.num;
  },
  data: () => ({
    alert: false,
    dialog1: false,
    dialog2: false,
    dialog3: false,
    dialog4: false,
    dialog5: false,
    valid: true,
    snackbar: false,
    verifyed: false,
    orderUnuse: 0,
    orderUsed: 0,
    usenum: 0,
    unusenum: 0,
    totalnum: 0,
    msg: "",
    newpswd: "",
    comfirmpswd: "",
    order: {},
    orderlist: {},
    showNext: false,
    hasNews: false,
    news: {},
    newsList: [],
    newpswdRules: [(v) => !!v || "请输入新密码"],
  }),
  computed: {
    comfirmpswdRules: function () {
      const rules = [];
      let rule = (v) => !!v || "请输入确认密码";
      rules.push(rule);
      rule = (v) => (!!v && v) === this.newpswd || "两次输入的密码不一致";
      rules.push(rule);
      return rules;
    },
    loginuser: function () {
      return JSON.parse(localStorage.getItem("loginuser"));
    },
    userStatus: function () {
      return JSON.parse(localStorage.getItem("loginuser")).userinfo.status;
    },
    noAddRight: function () {
      if (this.loginuser.ordersetting.datenum == 0) {
        return false;
      } else if (this.loginuser.ordersetting.datenum > 0)
        return (
          this.loginuser.ordersetting.datenum <= this.unusenum ||
          this.usenum + this.unusenum >= this.totalnum
        );
      else return true;
    },
    thisYear: function () {
      return new Date().getFullYear();
    },
    warningMsg: function () {
      if (this.loginuser.ordersetting.datenum <= this.unusenum)
        return "当前预约次数达到上限";
      else if (this.usenum + this.unusenum >= this.totalnum)
        return "本年度预约次数已用完";
      else return "";
    },
  },
  watch: {
    dialog1: function () {
      this.getOrder();
      this.getUsedOrder();
    },
    dialog2: function () {
      this.getOrder();
      this.getUsedOrder();
    },
  },
  methods: {
    cancelDialog3() {
      this.dialog3 = false;
      this.newpswd = "";
      this.comfirmpswd = "";
    },
    addOrder() {
      this.unusenum++;
    },

    cancleOrder() {
      this.unusenum--;
    },

    changePSWD() {
      if (this.validate()) {
        this.$http
          .post("/user/user/changepass", {
            pass: md5(this.newpswd),
          })
          .then((response) => {
            if (response.data.code === 200) {
              this.msg = "密码修改成功";
              this.verifyed = true;
              this.snackbar = true;
            } else {
              this.msg = "密码修改失败";
              this.snackbar = true;
            }
          });
      }
    },

    validate() {
      return this.$refs.form.validate();
    },

    getOrder() {
      this.$http
        .post("/service/order/mylist", {
          scope: "unuse",
          stime: this.thisYear + "-01-01",
          etime: this.thisYear + "-12-31",
        })
        .then((response) => {
          console.log(response.data);
          this.orderUnuse = 0;
          this.olist = response.data.orderlist;
          if (this.olist.length > 0) {
            this.orderUnuse = this.olist.length;
            this.order = this.olist[0];
            this.showNext = true;
          } else {
            this.showNext = false;
          }
        });
    },

    getUsedOrder() {
      this.$http
        .post("/service/order/mylist", {
          scope: "used",
          stime: this.thisYear + "-01-01",
          etime: this.thisYear + "-12-31",
        })
        .then((response) => {
          console.log(response.data);
          this.orderUsed = 0;
          let olist = response.data.orderlist;
          if (olist.length > 0) {
            this.orderUsed = olist.length;
          }
        });
    },

    getLatestNews() {
      this.$http.post("/service/content/latest").then((response) => {
        console.log(response.data);
        if (response.data.content !== null) {
          this.hasNews = true;
          this.news = response.data.content;
        }
      });
    },

    expire(date, period) {
      const hour = new Date().getHours();
      if (
        this.convertTimestamp(date) < this.now() ||
        (this.convertTimestamp(date) == this.now() &&
          this.getPeriod(period).substr(-5, 2) <= hour)
      )
        return true;
      else return false;
    },

    getPeriod (period) {
      if(period === '' || period === undefined) {
        return ''
      }else{
        return (period < 10 ? '0'+period : period) + ':00-' + ((period+1) < 10 ? '0'+(period+1) : (period+1)) +':00'
      }
    },

    convertTimestamp(ts) {
      return new Date(ts * 1000)
        .toLocaleDateString("zh", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");
    },

    now() {
      return new Date()
        .toLocaleDateString("zh", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");
    },

    logout() {
      localStorage.clear();
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.topbg {
  background-size: 100% 100%;
  margin-top: -48px;
  padding: 16px;
}
.myalert {
  padding: 12px 72px;
}
.call {
  text-decoration: none;
}
</style>
