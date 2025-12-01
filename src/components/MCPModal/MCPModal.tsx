import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "../common";
import { readMcpConfig, saveMcpConfig } from "../../api/keyService";
import "./MCPModal.css";

interface MCPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MCP 配置弹窗组件
 */
export const MCPModal: React.FC<MCPModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 加载配置
  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await readMcpConfig();
      // 格式化 JSON 以便显示
      const formatted = JSON.stringify(JSON.parse(config), null, 2);
      setContent(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载配置失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // 验证 JSON 格式
      JSON.parse(content);
      await saveMcpConfig(content);
      setSuccess("保存成功");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("JSON 格式错误，请检查");
      } else {
        setError(err instanceof Error ? err.message : "保存失败");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleFormat = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      setContent(formatted);
      setError(null);
    } catch {
      setError("JSON 格式错误，无法格式化");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="mcp-modal">
      <ModalHeader onClose={handleClose}>
        <h2 className="modal-title">MCP 服务配置</h2>
      </ModalHeader>

      <ModalBody>
        <div className="mcp-description">
          配置文件路径: <code>~/.factory/mcp.json</code>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : (
          <div className="editor-container">
            <textarea
              className="json-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              placeholder='{"mcpServers": {}}'
            />
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={handleFormat} disabled={loading || saving}>
          格式化
        </Button>
        <div className="footer-spacer" />
        <Button variant="ghost" onClick={handleClose} disabled={saving}>
          取消
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? "保存中..." : "保存"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MCPModal;

