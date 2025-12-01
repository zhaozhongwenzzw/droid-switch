import { load } from "@tauri-apps/plugin-store";
import type { KeyData } from "../components/KeyList/KeyCard";

const STORE_NAME = "keys.json";
const KEYS_KEY = "keys";

/**
 * 获取 store 实例
 */
const getStore = async () => {
  return await load(STORE_NAME, { autoSave: true, defaults: {} });
};

/**
 * 保存 keys 数据到本地存储
 */
export const saveKeys = async (keys: KeyData[]): Promise<void> => {
  const store = await getStore();
  await store.set(KEYS_KEY, keys);
  await store.save();
};

/**
 * 从本地存储加载 keys 数据
 */
export const loadKeys = async (): Promise<KeyData[]> => {
  try {
    const store = await getStore();
    const keys = await store.get<KeyData[]>(KEYS_KEY);
    return keys || [];
  } catch (error) {
    console.error("Failed to load keys:", error);
    return [];
  }
};

/**
 * 检查 apiKey 是否已存在
 */
export const isApiKeyExists = (keys: KeyData[], apiKey: string): boolean => {
  return keys.some((key) => key.apiKey === apiKey);
};

export default {
  saveKeys,
  loadKeys,
  isApiKeyExists,
};
