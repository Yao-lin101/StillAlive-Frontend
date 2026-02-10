import axios from 'axios';
import { Character, CharacterDetail, CreateCharacterData, UpdateCharacterData, WillConfig, Message } from '@/types/character';

import { API_URL } from '@/config';
import api from '@/lib/api';

// 创建一个新的 axios 实例

// 添加请求拦截器

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

  // iCloud 快捷指令分享链接
  SHORTCUT_ICLOUD_URLS: {
    high_freq: 'https://www.icloud.com/shortcuts/7bbfa2d6a6ca420faffcfa6f122874b5',
    low_freq: 'https://www.icloud.com/shortcuts/71c575860eaa40da89dc26167a3fe18c',
  } as Record<'high_freq' | 'low_freq', string>,

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
    const response = await api.get(`/d/${code}/`);
    return response.data;
  },

  async getCharacterStatus(code: string) {
    const response = await api.get(`/d/${code}/status/`);
    return response.data;
  },

  // 获取所有存活者列表（公开）
  async getSurvivors(): Promise<{
    count: number;
    results: Array<{
      display_code: string;
      name: string;
      avatar: string | null;
      bio: string | null;
      is_online: boolean;
      last_updated: string | null;
      status_message: string;
    }>;
  }> {
    const response = await axios.get(`${API_URL}/survivors/`);
    return response.data;
  },

  // 获取遗嘱配置
  async getWillConfig(uid: string): Promise<WillConfig> {
    try {
      const response = await api.get(`/characters/${uid}/will/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null as any; // 返回null，由调用方处理
      }
      throw error;
    }
  },

  // 创建或更新遗嘱配置
  async updateWillConfig(uid: string, data: Partial<WillConfig>): Promise<WillConfig> {
    try {
      // 如果是启用遗嘱功能，确保有目标邮箱
      if (data.is_enabled === true && !data.target_email) {
        // 获取当前配置
        const currentConfig = await this.getWillConfig(uid);
        if (!currentConfig?.target_email) {
          throw new Error('启用遗嘱功能时必须提供目标邮箱');
        }
      }

      // 直接使用POST请求，让后端决定是创建还是更新
      const response = await api.post(`/characters/${uid}/will/`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error('服务器返回的错误信息:', error.response.data);
      }
      throw error;
    }
  },

  // 留言相关
  async getMessages(code: string): Promise<Message[]> {
    const response = await axios.get(`${API_URL}/characters/${code}/messages/`);
    return response.data;
  },

  async sendMessage(code: string, content: string): Promise<Message> {
    const response = await axios.post(`${API_URL}/characters/${code}/messages/`, { content });
    return response.data;
  },

  async deleteMessage(code: string, msgId: number): Promise<void> {
    await api.delete(`/characters/${code}/messages/${msgId}/`);
  },
};