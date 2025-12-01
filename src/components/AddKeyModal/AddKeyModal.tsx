import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
} from "../common";
import { PlusIcon, ListIcon, EyeIcon, EyeOffIcon } from "../icons/Icons";
import "./AddKeyModal.css";

interface AddKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (data: { name: string; apiKey: string }) => Promise<void>;
  onBatchAdd?: (keys: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

type TabType = "single" | "batch";

/**
 * 添加 Droid Key 弹窗组件
 */
export const AddKeyModal: React.FC<AddKeyModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onBatchAdd,
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("single");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [batchKeys, setBatchKeys] = useState("");

  const tabs = [
    { key: "single", label: "单个添加", icon: <PlusIcon size={14} /> },
    { key: "batch", label: "批量添加", icon: <ListIcon size={14} /> },
  ];

  const handleClose = () => {
    if (loading) return; // 加载中不允许关闭
    setName("");
    setApiKey("");
    setBatchKeys("");
    setActiveTab("single");
    onClose();
  };

  const handleAdd = async () => {
    if (apiKey.trim() && onAdd) {
      await onAdd({ name: name.trim(), apiKey: apiKey.trim() });
    }
  };

  const handleBatchAdd = async () => {
    if (batchKeys.trim() && onBatchAdd) {
      await onBatchAdd(batchKeys.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="add-key-modal">
      <ModalHeader onClose={handleClose}>
        <h2 className="modal-title">添加 Droid Key</h2>
        <Tabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabType)}
          className={activeTab === "batch" ? "tabs-batch" : ""}
        />
      </ModalHeader>

      <ModalBody>
        {error && <div className="error-message">{error}</div>}
        {activeTab === "single" ? (
          <div className="single-add-form">
            <div className="form-section-title">基础信息</div>

            <div className="form-group">
              <label className="form-label">
                名称<span className="label-optional">（可选）</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="留空则显示为 fk-后六位"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                API Key<span className="label-required">*</span>
              </label>
              <div className="input-with-icon">
                <input
                  type={showApiKey ? "text" : "password"}
                  className="form-input"
                  placeholder="fk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={loading}
                >
                  {showApiKey ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="batch-add-form">
            <div className="form-group">
              <label className="form-label">API Keys（每行一个）</label>
              <div className="format-hint">
                <p>支持以下格式：</p>
                <ul>
                  <li>
                    仅 API Key：<code>fk-xxxxx</code>
                  </li>
                  <li>
                    名称 + API Key：<code>主Key fk-xxxxx</code> 或{" "}
                    <code>主Key,fk-xxxxx</code>
                  </li>
                </ul>
              </div>
              <textarea
                className="form-textarea"
                placeholder={`示例：\nfk-abc123def456\n备用Key fk-xyz789uvw012\n主Key,fk-123456789abc`}
                value={batchKeys}
                onChange={(e) => setBatchKeys(e.target.value)}
                rows={8}
              />
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={loading}>
          取消
        </Button>
        {activeTab === "single" ? (
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!apiKey.trim() || loading}
          >
            {loading ? "添加中..." : "添加"}
          </Button>
        ) : (
          <Button
            variant="orange"
            onClick={handleBatchAdd}
            disabled={!batchKeys.trim() || loading}
          >
            {loading ? "验证中..." : "验证并预览"}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default AddKeyModal;
