import React, { useState } from "react";
import { Button, IconButton, Badge, ProgressBar } from "../common";
import {
  RefreshIcon,
  PlayIcon,
  CheckIcon,
  CopyIcon,
  TrashIcon,
  TicketIcon,
  TagIcon,
} from "../icons/Icons";
import "./KeyCard.css";

export interface KeyData {
  id: string;
  name: string;
  apiKey: string;
  expiryDate: string;
  totalQuota: number;
  usedQuota: number;
  isActive: boolean;
  email?: string;
  isSold?: boolean;
}

interface KeyCardProps {
  data: KeyData;
  onRefresh?: (id: string) => void;
  onSwitch?: (id: string) => void;
  onDelete?: (id: string) => void;
  onGenerateCard?: (id: string) => void;
  onToggleSold?: (id: string) => void;
  isRefreshing?: boolean;
}

/**
 * 格式化数字为带单位的字符串
 */
const formatQuota = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value?.toString();
};

/**
 * 遮蔽 API Key 中间部分
 */
const maskApiKey = (key: string): string => {
  if (key.length <= 16) return key;
  return `${key.slice(0, 10)}...${key.slice(-6)}`;
};

/**
 * 遮蔽 Email 中间部分
 */
const maskEmail = (email: string): string => {
  const atIndex = email.indexOf("@");
  if (atIndex <= 2) return email;
  const prefix = email.slice(0, 2);
  const suffix = email.slice(atIndex - 1);
  return `${prefix}***${suffix}`;
};

/**
 * 单个 Key 卡片组件
 */
export const KeyCard: React.FC<KeyCardProps> = ({
  data,
  onRefresh,
  onSwitch,
  onDelete,
  onGenerateCard,
  onToggleSold,
  isRefreshing = false,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const remainingQuota = data.totalQuota - data.usedQuota;

  // 复制到剪贴板
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <div
      className={`key-card ${data.isActive ? "key-card-active" : ""} ${
        data.isSold ? "key-card-sold" : ""
      }`}
    >
      <div className="key-card-header">
        <div className="key-header-left">
          <span className="key-expiry">到期: {data.expiryDate}</span>
          {data.isSold && (
            <Badge variant="warning" icon={<TagIcon size={10} />}>
              已卖出
            </Badge>
          )}
          {data.isActive && (
            <Badge variant="success" icon={<CheckIcon size={10} />}>
              当前使用
            </Badge>
          )}
        </div>
        <div className="key-header-right">
          {data.email && (
            <>
              <span className="key-email">{maskEmail(data.email)}</span>
              <button
                className={`copy-btn ${
                  copiedField === "email" ? "copied" : ""
                }`}
                onClick={() => handleCopy(data.email!, "email")}
                title={copiedField === "email" ? "已复制" : "复制"}
              >
                {copiedField === "email" ? (
                  <CheckIcon size={14} />
                ) : (
                  <CopyIcon size={14} />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="key-card-body">
        {/* API Key 行 */}
        <div className="key-info-row">
          <span className="info-label">API Key:</span>
          <span className="info-value api-key-value">
            {maskApiKey(data.apiKey)}
          </span>
          <button
            className={`copy-btn ${copiedField === "apiKey" ? "copied" : ""}`}
            onClick={() => handleCopy(data.apiKey, "apiKey")}
            title={copiedField === "apiKey" ? "已复制" : "复制"}
          >
            {copiedField === "apiKey" ? (
              <CheckIcon size={14} />
            ) : (
              <CopyIcon size={14} />
            )}
          </button>
        </div>

        <div className="key-quota-row">
          <div className="quota-info">
            <span className="quota-text">
              已用{" "}
              <span className="quota-used">{formatQuota(data.usedQuota)}</span>
              {" / "}总额 <span>{formatQuota(data.totalQuota)}</span>
            </span>
            <span className="quota-remaining">
              剩余{" "}
              <span className="remaining-value">
                {formatQuota(remainingQuota)}
              </span>
            </span>
          </div>

          <div className="key-actions">
            <IconButton
              icon={
                <RefreshIcon size={16} className={isRefreshing ? "spin" : ""} />
              }
              onClick={() => !isRefreshing && onRefresh?.(data.id)}
              title={isRefreshing ? "刷新中..." : "刷新"}
              disabled={isRefreshing}
            />
            <IconButton
              icon={<TicketIcon size={16} />}
              onClick={() => onGenerateCard?.(data.id)}
              title="生成卡密"
              className="generate-card-btn"
            />
            <IconButton
              icon={<TagIcon size={16} />}
              onClick={() => onToggleSold?.(data.id)}
              title={data.isSold ? "取消卖出标识" : "标记为已卖出"}
              className={`sold-btn ${data.isSold ? "is-sold" : ""}`}
            />
            <IconButton
              icon={<TrashIcon size={16} />}
              onClick={() => onDelete?.(data.id)}
              title="删除"
              className="delete-btn"
            />
            {data.isActive ? (
              <Button
                variant="secondary"
                size="sm"
                disabled
                icon={<CheckIcon size={14} />}
              >
                使用中
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<PlayIcon size={14} />}
                onClick={() => onSwitch?.(data.id)}
              >
                切换
              </Button>
            )}
          </div>
        </div>
      </div>

      <ProgressBar
        used={data.usedQuota}
        total={data.totalQuota}
        colorType={data.isActive ? "blue" : "green"}
        height={4}
      />
    </div>
  );
};

export default KeyCard;
