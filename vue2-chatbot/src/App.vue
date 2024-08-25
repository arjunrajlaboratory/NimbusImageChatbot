<template>
  <div id="app">
    <div class="top-bar">
      <h1>{{ message }}</h1>
      <div class="chat-icon" @click="toggleChat">💬</div>
    </div>
    <ChatComponent v-if="showChat" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ChatComponent from './ChatComponent.vue';

export default Vue.extend({
  name: 'App',
  components: {
    ChatComponent
  },
  data() {
    return {
      message: 'Hello, World!',
      showChat: false
    };
  },
  methods: {
    toggleChat() {
      this.showChat = !this.showChat;
    }
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.chat-icon {
  font-size: 24px;
  cursor: pointer;
}
</style>