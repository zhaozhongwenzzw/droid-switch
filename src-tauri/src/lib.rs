use serde::{Deserialize, Serialize};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

// API 响应结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageStandard {
    pub user_tokens: i64,
    pub org_total_tokens_used: i64,
    pub org_overage_used: i64,
    pub basic_allowance: i64,
    pub total_allowance: i64,
    pub org_overage_limit: i64,
    pub used_ratio: f64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsagePremium {
    pub user_tokens: i64,
    pub org_total_tokens_used: i64,
    pub org_overage_used: i64,
    pub basic_allowance: i64,
    pub total_allowance: i64,
    pub org_overage_limit: i64,
    pub used_ratio: f64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageData {
    pub start_date: i64,
    pub end_date: i64,
    pub standard: UsageStandard,
    pub premium: UsagePremium,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Customer {
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubscriptionResponse {
    pub usage: UsageData,
    pub customer: Customer,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyQuotaResult {
    pub usage: UsageData,
    pub email: String,
}

// 获取 API Key 额度详情
#[tauri::command]
async fn fetch_key_quota(api_key: String) -> Result<KeyQuotaResult, String> {
    let client = reqwest::Client::new();

    let response = client
        .get("https://app.factory.ai/api/organization/subscription/schedule")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if response.status() == 401 {
        return Err("API Key 无效或已过期".to_string());
    }

    if response.status() == 403 {
        return Err("没有权限访问此资源".to_string());
    }

    if !response.status().is_success() {
        return Err(format!("请求失败: {}", response.status()));
    }

    let data: SubscriptionResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;

    Ok(KeyQuotaResult {
        usage: data.usage,
        email: data.customer.email,
    })
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 获取用户级环境变量 FACTORY_API_KEY（从注册表读取最新值）
#[tauri::command]
async fn get_factory_api_key() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;

        // 使用 PowerShell 从注册表读取用户级环境变量（获取最新值）
        let ps_script =
            "[System.Environment]::GetEnvironmentVariable('FACTORY_API_KEY', 'User')";

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", ps_script])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .output();

        match output {
            Ok(output) => {
                let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if result.is_empty() {
                    None
                } else {
                    Some(result)
                }
            }
            Err(_) => None,
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 先尝试从环境变量读取
        if let Ok(value) = std::env::var("FACTORY_API_KEY") {
            return Some(value);
        }

        // 如果环境变量不存在，尝试从 shell 配置文件读取
        if let Some(home) = dirs::home_dir() {
            let shell_files = vec![".zshrc", ".bashrc", ".bash_profile", ".profile"];
            for file in shell_files {
                let path = home.join(file);
                if path.exists() {
                    if let Ok(content) = std::fs::read_to_string(&path) {
                        for line in content.lines() {
                            if line.starts_with("export FACTORY_API_KEY=") {
                                let value = line.trim_start_matches("export FACTORY_API_KEY=")
                                    .trim_matches('"')
                                    .trim_matches('\'')
                                    .to_string();
                                if !value.is_empty() {
                                    return Some(value);
                                }
                            }
                        }
                    }
                }
            }
        }
        None
    }
}

// 设置用户级环境变量 FACTORY_API_KEY（无需管理员权限，静默执行）
#[tauri::command]
async fn set_factory_api_key(api_key: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;

        // 转义 API Key 中的特殊字符
        let escaped_key = api_key.replace("'", "''");

        // 使用 PowerShell 设置用户级环境变量（不需要管理员权限）
        let ps_script = format!(
            "[System.Environment]::SetEnvironmentVariable('FACTORY_API_KEY', '{}', 'User')",
            escaped_key
        );

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps_script])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW - 隐藏窗口
            .output()
            .map_err(|e| format!("执行命令失败: {}", e))?;

        if output.status.success() {
            Ok("环境变量设置成功".to_string())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("设置环境变量失败: {}", stderr))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        use std::io::Write;

        let home = dirs::home_dir().ok_or("无法获取用户主目录")?;

        // 检测当前 shell 类型，优先使用对应的配置文件
        let shell = std::env::var("SHELL").unwrap_or_default();
        let config_file = if shell.contains("zsh") {
            ".zshrc"
        } else if shell.contains("bash") {
            ".bashrc"
        } else {
            ".profile"
        };

        let config_path = home.join(config_file);
        let export_line = format!("export FACTORY_API_KEY=\"{}\"", api_key);

        // 读取现有内容
        let mut content = if config_path.exists() {
            std::fs::read_to_string(&config_path)
                .map_err(|e| format!("读取 {} 失败: {}", config_file, e))?
        } else {
            String::new()
        };

        // 检查是否已存在 FACTORY_API_KEY 设置
        let mut found = false;
        let new_content: String = content
            .lines()
            .map(|line| {
                if line.starts_with("export FACTORY_API_KEY=") {
                    found = true;
                    export_line.clone()
                } else {
                    line.to_string()
                }
            })
            .collect::<Vec<_>>()
            .join("\n");

        if found {
            content = new_content;
        } else {
            // 添加新行
            if !content.is_empty() && !content.ends_with('\n') {
                content.push('\n');
            }
            content.push_str(&export_line);
            content.push('\n');
        }

        // 写入文件
        let mut file = std::fs::File::create(&config_path)
            .map_err(|e| format!("创建 {} 失败: {}", config_file, e))?;
        file.write_all(content.as_bytes())
            .map_err(|e| format!("写入 {} 失败: {}", config_file, e))?;

        // 同时设置当前进程的环境变量
        std::env::set_var("FACTORY_API_KEY", &api_key);

        Ok(format!("环境变量已写入 {}，请重新打开终端或执行 source ~/{} 使其生效", config_file, config_file))
    }
}

// 获取 .factory 目录路径
fn get_factory_dir() -> Result<std::path::PathBuf, String> {
    let home = dirs::home_dir().ok_or("无法获取用户主目录")?;
    Ok(home.join(".factory"))
}

// 读取 MCP 配置文件
#[tauri::command]
async fn read_mcp_config() -> Result<String, String> {
    let factory_dir = get_factory_dir()?;
    let mcp_path = factory_dir.join("mcp.json");

    if !mcp_path.exists() {
        // 如果文件不存在，返回默认空配置
        return Ok(r#"{"mcpServers": {}}"#.to_string());
    }

    std::fs::read_to_string(&mcp_path)
        .map_err(|e| format!("读取 MCP 配置失败: {}", e))
}

// 保存 MCP 配置文件
#[tauri::command]
async fn save_mcp_config(content: String) -> Result<String, String> {
    // 先验证 JSON 格式是否正确
    serde_json::from_str::<serde_json::Value>(&content)
        .map_err(|e| format!("JSON 格式错误: {}", e))?;

    let factory_dir = get_factory_dir()?;

    // 确保 .factory 目录存在
    if !factory_dir.exists() {
        std::fs::create_dir_all(&factory_dir)
            .map_err(|e| format!("创建 .factory 目录失败: {}", e))?;
    }

    let mcp_path = factory_dir.join("mcp.json");

    std::fs::write(&mcp_path, &content)
        .map_err(|e| format!("保存 MCP 配置失败: {}", e))?;

    Ok("保存成功".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet, fetch_key_quota, get_factory_api_key, set_factory_api_key, read_mcp_config, save_mcp_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
