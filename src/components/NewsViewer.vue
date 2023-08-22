<template>
  <v-container class="white" style="min-height: 100%; max-width: 600px" :style="{ backgroundImage: 'url(' + require('../assets/bg.jpg') + ')' }">
    <v-btn @click="cancle()" color="grey" x-small dark fixed top right fab>
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-card max-width="600">
      <v-card-title class="primary--text" style="justify-content:center;">{{news.title}}</v-card-title>
      <v-card-subtitle>{{convertTimestamp(news.time)}}</v-card-subtitle>
      <v-divider class="mx-4"></v-divider>
      <v-card-text v-html="news.content"></v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "NewsViewer",
  props: {
    news: {}
  },


  watch: {
  },

  mounted() {
  },

  methods: {
    convertTimestamp(ts) {
      return new Date(ts * 1000).toLocaleDateString('zh', { year: 'numeric', month: '2-digit',
            day: '2-digit'}).replace(/\//g, "-") + " " + new Date(ts * 1000).toTimeString().substr(0, 8)
    },
    cancle() {
      this.$emit("cancle");
    },
  },
};
</script>