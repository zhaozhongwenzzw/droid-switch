import { invoke } from "@tauri-apps/api/core";

/**
 * API 返回的 usage 数据结构（使用 camelCase）
 */
export interface UsageData {
  startDate: number;
  endDate: number;
  standard: {
    userTokens: number;
    orgTotalTokensUsed: number;
    orgOverageUsed: number;
    basicAllowance: number;
    totalAllowance: number;
    orgOverageLimit: number;
    usedRatio: number;
  };
  premium: {
    userTokens: number;
    orgTotalTokensUsed: number;
    orgOverageUsed: number;
    basicAllowance: number;
    totalAllowance: number;
    orgOverageLimit: number;
    usedRatio: number;
  };
}

/**
 * 获取 Key 额度详情的返回类型
 */
export interface KeyQuotaResult {
  usage: UsageData;
  email: string;
}

/**
 * 格式化时间戳为 MM/DD 格式
 */
export const formatExpiryDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}/${day}`;
};

/**
 * 获取 API Key 的额度详情
 * @param apiKey - 用户的 API Key
 * @returns 额度详情数据
 */
export const fetchKeyQuota = async (
  apiKey: string
): Promise<KeyQuotaResult> => {
  try {
    const result = await invoke<KeyQuotaResult>("fetch_key_quota", {
      apiKey: apiKey,
    });
    return result;
  } catch (error) {
    throw new Error(error as string);
  }
};

/**
 * 获取系统环境变量 FACTORY_API_KEY
 * @returns 环境变量值，如果不存在则返回 null
 */
export const getFactoryApiKey = async (): Promise<string | null> => {
  try {
    const result = await invoke<string | null>("get_factory_api_key");
    return result;
  } catch (error) {
    console.error("获取环境变量失败:", error);
    return null;
  }
};

/**
 * 设置系统环境变量 FACTORY_API_KEY
 * @param apiKey - 要设置的 API Key
 * @returns 成功信息
 */
export const setFactoryApiKey = async (apiKey: string): Promise<string> => {
  try {
    const result = await invoke<string>("set_factory_api_key", {
      apiKey: apiKey,
    });
    return result;
  } catch (error) {
    throw new Error(error as string);
  }
};

/**
 * 读取 MCP 配置文件
 * @returns MCP 配置的 JSON 字符串
 */
export const readMcpConfig = async (): Promise<string> => {
  try {
    const result = await invoke<string>("read_mcp_config");
    return result;
  } catch (error) {
    throw new Error(error as string);
  }
};

/**
 * 保存 MCP 配置文件
 * @param content - MCP 配置的 JSON 字符串
 * @returns 成功信息
 */
export const saveMcpConfig = async (content: string): Promise<string> => {
  try {
    const result = await invoke<string>("save_mcp_config", { content });
    return result;
  } catch (error) {
    throw new Error(error as string);
  }
};

export default {
  fetchKeyQuota,
  formatExpiryDate,
  getFactoryApiKey,
  setFactoryApiKey,
  readMcpConfig,
  saveMcpConfig,
};
