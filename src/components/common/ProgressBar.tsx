import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  /** 已使用量 */
  used: number;
  /** 总量 */
  total: number;
  /** 进度条颜色类型 */
  colorType?: 'green' | 'blue' | 'orange';
  /** 高度 */
  height?: number;
  className?: string;
}

/**
 * 进度条组件
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  used,
  total,
  colorType = 'green',
  height = 6,
  className = '',
}) => {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div
      className={`progress-bar ${className}`}
      style={{ height: `${height}px` }}
    >
      <div
        className={`progress-bar-fill progress-bar-${colorType}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;

