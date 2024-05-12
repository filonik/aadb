import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './plugins/router'

import groupBy from 'object.groupby'

const shimmed = groupBy.shim()

const app = createApp(App)

app.use(router)

app.mount('#app')
