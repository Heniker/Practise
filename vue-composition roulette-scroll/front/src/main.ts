// @ts-nocheck
import VueCompositionApi from '@vue/composition-api'
import Vue from 'vue'
import App from './App.vue'
import { vuetify } from './plugins/vuetify'

Vue.use(VueCompositionApi)

new Vue({
  render: (h) => h(App),
  vuetify,
}).$mount('#app')
