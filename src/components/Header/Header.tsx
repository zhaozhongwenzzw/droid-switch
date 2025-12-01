import React from "react";
import { Button } from "../common";
import { KeyIcon } from "../icons/Icons";
import "./Header.css";

interface HeaderProps {
  onMCP?: () => void;
  onAddKey?: () => void;
}

/**
 * 顶部导航栏组件
 */
export const Header: React.FC<HeaderProps> = ({ onMCP, onAddKey }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">Droid-Switch</h1>
      </div>
      <div className="header-right">
        <Button variant="primary" onClick={onMCP}>
          MCP
        </Button>
        <Button
          variant="orange"
          icon={<KeyIcon size={14} />}
          onClick={onAddKey}
        >
          添加 Key
        </Button>
      </div>
    </header>
  );
};

export default Header;
