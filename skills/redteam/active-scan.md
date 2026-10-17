---
name: active-scan
description: 主动端口与服务扫描（nmap/masscan），严格遵守授权范围
whenToUse: 需要确认资产存活与开放端口时
role: recon
enabled: true
---

## 前置检查
1. 确认目标 CIDR 在授权范围内。
2. 确认当前时间窗口允许主动扫描。

## 命令
- 快速存活：`nmap -sn <cidr>`
- 全端口（限速）：`nmap -sS -p- --min-rate 1000 -T4 <target> -oX runs/nmap-full.xml`
- 服务版本：`nmap -sV -sC -p <ports> <target> -oX runs/nmap-svc.xml`

## 外部工具配置

以下路径是配置示例，不表示工具已安装。执行前核对本机安装位置、版本及权限；本插件安装包不包含这些工具。
| 用途 | 命令 |
| --- | --- |
| 端口扫描 | `nmap` / `masscan` / `~/.dsh/redteam/toolkit/naabu/naabu`（SYN 需 root，否则加 `-scan-type c`） |
| 内网综合扫描 | `~/.dsh/redteam/toolkit/fscan/fscan`（技能 fscan-intranet） |
| 内网测绘/指纹 | `~/.dsh/redteam/toolkit/gogo/gogo`（技能 gogo-intranet） |
| HTTP 探测（ProjectDiscovery） | `~/.local/bin/pd-httpx`（**注意：`/usr/bin/httpx` 是 Python httpx 库的 CLI，不是这个**） |
| 子域/解析 | `~/.dsh/redteam/toolkit/subfinder/subfinder`、`~/.dsh/redteam/toolkit/dnsx/dnsx` |
| POC 扫描 | `nuclei`（模板路径示例： `~/.local/nuclei-templates`） |
| 目录爆破 | `ffuf`、`~/.dsh/redteam/toolkit/dirsearch/dirsearch` |
| 隧道 | `~/.dsh/redteam/toolkit/suo5/suo5-linux-amd64`、`toolkit/chisel/chisel`、`toolkit/frp/{frpc,frps}` |


工具清单及安装脚本须以实际取得的工具箱为准；本插件不保证其存在，也不保证其覆盖 Windows 或 ARM。

## 落库要求
provenance = `active`，tool = `nmap`/`masscan`，记录 scan_run。
