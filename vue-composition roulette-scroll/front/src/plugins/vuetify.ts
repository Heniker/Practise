import Vue from 'vue'
import Vuetify from 'vuetify'
import { Ripple } from 'vuetify/lib/directives'
// import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

// Vue.config.productionTip = process.env.DEBUG

const vuetify = new Vuetify({
  theme: {
    dark: true,
  },
  directives: {
    Ripple,
  },
})

export { vuetify }
