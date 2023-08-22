<template>
  <v-container class="white" style="min-height: 100%; max-width: 600px"  :style="{ backgroundImage: 'url(' + require('../assets/bg.jpg') + ')' }">
    <v-btn @click="cancle()" color="grey" x-small dark fixed top right fab>
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-row align="center">
      <p class="text-h6 px-8 pt-8 primary--text">选择查询年份</p>
    </v-row>
    <v-row class="mx-8">
      <v-chip-group mandatory v-model="year">
        <v-chip :value="year" v-for="year in years" :key="year">
          {{ year }}
        </v-chip>
      </v-chip-group></v-row
    >

    <v-row class="px-6" align="center">
      <v-col><v-divider></v-divider></v-col>
      <v-col class="px-0"
        ><p class="text-overline text-center ma-0 grey--text">
          共{{ orderlist.filter(checkYear).length }}次预约
        </p></v-col
      >
      <v-col><v-divider></v-divider></v-col>
    </v-row>

    <v-row class="px-8">
      <v-alert
        v-for="order in orderlist.filter(checkYear)"
        :key="order.id"
        prominent
        type="info"
        text
        :color="getColor(order.date, order.usetime)"
        style="width: 100%; text-align: left"
      >
        <v-row align="center">
          <v-col>
            <h3 class="mb-2">{{ getStatus(order.date, order.usetime) }}</h3>
            
              <tbody class="text-caption">
            <tr>
              <td width="64" class="tb">预约时间：</td>
              <td>{{ convertTimestamp(order.date).substr(0, 10) }} {{ getPeriod(order.period) }}</td>
            </tr>
            <tr>
              <td class="tb">预约项目：</td>
              <td>{{ order.subject }}</td>
            </tr>
            <tr>
              <td class="tb">提交时间：</td>
              <td>{{ convertTimestamp(order.time) }}</td>
            </tr>
            <tr v-if="order.verifytime > 0">
              <td class="tb" >签到时间：</td>
              <td>{{ convertTimestamp(order.verifytime) }}</td>
            </tr>
            <tr v-if="order.usetime > 0">
              <td class="tb" >服务时间：</td>
              <td>{{ convertTimestamp(order.usetime) }}</td>
            </tr>
            <tr v-if="order.canceltime > 0">
              <td class="tb" >取消时间：</td>
              <td>{{ convertTimestamp(order.canceltime) }}</td>
            </tr>
              </tbody>
          </v-col>
        </v-row>
        <v-row class="ma-0" v-if="!expired(order.date, order.period)">
          <v-col
            class="px-0"
            v-if="order.usetime === 0"
          >
            <v-btn
              depressed
              :color="getColor(order.date, order.usetime)"
              @click="cancleOrder(order.id)"
              >取消</v-btn
            >
          </v-col>
        </v-row>
      </v-alert>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Requesetor",
  props: {
    open: Boolean,
  },

  data: () => ({
    orderlist: [],
    year: "",
  }),

  computed: {
    years: function () {
      let allyears = [];
      this.orderlist.forEach((o) => {
        let oyear = new Date(o.date * 1000).toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-").substr(0, 4);
        if (allyears.indexOf(oyear) < 0) {
          allyears.push(oyear);
        }
      });
      return allyears.reverse();
    },
  },

  watch: {
    open: function () {
      if (this.open) {
        this.getList();
      }
    },
  },

  mounted() {
    this.getList();
  },

  methods: {
    convertTimestamp(ts) {
      return new Date(ts * 1000).toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-") + " " + new Date(ts * 1000).toTimeString().substr(0, 8)
    },
    checkYear(order) {
      return (
        new Date(order.date * 1000).toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-").substr(0, 4) === this.year
      );
    },

    getPeriod (period) {
      if(period === '' || period === undefined) {
        return ''
      }else{
        return (period < 10 ? '0'+period : period) + ':00-' + ((period+1) < 10 ? '0'+(period+1) : (period+1)) +':00'
      }
    },

    expired(date, period) {
      let now = new Date().toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-").substr(0, 10)
      const hour = new Date().getHours()
      if (this.convertTimestamp(date).substr(0, 10) < now || (this.convertTimestamp(date).substr(0, 10) == now && this.getPeriod(period).substr(-5, 2) <= hour))
        return true;
      else return false;
    },

    expiredDate(date) {
      let now = new Date().toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-").substr(0, 10)
      if (this.convertTimestamp(date).substr(0, 10) < now)
        return true;
      else return false;
    },

    getList() {
      this.$http.post("/service/order/mylist").then((response) => {
        console.log(response.data)
        this.orderlist = response.data.orderlist
      })
    },

    getColor(date, usetime) {
      if (usetime === -1) {
        return "blue-grey";
      } else if (usetime === 0) {
        if (this.expiredDate(date)) {
          return "grey";
        } else {
          return "brown";
        }
      } else {
        return "orange";
      }
    },

    getStatus(date, usetime) {
      if (usetime === -1) {
        return "预约取消";
      } else if (usetime === 0) {
        if (this.expiredDate(date)) {
          return "预约过期";
        } else {
          return "等待服务";
        }
      } else {
        return "服务完成";
      }
    },

    cancleOrder(id) {
      this.$http.post("/service/order/cancel/"+id).then((response) => {
        if(response.data.code == 200){
          this.getList()
          this.$emit("cancleOrder")
        }
      })
    },

    cancle() {
      this.$emit("cancle");
    },
  },
};
</script>