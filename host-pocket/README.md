# host-pocket

> **繁體中文** · [English](#english)

---

## 繁體中文

### 這是什麼？

**host-pocket** 是面向 Airbnb 房東的互動原型（Interactive Prototype）。房東出租房源後，房客常詢問在地推薦；host-pocket 讓房東用「**房源代碼**」建立專屬入住指南，房客瀏覽時可隨時**一鍵導回原始 Airbnb 房源頁面**。

本專案為靜態 HTML 示範，無後端、無建置流程，適合產品驗證、使用者故事展示與 UI/UX 討論。

### 核心使用者故事

1. 房東在 Phone 01 輸入或分享**房源代碼**（Listing Code）
2. 房客配對成功後，在 Phone 02 看到房源照片、Wi‑Fi、解鎖步驟與房東精選在地推薦
3. 房客可在 Phone 03 探索地圖與實境路線，並透過「導回房源」回到 Airbnb 原頁

### 三支 Phone 畫面

| 畫面 | Stimulus 模組 | 功能 |
|------|---------------|------|
| **Phone 01** | `pairing` | 配對啟動面板、房源代碼輸入、快速測試按鈕 |
| **Phone 02** | `dashboard` | 主面板：房源卡片、Tab 導覽、分享、求助房東、解鎖指南、Airbnb 房源 Overlay |
| **Phone 03** | `explorer` | 地圖、實境探索路線、動態對齊 pin 與虛線 |

頂部 **Partner Bar** 以 `#FF5B3E → #FF5A5F` 漸層呈現 **host-pocket × Airbnb 合作廠商** 識別。

### 快速開始

在 `host-pocket` 目錄下啟動本地伺服器：

```bash
cd host-pocket
python3 -m http.server 8080
```

瀏覽器開啟 [http://localhost:8080](http://localhost:8080)，或直接雙擊 `index.html`（部分互動在 `file://` 下可能受限，建議使用本地伺服器）。

### 原型操作提示

- **語言切換**：頁首「繁體中文 / English」按鈕
- **快速測試**：KYOTO、HUALIEN、VILNIUS、RIO — 一鍵注入示範房源代碼
- **配對流程**：Phone 01 輸入代碼 →「配對並載入指南」→ Phone 02 / 03 同步更新
- **自訂代碼**：輸入任意代碼也會動態產生 fallback 指南資料

### 示範房源代碼

| 代碼 | 地點 |
|------|------|
| `KYOTO-STATION` | 京都 |
| `HUALIEN-GLAMP` | 花蓮 |
| `VILNIUS-OLDTOWN` | 維爾紐斯舊城 |
| `RIO-COPACABANA` | 里約 Copacabana |

### 技術棧

| 項目 | 說明 |
|------|------|
| [Tailwind CSS](https://tailwindcss.com/) | CDN，Sunset Terracotta 自訂色票 |
| [Hotwire Stimulus](https://stimulus.hotwired.dev/) | `global` / `pairing` / `dashboard` / `explorer` 四個 Controller |
| [Font Awesome 6](https://fontawesome.com/) | 圖示（含 Airbnb brand icon） |
| Google Fonts | Inter + Noto Sans TC |

### 品牌與設計

| Token | 色碼 | 用途 |
|-------|------|------|
| hp-coral | `#FF5B3E` | 品牌主色 |
| hp-coralDark | `#E0482D` | 深色強調 |
| Airbnb Rausch | `#FF5A5F` | 合作識別、Partner Bar 漸層終點 |
| hp-dark | `#1F1A18` | 深色背景 |

- **字標**：`host-pocket`（全小寫）
- **Icon**：丹寧口袋 SVG 內嵌於 `index.html`；App Icon 比例（圖示約 68%、四邊留白 16%）

### 專案檔案

```
host-pocket/
├── README.md        # 本文件
├── index.html       # 完整互動原型（單檔，含 Stimulus 與示範資料）
└── pocket-icon.png  # 品牌口袋 icon（點陣參考素材）
```

### 上層儲存庫

本原型位於 [KimberlyYen/host-pocket](https://github.com/KimberlyYen/host-pocket) 儲存庫的 `host-pocket/` 目錄。同儲存庫根目錄另有 SearchAPI 相關實驗：

- `search_test.py` — SearchAPI 呼叫範例
- `airbnb-api-test-summary.md` — Airbnb Experiences 等 API 測試紀錄

### 免責聲明

本專案為設計與技術原型，與 Airbnb, Inc. 無官方關聯。Airbnb 為 Airbnb, Inc. 之商標；host-pocket 為示範用產品名稱。

---

## English

### What is this?

**host-pocket** is an interactive prototype for Airbnb hosts. After a listing is booked, guests often ask for local recommendations. host-pocket lets hosts create a stay guide via a **listing code**, so guests can browse tips and **return to the original Airbnb listing in one tap**.

This is a static HTML demo—no backend, no build step—intended for product validation, user-story walkthroughs, and UI/UX review.

### Core user story

1. Host shares a **listing code** on Phone 01
2. After pairing, guests see listing photos, Wi‑Fi, unlock steps, and curated local picks on Phone 02
3. On Phone 03, guests explore the map and AR-style routes, with a clear path back to the Airbnb listing

### Three phone screens

| Screen | Stimulus module | Purpose |
|--------|-----------------|---------|
| **Phone 01** | `pairing` | Pairing gateway, listing code input, quick demo buttons |
| **Phone 02** | `dashboard` | Main hub: listing card, tabs, share, host help, unlock guide, Airbnb listing overlay |
| **Phone 03** | `explorer` | Map, exploration routes, dynamic pin / dashed-line alignment |

The top **Partner Bar** uses a `#FF5B3E → #FF5A5F` gradient for **host-pocket × Airbnb Partner** branding.

### Quick start

From the `host-pocket` directory:

```bash
cd host-pocket
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser. You can also open `index.html` directly, but some behavior works best over a local server.

### Prototype tips

- **Language**: Toggle 繁體中文 / English in the header
- **Quick demo**: KYOTO, HUALIEN, VILNIUS, RIO inject sample listing codes
- **Pairing flow**: Enter code on Phone 01 → “Pair & load guide” → Phone 02 / 03 update together
- **Custom codes**: Any listing code generates fallback guide data on the fly

### Demo listing codes

| Code | Location |
|------|----------|
| `KYOTO-STATION` | Kyoto |
| `HUALIEN-GLAMP` | Hualien |
| `VILNIUS-OLDTOWN` | Vilnius Old Town |
| `RIO-COPACABANA` | Rio de Janeiro (Copacabana) |

### Tech stack

| Layer | Choice |
|-------|--------|
| [Tailwind CSS](https://tailwindcss.com/) | CDN, custom Sunset Terracotta palette |
| [Hotwire Stimulus](https://stimulus.hotwired.dev/) | Controllers: `global`, `pairing`, `dashboard`, `explorer` |
| [Font Awesome 6](https://fontawesome.com/) | Icons (incl. Airbnb brand) |
| Google Fonts | Inter + Noto Sans TC |

### Brand & design

| Token | Hex | Usage |
|-------|-----|--------|
| hp-coral | `#FF5B3E` | Primary brand |
| hp-coralDark | `#E0482D` | Dark accent |
| Airbnb Rausch | `#FF5A5F` | Partner accent, gradient end |
| hp-dark | `#1F1A18` | Dark surfaces |

- **Wordmark**: `host-pocket` (all lowercase)
- **Icon**: Denim pocket SVG embedded in `index.html`; app-icon spacing (~68% glyph, 16% inset)

### Project files

```
host-pocket/
├── README.md        # This file
├── index.html       # Full interactive prototype (single file)
└── pocket-icon.png  # Brand pocket icon (raster reference)
```

### Parent repository

This prototype lives under `host-pocket/` in the [KimberlyYen/host-pocket](https://github.com/KimberlyYen/host-pocket) repository. The repo root also includes SearchAPI experiments:

- `search_test.py` — sample SearchAPI request
- `airbnb-api-test-summary.md` — Airbnb Experiences API test notes

### Disclaimer

This is a design and engineering prototype, not affiliated with Airbnb, Inc. Airbnb is a trademark of Airbnb, Inc.; host-pocket is a demo product name.
