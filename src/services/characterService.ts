import axios from 'axios';
import { Character, CharacterDetail, CreateCharacterData, UpdateCharacterData } from '@/types/character';

import { API_URL } from '@/config';

// 创建一个新的 axios 实例
const api = axios.create({
  baseURL: API_URL,
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const characterService = {
  async list(): Promise<Character[]> {
    const response = await api.get('/characters/');
    return response.data.results;
  },

  async get(uid: string): Promise<CharacterDetail> {
    const response = await api.get(`/characters/${uid}/`);
    return response.data;
  },

  async create(data: CreateCharacterData): Promise<CharacterDetail> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const response = await api.post('/characters/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(uid: string, data: UpdateCharacterData): Promise<Character> {
    const formData = new FormData();
    
    // 处理非文件字段
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'avatar' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'status_config') {
        // 确保 status_config 被正确序列化为 JSON 字符串
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await api.patch(`/characters/${uid}/`, formData);
    return response.data;
  },

  async delete(uid: string): Promise<void> {
    await api.delete(`/characters/${uid}/`);
  },

  async getSecretKey(uid: string): Promise<string> {
    const response = await api.get(`/characters/${uid}/secret_key/`);
    return response.data.secret_key;
  },

  async regenerateSecretKey(uid: string): Promise<string> {
    const response = await api.post(`/characters/${uid}/regenerate_secret_key/`);
    return response.data.secret_key;
  },

  async regenerateDisplayCode(uid: string) {
    const response = await api.post(`/characters/${uid}/regenerate_display_code/`);
    return response.data;
  },

  async updateStatus(uid: string, isActive: boolean) {
    const response = await api.post(`/characters/${uid}/update_status/`, {
      is_active: isActive
    });
    return response.data;
  },

  async getPublicDisplay(code: string) {
    const response = await axios.get(`${API_URL}/d/${code}/`);
    return response.data;
  },

  async getCharacterStatus(code: string) {
    const response = await axios.get(`${API_URL}/d/${code}/status/`);
    return response.data;
  },
};