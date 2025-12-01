import React from 'react';
import { Select } from '../common';
import { RefreshIcon } from '../icons/Icons';
import './RefreshSettings.css';

interface RefreshSettingsProps {
  interval: string;
  onIntervalChange: (interval: string) => void;
}

const intervalOptions = [
  { value: '30m', label: '30分钟' },
  { value: '1h', label: '1小时' },
  { value: '2h', label: '2小时' },
  { value: '6h', label: '6小时' },
  { value: '12h', label: '12小时' },
  { value: '24h', label: '24小时' },
];

/**
 * 自动刷新设置组件
 */
export const RefreshSettings: React.FC<RefreshSettingsProps> = ({
  interval,
  onIntervalChange,
}) => {
  return (
    <div className="refresh-settings">
      <RefreshIcon size={14} className="refresh-icon" />
      <span className="refresh-label">自动刷新间隔:</span>
      <Select
        options={intervalOptions}
        value={interval}
        onChange={onIntervalChange}
      />
    </div>
  );
};

export default RefreshSettings;

