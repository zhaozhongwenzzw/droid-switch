import { useState, useEffect } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { StatisticsCard } from "./components/Statistics";
import { SortFilter, SortType } from "./components/SortFilter";
import { KeyList, KeyData } from "./components/KeyList";
import { RefreshSettings } from "./components/RefreshSettings";
import { AddKeyModal } from "./components/AddKeyModal";
import { MCPModal } from "./components/MCPModal";
import {
  fetchKeyQuota,
  formatExpiryDate,
  getFactoryApiKey,
  setFactoryApiKey,
} from "./api/keyService";
import { saveKeys, loadKeys, isApiKeyExists } from "./api/storage";

function App() {
  const [sortType, setSortType] = useState<SortType>("default");
  const [refreshInterval, setRefreshInterval] = useState("1h");
  const [keys, setKeys] = useState<KeyData[]>([]);
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [addKeyLoading, setAddKeyLoading] = useState(false);
  const [addKeyError, setAddKeyError] = useState<string | null>(null);
  const [refreshingKeys, setRefreshingKeys] = useState<Set<string>>(new Set());
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [isMCPModalOpen, setIsMCPModalOpen] = useState(false);

  // 应用启动时加载保存的数据，并检查系统环境变量
  useEffect(() => {
    const initKeys = async () => {
      const savedKeys = await loadKeys();
      if (savedKeys.length > 0) {
        // 获取系统环境变量中的 FACTORY_API_KEY
        const envApiKey = await getFactoryApiKey();

        if (envApiKey) {
          // 查找匹配的 key 并设置为使用中
          const updatedKeys = savedKeys.map((key) => ({
            ...key,
            isActive: key.apiKey.trim() === envApiKey.trim(),
          }));
          console.log(updatedKeys);
          console.log(envApiKey);
          setKeys(updatedKeys);
        } else {
          setKeys(savedKeys);
        }
      }
    };
    initKeys();
  }, []);

  // keys 变化时自动保存
  useEffect(() => {
    if (keys.length > 0) {
      saveKeys(keys);
    }
  }, [keys]);

  // 将间隔字符串转换为毫秒
  const parseIntervalToMs = (interval: string): number => {
    const value = parseInt(interval);
    if (interval.endsWith("m")) {
      return value * 60 * 1000;
    } else if (interval.endsWith("h")) {
      return value * 60 * 60 * 1000;
    }
    return 60 * 60 * 1000; // 默认1小时
  };

  // 自动刷新当前使用中的 Key
  useEffect(() => {
    const activeKey = keys.find((key) => key.isActive);
    if (!activeKey) return;

    const intervalMs = parseIntervalToMs(refreshInterval);

    const timer = setInterval(async () => {
      // 刷新当前使用中的 Key
      handleRefreshKey(activeKey.id);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [keys, refreshInterval]);

  // 统计数据
  const statisticsData = {
    totalKeys: keys.length,
    queriedKeys: keys.length,
    totalQuota: keys.reduce((sum, key) => sum + key.totalQuota, 0),
    usedQuota: keys.reduce((sum, key) => sum + key.usedQuota, 0),
    remainingQuota: keys.reduce(
      (sum, key) => sum + (key.totalQuota - key.usedQuota),
      0
    ),
  };

  // 根据排序类型对 keys 进行排序
  const sortedKeys = [...keys].sort((a, b) => {
    switch (sortType) {
      case "quota-desc":
        // 按剩余额度从高到低
        return b.totalQuota - b.usedQuota - (a.totalQuota - a.usedQuota);
      case "quota-asc":
        // 按剩余额度从低到高
        return a.totalQuota - a.usedQuota - (b.totalQuota - b.usedQuota);
      case "expiry":
        // 按到期时间从近到远（expiryDate 格式为 MM/DD）
        const [aMonth, aDay] = a.expiryDate.split("/").map(Number);
        const [bMonth, bDay] = b.expiryDate.split("/").map(Number);
        const aDate = aMonth * 100 + aDay;
        const bDate = bMonth * 100 + bDay;
        return aDate - bDate;
      case "default":
      default:
        // 默认按添加时间（id 是时间戳）
        return Number(a.id) - Number(b.id);
    }
  });

  // 处理切换 Key
  const handleSwitch = async (id: string) => {
    const targetKey = keys.find((key) => key.id === id);
    if (!targetKey) return;

    try {
      // 设置系统环境变量
      await setFactoryApiKey(targetKey.apiKey);

      // 更新 UI 状态
      setKeys(
        keys.map((key) => ({
          ...key,
          isActive: key.id === id,
        }))
      );
    } catch (error) {
      console.error("设置环境变量失败:", error);
      alert(`设置环境变量失败: ${error}`);
    }
  };

  // 处理删除 Key
  const handleDelete = (id: string) => {
    const targetKey = keys.find((key) => key.id === id);
    if (!targetKey) return;

    // 确认删除
    if (!confirm(`确定要删除 "${targetKey.name}" 吗？`)) return;

    // 删除 key
    setKeys(keys.filter((key) => key.id !== id));
  };

  // 处理添加 Key
  const handleAddKey = async (data: { name: string; apiKey: string }) => {
    setAddKeyLoading(true);
    setAddKeyError(null);

    // 检查是否已存在相同的 apiKey
    if (isApiKeyExists(keys, data.apiKey)) {
      setAddKeyError("该 API Key 已存在，请勿重复添加");
      setAddKeyLoading(false);
      return;
    }

    try {
      // 调用 API 获取额度详情
      const result = await fetchKeyQuota(data.apiKey);

      const newKey: KeyData = {
        id: Date.now().toString(),
        name: data.name || result.email || `fk-${data.apiKey.slice(-6)}`,
        apiKey: data.apiKey,
        expiryDate: formatExpiryDate(result.usage.endDate),
        totalQuota: result.usage.standard.totalAllowance,
        usedQuota: result.usage.standard.orgTotalTokensUsed,
        isActive: keys.length === 0, // 第一个添加的 Key 自动设为当前使用
        email: result.email,
      };

      setKeys([...keys, newKey]);
      setIsAddKeyModalOpen(false);
      setAddKeyLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "添加失败，请检查 API Key 是否正确";
      setAddKeyError(errorMessage);
      setAddKeyLoading(false);
    }
  };

  // 关闭添加弹窗时清除错误
  const handleCloseAddKeyModal = () => {
    setIsAddKeyModalOpen(false);
    setAddKeyError(null);
  };

  // 批量添加 Keys
  const handleBatchAdd = async (batchInput: string) => {
    setAddKeyLoading(true);
    setAddKeyError(null);

    // 解析输入：每行一个，支持 "名称 fk-xxx" 或 "名称,fk-xxx" 或纯 "fk-xxx"
    const lines = batchInput.split("\n").filter((line) => line.trim());
    const parsedKeys: { name: string; apiKey: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // 匹配 fk- 开头的 API Key
      const match = trimmed.match(/(fk-[a-zA-Z0-9]+)/);
      if (match) {
        const apiKey = match[1];
        // 获取名称：移除 apiKey 部分，剩余的就是名称
        let name = trimmed
          .replace(apiKey, "")
          .replace(/[,\s]+/g, " ")
          .trim();
        parsedKeys.push({ name, apiKey });
      }
    }

    if (parsedKeys.length === 0) {
      setAddKeyError("未找到有效的 API Key，请检查格式");
      setAddKeyLoading(false);
      return;
    }

    // 过滤已存在的 apiKey
    const existingApiKeys = new Set(keys.map((k) => k.apiKey));
    const uniqueKeys: { name: string; apiKey: string }[] = [];
    const duplicateKeys: string[] = [];
    const alreadyExistsKeys: string[] = [];
    const seenApiKeys = new Set<string>();

    for (const item of parsedKeys) {
      if (existingApiKeys.has(item.apiKey)) {
        alreadyExistsKeys.push(item.apiKey.slice(-6));
      } else if (seenApiKeys.has(item.apiKey)) {
        duplicateKeys.push(item.apiKey.slice(-6));
      } else {
        seenApiKeys.add(item.apiKey);
        uniqueKeys.push(item);
      }
    }

    if (uniqueKeys.length === 0) {
      let errorMsg = "没有可添加的新 Key。";
      if (alreadyExistsKeys.length > 0) {
        errorMsg += ` 已存在: ${alreadyExistsKeys.join(", ")}`;
      }
      if (duplicateKeys.length > 0) {
        errorMsg += ` 输入重复: ${duplicateKeys.join(", ")}`;
      }
      setAddKeyError(errorMsg);
      setAddKeyLoading(false);
      return;
    }

    // 验证并获取每个 Key 的额度信息
    const results = await Promise.allSettled(
      uniqueKeys.map(async (item) => {
        const result = await fetchKeyQuota(item.apiKey);
        return { ...item, result };
      })
    );

    const newKeys: KeyData[] = [];
    const failedKeys: string[] = [];

    results.forEach((res, index) => {
      if (res.status === "fulfilled") {
        const { name, apiKey, result } = res.value;
        newKeys.push({
          id: `${Date.now()}-${index}`,
          name: name || result.email || `fk-${apiKey.slice(-6)}`,
          apiKey,
          expiryDate: formatExpiryDate(result.usage.endDate),
          totalQuota: result.usage.standard.totalAllowance,
          usedQuota: result.usage.standard.orgTotalTokensUsed,
          isActive: false,
          email: result.email,
        });
      } else {
        failedKeys.push(uniqueKeys[index].apiKey.slice(-6));
      }
    });

    if (newKeys.length > 0) {
      // 如果当前没有 key，第一个设为激活
      if (keys.length === 0 && newKeys.length > 0) {
        newKeys[0].isActive = true;
      }
      setKeys([...keys, ...newKeys]);
    }

    // 显示结果
    let message = `成功添加 ${newKeys.length} 个 Key`;
    if (failedKeys.length > 0) {
      message += `，失败 ${failedKeys.length} 个 (${failedKeys.join(", ")})`;
    }
    if (alreadyExistsKeys.length > 0) {
      message += `，跳过已存在 ${alreadyExistsKeys.length} 个`;
    }
    if (duplicateKeys.length > 0) {
      message += `，跳过重复 ${duplicateKeys.length} 个`;
    }

    setAddKeyLoading(false);

    if (newKeys.length > 0) {
      setIsAddKeyModalOpen(false);
      alert(message);
    } else {
      setAddKeyError(message);
    }
  };

  // 刷新单个 Key 的额度信息
  const handleRefreshKey = async (id: string) => {
    const targetKey = keys.find((key) => key.id === id);
    if (!targetKey) return;

    // 标记正在刷新
    setRefreshingKeys((prev) => new Set(prev).add(id));

    try {
      const result = await fetchKeyQuota(targetKey.apiKey);

      // 更新 key 的额度信息
      setKeys((prevKeys) =>
        prevKeys.map((key) =>
          key.id === id
            ? {
                ...key,
                expiryDate: formatExpiryDate(result.usage.endDate),
                totalQuota: result.usage.standard.totalAllowance,
                usedQuota: result.usage.standard.orgTotalTokensUsed,
                email: result.email,
              }
            : key
        )
      );
    } catch (error) {
      console.error(`刷新 Key ${id} 失败:`, error);
      alert(`刷新失败: ${error}`);
    } finally {
      // 移除刷新标记
      setRefreshingKeys((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // 生成卡密
  const handleGenerateCard = (id: string) => {
    const targetKey = keys.find((key) => key.id === id);
    if (!targetKey) return;

    // 生成卡密格式：名称 + API Key + 剩余额度
    const remainingQuota = targetKey.totalQuota - targetKey.usedQuota;
    const cardText = `名称: ${targetKey.name}
API Key: ${targetKey.apiKey}
邮箱: ${targetKey.email || "无"}
到期日期: ${targetKey.expiryDate}
剩余额度: ${remainingQuota}`;

    // 复制到剪贴板
    navigator.clipboard
      .writeText(cardText)
      .then(() => {
        alert("卡密已复制到剪贴板");
      })
      .catch((err) => {
        console.error("复制失败:", err);
        alert("复制失败");
      });
  };

  // 切换卖出标识
  const handleToggleSold = (id: string) => {
    setKeys((prevKeys) =>
      prevKeys.map((key) =>
        key.id === id ? { ...key, isSold: !key.isSold } : key
      )
    );
  };

  // 刷新所有 Key 的额度信息
  const handleRefreshAll = async () => {
    if (keys.length === 0 || isRefreshingAll) return;

    setIsRefreshingAll(true);
    // 将所有 key 的 id 添加到 refreshingKeys，让每个卡片的刷新按钮都转动
    setRefreshingKeys(new Set(keys.map((key) => key.id)));

    try {
      // 并行刷新所有 key
      const results = await Promise.allSettled(
        keys.map(async (key) => {
          const result = await fetchKeyQuota(key.apiKey);
          return { id: key.id, result };
        })
      );

      // 更新所有成功刷新的 key
      setKeys((prevKeys) =>
        prevKeys.map((key) => {
          const resultItem = results.find(
            (r) => r.status === "fulfilled" && r.value.id === key.id
          );
          if (resultItem && resultItem.status === "fulfilled") {
            const { result } = resultItem.value;
            return {
              ...key,
              expiryDate: formatExpiryDate(result.usage.endDate),
              totalQuota: result.usage.standard.totalAllowance,
              usedQuota: result.usage.standard.orgTotalTokensUsed,
              email: result.email,
            };
          }
          return key;
        })
      );

      // 统计失败数量
      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        alert(`${failedCount} 个 Key 刷新失败`);
      }
    } catch (error) {
      console.error("刷新全部失败:", error);
      alert(`刷新失败: ${error}`);
    } finally {
      setIsRefreshingAll(false);
      // 清空所有刷新状态
      setRefreshingKeys(new Set());
    }
  };

  return (
    <div className="app">
      <Header
        onMCP={() => setIsMCPModalOpen(true)}
        onAddKey={() => setIsAddKeyModalOpen(true)}
      />

      <main className="main-content">
        {/* 总体统计 */}
        <StatisticsCard
          data={statisticsData}
          onRefreshAll={handleRefreshAll}
          onHistory={() => console.log("History")}
          isRefreshing={isRefreshingAll}
        />

        {/* 排序筛选 */}
        <SortFilter currentSort={sortType} onSortChange={setSortType} />

        {/* Key 列表 */}
        <KeyList
          keys={sortedKeys}
          onRefresh={handleRefreshKey}
          onSwitch={handleSwitch}
          onDelete={handleDelete}
          onGenerateCard={handleGenerateCard}
          onToggleSold={handleToggleSold}
          refreshingKeys={refreshingKeys}
        />

        {/* 自动刷新设置 */}
        <RefreshSettings
          interval={refreshInterval}
          onIntervalChange={setRefreshInterval}
        />
      </main>

      {/* 添加 Key 弹窗 */}
      <AddKeyModal
        isOpen={isAddKeyModalOpen}
        onClose={handleCloseAddKeyModal}
        onAdd={handleAddKey}
        onBatchAdd={handleBatchAdd}
        loading={addKeyLoading}
        error={addKeyError}
      />

      {/* MCP 配置弹窗 */}
      <MCPModal
        isOpen={isMCPModalOpen}
        onClose={() => setIsMCPModalOpen(false)}
      />
    </div>
  );
}

export default App;
