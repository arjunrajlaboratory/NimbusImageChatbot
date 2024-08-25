<template>
  <div class="chat-container">
    <div class="chat-messages" ref="chatMessages">
      <div v-for="(message, index) in messages" :key="index" :class="message.type">
        <template v-if="message.type === 'user' && message.images && message.images.length > 0">
          <div class="image-grid">
            <img v-for="(image, imgIndex) in message.images" :key="imgIndex" :src="image.data" alt="User uploaded image" class="message-image" />
          </div>
        </template>
        <div>{{ message.content }}</div>
      </div>
    </div>
    <div class="current-images" v-if="currentImages.length > 0">
      <div v-for="(image, index) in currentImages" :key="index" class="current-image-container">
        <img :src="image.data" alt="Current image" class="current-image" />
        <button @click="removeImage(index)" class="remove-image">X</button>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="userInput" @keyup.enter="sendMessage" @paste="handlePaste" placeholder="Type a message or paste images...">
      <button @click="sendMessage">Send</button>
      <input type="file" @change="handleFileUpload" accept="image/*" multiple>
    </div>
    <button @click="refreshChat" class="refresh-button">Refresh Chat</button>
  </div>
</template>

<!-- <script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';
import axios from 'axios';
import { Message, Image } from '@/store/chat'; -->

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';
import axios from 'axios';
import store, { Message, Image } from '@/store/chat'; // Use '@' alias for src directory

export default Vue.extend({
  name: 'ChatComponent',
  data() {
    return {
      userInput: ''
    };
  },
  computed: {
    ...mapState(['messages', 'currentImages'])
  },
  methods: {
    ...mapActions([
      'initDB',
      'addMessage',
      'addCurrentImage',
      'removeCurrentImage',
      'clearCurrentImages',
      'clearAll'
    ]),
    getMimeType(base64String: string): string {
      const mime = base64String.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      return mime && mime.length ? mime[1] : 'image/jpeg';
    },
    formatMessagesForAPI() {
      return this.messages.map((message: Message) => {
        if (message.type === 'user') {
          const content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = [{ type: 'text', text: message.content }];
          if (message.images && message.images.length > 0) {
            message.images.forEach((image: Image) => {
              const mimeType = this.getMimeType(image.data);
              content.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: image.data.split(',')[1]
                }
              });
            });
          }
          return { role: 'user', content };
        } else if (message.type === 'bot') {
          return {
            role: 'assistant',
            content: [{ type: 'text', text: message.content }]
          };
        }
        return null;
      }).filter(Boolean);
    },
    async sendMessage() {
      if (this.userInput.trim() === '' && this.currentImages.length === 0) return;
      
      const messageContent = this.userInput.trim();
      const userMessage: Message = { 
        type: 'user', 
        content: messageContent,
        images: [...this.currentImages]
      };
      await this.addMessage(userMessage);
      
      this.userInput = '';
      this.clearCurrentImages();

      try {
        const formattedMessages = this.formatMessagesForAPI();
        console.log('Sending request to server:', { messages: formattedMessages });
        const response = await axios.post('http://127.0.0.1:5000/api/chat', { 
          messages: formattedMessages
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('Server response:', response.data);
        const botMessage: Message = { type: 'bot', content: response.data.response };
        await this.addMessage(botMessage);
      } catch (error: any) {
        console.error('Error sending message:', error);
        if (axios.isAxiosError(error)) {
          console.error('Axios error details:', {
            response: error.response,
            request: error.request,
            message: error.message
          });
        }
        const errorMessage: Message = { type: 'error', content: `Error sending message: ${error.message}. Please check console for details.` };
        await this.addMessage(errorMessage);
      }

      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    async handleFileUpload(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (!files) return;

      for (let i = 0; i < files.length && this.currentImages.length < 4; i++) {
        try {
          const file = files[i];
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            this.addCurrentImage({ data: result, type: file.type });
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }

      if (this.currentImages.length > 0) {
        const systemMessage: Message = { type: 'system', content: `${this.currentImages.length} image(s) ready to send` };
        await this.addMessage(systemMessage);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    async handlePaste(event: ClipboardEvent) {
      event.preventDefault();
      const items = event.clipboardData?.items;
      if (!items) return;

      let imageAdded = false;
      for (let i = 0; i < items.length && this.currentImages.length < 4; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const result = e.target?.result as string;
              await this.addCurrentImage({ data: result, type: blob.type });
              if (!imageAdded) {
                const systemMessage: Message = { type: 'system', content: 'Pasted image ready to send' };
                await this.addMessage(systemMessage);
                this.$nextTick(() => {
                  this.scrollToBottom();
                });
                imageAdded = true;
              }
            };
            reader.readAsDataURL(blob);
          }
        } else if (items[i].type === 'text/plain') {
          items[i].getAsString((text) => {
            this.userInput += text;
          });
        }
      }
    },
    removeImage(index: number) {
      this.removeCurrentImage(index);
    },
    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages as HTMLElement;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    async refreshChat() {
      await this.clearAll();
      this.userInput = '';
      console.log('Chat history cleared');
    }
  },
  async mounted() {
    await this.initDB();
  }
});
</script>

<style scoped>
.chat-container {
  width: 400px;
  height: 500px;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}
.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}
.chat-input {
  display: flex;
  padding: 10px;
}
.chat-input input[type="text"] {
  flex-grow: 1;
  margin-right: 10px;
}
.user {
  text-align: right;
  color: blue;
}
.bot {
  text-align: left;
  color: green;
}
.system, .error {
  text-align: center;
  color: gray;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 5px;
  margin-bottom: 5px;
}
.message-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}
.current-images {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px;
}
.current-image-container {
  position: relative;
}
.current-image {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
}
.remove-image {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
}
.refresh-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
}
</style>