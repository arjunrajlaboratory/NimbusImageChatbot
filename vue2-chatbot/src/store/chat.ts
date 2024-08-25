import Vue from 'vue';
import Vuex from 'vuex';
import { ActionContext } from 'vuex';

Vue.use(Vuex);

export interface Message {
  type: string;
  content: string;
  images?: Image[];
}

export interface Image {
  data: string;
  type: string;
}

interface ChatState {
  messages: Message[];
  currentImages: Image[];
}

const state: ChatState = {
  messages: [],
  currentImages: [],
};

const mutations = {
  ADD_MESSAGE(state: ChatState, message: Message) {
    state.messages.push(message);
  },
  SET_MESSAGES(state: ChatState, messages: Message[]) {
    state.messages = messages;
  },
  ADD_CURRENT_IMAGE(state: ChatState, image: Image) {
    state.currentImages.push(image);
  },
  REMOVE_CURRENT_IMAGE(state: ChatState, index: number) {
    state.currentImages.splice(index, 1);
  },
  CLEAR_CURRENT_IMAGES(state: ChatState) {
    state.currentImages = [];
  },
  CLEAR_ALL(state: ChatState) {
    state.messages = [];
    state.currentImages = [];
  },
};

const actions = {
  async initDB({ commit }: ActionContext<ChatState, any>) {
    const db = await openDatabase();
    const messages = await loadMessagesFromDB(db);
    commit('SET_MESSAGES', messages);
  },
  async addMessage({ commit }: ActionContext<ChatState, any>, message: Message) {
    commit('ADD_MESSAGE', message);
    await saveMessageToDB(message);
  },
  addCurrentImage({ commit }: ActionContext<ChatState, any>, image: Image) {
    commit('ADD_CURRENT_IMAGE', image);
  },
  removeCurrentImage({ commit }: ActionContext<ChatState, any>, index: number) {
    commit('REMOVE_CURRENT_IMAGE', index);
  },
  clearCurrentImages({ commit }: ActionContext<ChatState, any>) {
    commit('CLEAR_CURRENT_IMAGES');
  },
  async clearAll({ commit }: ActionContext<ChatState, any>) {
    commit('CLEAR_ALL');
    await clearDatabase();
  },
};

const getters = {
  allMessages: (state: ChatState) => state.messages,
  currentImages: (state: ChatState) => state.currentImages,
};

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChatHistoryDB', 1);
    request.onerror = () => reject('Error opening database');
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
    };
  });
}

async function loadMessagesFromDB(db: IDBDatabase): Promise<Message[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');
    const request = store.getAll();
    request.onerror = () => reject('Error loading messages');
    request.onsuccess = () => resolve(request.result);
  });
}

async function saveMessageToDB(message: Message): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.add(message);
    request.onerror = () => reject('Error saving message');
    request.onsuccess = () => resolve();
  });
}

async function clearDatabase(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.clear();
    request.onerror = () => reject('Error clearing database');
    request.onsuccess = () => resolve();
  });
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});