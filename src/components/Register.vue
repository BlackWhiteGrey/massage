<template>
  <v-container class="white pa-8" style="min-height: 100%; max-width: 600px">
    <v-btn
      @click="cancle()"
      color="grey"
      x-small
      dark
      fixed
      top
      right
      fab
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-row>
      <span class="mx-4 text-h5 font-weight-bold">用户注册</span>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card elevation="0" :disabled="verifying">
            <v-container fluid>
              <v-row>
                <v-col cols="8" align-self="center">
                  <v-file-input outlined dense
                    v-model="face"
                    :rules="faceRules"
                    accept="image/*"
                    label="录入人脸信息"
                    placeholder="拍摄或选取人脸照片"
                    prepend-icon="mdi-camera"
                    @change="fileChange()"
                  ></v-file-input>
                  <v-btn
                    depressed
                    color="primary"
                    @click="avatarRuleOpen = true"
                  >
                    人脸录入规范
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-img :src="lrzImg" width="100%">
                    <v-fade-transition>
                      <v-overlay v-if="verifying" absolute color="#036358">
                        <v-btn>{{ msg }}</v-btn>
                      </v-overlay>
                    </v-fade-transition>
                  </v-img>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
          <v-dialog v-model="avatarRuleOpen" fullscreen>
            <v-btn
              color="grey"
              fab
              dark
              fixed
              x-small
              right
              class="mt-3"
              @click="avatarRuleOpen = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-img :src="avatarRule" width="100%" />
          </v-dialog>

          <v-text-field
            :disabled="!verifyed"
            class="pt-6"
            dense
            outlined
            v-model="name"
            :rules="nameRules"
            label="姓名"
          ></v-text-field>

          <v-text-field
            :disabled="!verifyed"
            dense
            outlined
            v-model="mobile"
            :counter="11"
            :rules="mobileRules"
            label="手机号码"
          ></v-text-field>

          <v-text-field
            :disabled="!verifyed"
            dense
            outlined
            v-model="cid"
            :counter="6"
            :rules="cidRules"
            label="身份证号码后六位"
          ></v-text-field>

          <v-text-field
            :disabled="!verifyed"
            dense
            outlined
            type="password"
            v-model="password"
            :rules="passwordRules"
            label="密码"
          ></v-text-field>

          <v-select
            :disabled="!verifyed"
            dense
            :items="companyset"
            v-model="company"
            :rules="companyRules"
            label="所属公司"
            outlined
          ></v-select>

        </v-form>
      </v-col>
    </v-row>

    <v-row class="px-3">
      <v-btn x-large depressed color="primary" block @click="apply()">
        提交申请
      </v-btn>
    </v-row>

    <v-snackbar
      class="mt-16"
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
          <v-icon small class="mr-2" :color="verifyed ? 'green darken-2' : 'red darken-2'">
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import lrz from "lrz";
import md5 from 'js-md5';
export default {
  name: "Register",
  data: () => ({
    ws: {},
    clientid: "",
    msg: "",
    snackbar: false,
    valid: true,
    name: "",
    cid: "",
    mobile: "",
    password: "",
    company: 0,
    companylist: [],
    title: "",
    face: [],
    lrzImg: "",
    verifying: false,
    verifyed: false,
    avatarRuleOpen: false,
    avatar: require("../assets/avatar.jpg"),
    avatarRule: require("../assets/avatarRule.jpg"),
    nameRules: [(v) => !!v || "请输入姓名"],
    cidRules: [
      (v) => !!v || "请输入身份证号码后六位",
      (v) => (v && v.length == 6) || "身份证号码后六位",
    ],
    mobileRules: [
      (v) => !!v || "请输入手机号码",
      (v) => (v && v.length == 11) || "手机号码应为11位",
    ],
    passwordRules: [(v) => !!v || "请输入密码"],
    companyRules: [(v) => !!v || "请选择公司名称"],
    titleRules: [(v) => !!v || "请输入职位"],
    faceRules: [(value) => !!value || "请录入人脸信息"],
  }),
  mounted() {
    this.lrzImg = this.avatar
    this.getCompanies()
  },
  watch: {
    face: function () {
      if (this.face === null) {
        this.lrzImg = this.avatar
        this.verifyed = false
      }
    },
  },
  computed: {
    companyset: function () {
      return this.companylist.map((c) => {
        return { text: c.name, value: c.id }
      });
    },
  },

  methods: {
    apply() {
      if(this.validate()) {
        this.$http
        .post('/index/index/register',{
          name: this.name,
          cid: this.cid,
          mobile: this.mobile,
          pass: md5(this.password),
          companyid: this.company,
          title: this.title,
          headpic: this.lrzImg
        })
        .then((response) => {
          console.log(response);
          this.snackbar = true
          this.msg = response.data.msg
          setTimeout(() => {
              this.cancle()
            }, 3000)
          })
      }
    },
    getCompanies() {
      this.$http
        .get("/user/company/public_list/1/1000")
        .then((response) => {
          this.companylist = response.data.companylist
        })
        .catch((error) => {
          console.log(error)
        })
    },
    validate() {
      return this.$refs.form.validate()
    },
    reset() {
      this.$refs.form.reset()
    },
    cancle() {
      this.$emit("cancle")
      this.$refs.form.resetValidation()
    },
    fileChange() {
      let _this = this;
      if (_this.face !== null) {
        lrz(_this.face, { width: 1280, height: 720 })
          .then(function (rst) {
            _this.lrzImg = rst.base64
            _this.verifying = true
            _this.msg = "正在验证..."
            _this.$http
            .post('/mtong/index/checkhead',{
              headpic: encodeURIComponent(rst.base64)
            })
            .then((response) => {
              console.log(response.data)
              if (response.data.code === 200) {
                _this.verifyed = true
                _this.msg = "人脸照片验证通过"
                _this.snackbar = true
                _this.verifying = false
              } else {
                _this.verifyed = false
                _this.snackbar = true
                _this.msg = "人脸照片验证失败，请重新录入"
                _this.verifying = false
              }
            })
            .catch((error) => {
              console.log(error)
            })
          })
          .catch(function (err) {
            console.log(err);
          })
          .always(function () {
            // 不管是成功失败，都会执行
          });
      }
    },
  },
};
</script>