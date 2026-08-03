import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ui from '@nuxt/ui/vue-plugin'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router';

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

import Main from './pages/Main.vue';
import Dialogues from './pages/Dialogues.vue'
import Stories from './pages/Stories.vue'
import Schema from './pages/Schema.vue'
import Export from './pages/Export.vue'
import Settings from './pages/Settings.vue'
import StoryBoard from './pages/StoryBoard.vue'

const app = createApp(App);

const pinia = createPinia();
const router = createRouter({
  routes: [
    { path: '/', component: Main },
    { path: '/dialogues', component: Dialogues },
    { path: '/stories', component: Stories },
    { path: '/stories/:id', component: StoryBoard },
    { path: '/schema', component: Schema },
    { path: '/settings', component: Settings },
    { path: '/export', component: Export }
  ],
  history: createWebHashHistory()
});

app.use(pinia);
app.use(router);
app.use(ui);

app.mount('#app')
