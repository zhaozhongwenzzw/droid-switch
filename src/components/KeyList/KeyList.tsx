import React from "react";
import { KeyCard, KeyData } from "./KeyCard";
import "./KeyList.css";

interface KeyListProps {
  keys: KeyData[];
  onRefresh?: (id: string) => void;
  onSwitch?: (id: string) => void;
  onDelete?: (id: string) => void;
  onGenerateCard?: (id: string) => void;
  onToggleSold?: (id: string) => void;
  refreshingKeys?: Set<string>;
}

/**
 * Key 列表容器组件
 */
export const KeyList: React.FC<KeyListProps> = ({
  keys,
  onRefresh,
  onSwitch,
  onDelete,
  onGenerateCard,
  onToggleSold,
  refreshingKeys = new Set(),
}) => {
  if (keys.length === 0) {
    return (
      <div className="key-list-empty">
        <p>暂无 API Key，请添加新的 Key</p>
      </div>
    );
  }

  return (
    <div className="key-list">
      {keys.map((key) => (
        <KeyCard
          key={key.id}
          data={key}
          onRefresh={onRefresh}
          onSwitch={onSwitch}
          onDelete={onDelete}
          onGenerateCard={onGenerateCard}
          onToggleSold={onToggleSold}
          isRefreshing={refreshingKeys.has(key.id)}
        />
      ))}
    </div>
  );
};

export default KeyList;
