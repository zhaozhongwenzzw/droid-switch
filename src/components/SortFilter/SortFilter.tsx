import React from "react";
import { Button } from "../common";
import { SortIcon, CalendarIcon, DatabaseIcon } from "../icons/Icons";
import "./SortFilter.css";

export type SortType = "default" | "quota-desc" | "quota-asc" | "expiry";

interface SortFilterProps {
  currentSort: SortType;
  onSortChange: (sort: SortType) => void;
}

/**
 * 排序筛选栏组件
 */
export const SortFilter: React.FC<SortFilterProps> = ({
  currentSort,
  onSortChange,
}) => {
  // 判断当前是否为剩余额度排序
  const isQuotaSort =
    currentSort === "quota-desc" || currentSort === "quota-asc";

  // 点击剩余按钮时切换升序/降序
  const handleQuotaClick = () => {
    if (currentSort === "quota-desc") {
      onSortChange("quota-asc");
    } else {
      onSortChange("quota-desc");
    }
  };

  // 获取剩余按钮的显示文字
  const getQuotaLabel = () => {
    if (currentSort === "quota-asc") return "剩余↑";
    return "剩余↓";
  };

  return (
    <div className="sort-filter">
      <span className="sort-label">排序方式:</span>
      <div className="sort-buttons">
        <Button
          variant="outline"
          size="sm"
          icon={<SortIcon size={14} />}
          active={currentSort === "default"}
          onClick={() => onSortChange("default")}
        >
          默认
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<DatabaseIcon size={14} />}
          active={isQuotaSort}
          onClick={handleQuotaClick}
        >
          {getQuotaLabel()}
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<CalendarIcon size={14} />}
          active={currentSort === "expiry"}
          onClick={() => onSortChange("expiry")}
        >
          到期时间
        </Button>
      </div>
    </div>
  );
};

export default SortFilter;
