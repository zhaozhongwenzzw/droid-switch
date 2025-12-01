import React from "react";
import "./IconButton.css";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * 图标按钮组件
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  disabled = false,
  title,
  size = "md",
  className = "",
}) => {
  return (
    <button
      className={`icon-btn icon-btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-tooltip={title}
    >
      {icon}
    </button>
  );
};

export default IconButton;
