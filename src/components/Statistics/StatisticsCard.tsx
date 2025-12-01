import React from "react";
import { Button, ProgressBar } from "../common";
import { RefreshIcon, HistoryIcon } from "../icons/Icons";
import "./StatisticsCard.css";

interface StatisticsData {
  totalKeys: number;
  queriedKeys: number;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
}

interface StatisticsCardProps {
  data: StatisticsData;
  onRefreshAll?: () => void;
  onHistory?: () => void;
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
 * 总体统计卡片组件
 */
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  data,
  onRefreshAll,
  onHistory,
  isRefreshing = false,
}) => {
  const usagePercentage =
    data.totalQuota > 0
      ? ((data.usedQuota / data.totalQuota) * 100).toFixed(1)
      : "0";

  return (
    <div className="statistics-card">
      <div className="statistics-header">
        <div className="statistics-title">
          <span className="title-main">总体统计</span>
          <span className="title-sub">
            {data.totalKeys} 个 Key（{data.queriedKeys} 个已查询）
          </span>
        </div>
        <div className="statistics-actions">
          <button className="history-btn" onClick={onHistory}>
            <HistoryIcon size={14} />
            <span>会话历史</span>
          </button>
          <Button
            variant="orange"
            size="sm"
            icon={
              <RefreshIcon size={14} className={isRefreshing ? "spin" : ""} />
            }
            onClick={onRefreshAll}
            disabled={isRefreshing}
          >
            {isRefreshing ? "刷新中..." : "刷新全部"}
          </Button>
        </div>
      </div>

      <div className="statistics-content">
        <div className="stat-item">
          <div className="stat-label">总额度</div>
          <div className="stat-value stat-value-default">
            {formatQuota(data.totalQuota)}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">已使用</div>
          <div className="stat-value stat-value-orange">
            {formatQuota(data.usedQuota)}
          </div>
          <div className="stat-percentage">{usagePercentage}%</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">剩余</div>
          <div className="stat-value stat-value-green">
            {formatQuota(data.remainingQuota)}
          </div>
        </div>
      </div>

      <ProgressBar
        used={data.usedQuota}
        total={data.totalQuota}
        colorType="green"
        height={8}
      />
    </div>
  );
};

export default StatisticsCard;
