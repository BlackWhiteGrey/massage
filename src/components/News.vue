<template>
  <v-container class="white" style="min-height: 100%; max-width: 600px" :style="{ backgroundImage: 'url(' + require('../assets/bg.jpg') + ')' }">
    <v-btn @click="cancle()" color="grey" x-small dark fixed top right fab>
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-row align="center">
      <p class="text-h6 px-8 pt-8 primary--text">中心动态</p>
    </v-row>
    <v-row v-if="total > 0" class="pa-8">
      <v-card width="100%" outlined style="border:0px;" class="mt-2" 
      v-for="(item, index) in newsList" :key="index"
      @click="getNews(item.id)">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-subtitle-2 primary--text" style="text-align: left;">
              {{index+1+(pageSize*(currentPage-1))}}.{{item.title}}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
                <v-list-item-action-text>{{convertTimestamp(item.time)}}</v-list-item-action-text>
          </v-list-item-action>
        </v-list-item>
      </v-card>
    </v-row>
    <v-row class="px-4" justify="end" v-if="total > 0" >
      <v-pagination 
        v-model="currentPage"
        :length="pageLength"
      ></v-pagination>
    </v-row>
    <v-row v-if="total == 0">
      <v-col>
        <p class="text-center brown--text font-weight-medium text-subtitle-1  mt-8">
          暂无信息
        </p>
      </v-col>
    </v-row>
    <v-dialog
      fullscreen
      transition="dialog-bottom-transition"
      v-model="showViewer"
      style="max-width: 600px"
    >
      <newsViewer
        :news="currentNews"
        @cancle="showViewer = false"
      ></newsViewer>
    </v-dialog>
  </v-container>
</template>

<script>
import NewsViewer from "../components/NewsViewer.vue"
export default {
  name: "News",
  components: { NewsViewer },
  props: {
    open: Boolean,
  },

  data: () => ({
    newsList: [],
    currentPage: 1,
    total: 0,
    pageSize: 10,
    showViewer: false,
    currentNews: {}
  }),

  computed: {
    pageLength: function () {
      return parseInt((this.total+this.pageSize-1)/this.pageSize)
    },
  },

  watch: {
    open: function () {
      if (this.open) {
        this.getNewsList()
      }
    },
    currentPage: function () {
      this.getNewsList()
    }
  },

  mounted() {
    this.getNewsList()
  },

  methods: {
    convertTimestamp(ts) {
      return new Date(ts * 1000).toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-") + " " + new Date(ts * 1000).toTimeString().substr(0, 8)
    },
    getNewsList(){
      this.$http
        .post("/service/content/list/"+this.currentPage+"/"+this.pageSize)
        .then((response) => {
          if(response.data.total > 0){
            this.total = response.data.total
            this.newsList = response.data.contentlist
          }
        })
    },
    getNews(id){
      this.$http
        .post("/service/content/get/"+id)
        .then((response) => {
          console.log(response.data)
          this.currentNews = response.data.content
          this.showViewer = true
        })
    },
    cancle() {
      this.$emit("cancle");
    },
  },
};
</script>