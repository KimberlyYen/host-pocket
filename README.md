# 房東私藏 host-pocket

> **繁體中文** · [English](#english)

[Figma](https://www.figma.com/design/dgIfgAkZvpINvpzznta9XA/host-pocket?node-id=0-1&t=s4yI820zRJ2lL9v7-1)

---

## 繁體中文

### 這是什麼？

我做的網站叫做「host-pocket 」是針對 Airbnb 房東的網站。房東出租房源後，房客常詢問在地推薦，可以透過這個平台，查到，你的房子附近的好景點，推薦給房客。

台灣像是101、饒河夜市，都會推薦給租客。

host-pocket 讓房東用「**房源代碼**」建立專屬入住指南，房客瀏覽時可隨時**一鍵導回原始 Airbnb 房源頁面**。

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

安裝依賴並啟動本地伺服器（含預定 API）：

```bash
npm install
cp .env.example .env   # 填入 Google OAuth 憑證（見下方「體驗預定與 Google Meet」）
npm start
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)（**全螢幕可操作 App**），或 [http://localhost:3000/guide.html](http://localhost:3000/guide.html)（操作指南）。

若只需靜態預覽、不需要真實寄信：

```bash
python3 -m http.server 8080
```

部分互動在 `file://` 下可能受限，建議使用本地伺服器。

**使用 Live Server（VS Code）時：** 前端可在 port 5500，但預定 API 需另外執行 `npm start`（port 3000）。前端會自動將 API 請求轉發至 `http://localhost:3000`。

### 體驗預定與 Email 確認信

確認預定時，後端會透過 **Gmail SMTP** 或 **Resend** 寄送預定確認信至旅客 email（含日期、時間、地點、主持人）。

#### 設定步驟

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) 建立專案
2. 啟用 **Google Calendar API**
3. 建立 **OAuth 2.0 Client ID**（應用程式類型：Web）
   - 授權重新導向 URI（**兩個都要加**）：
     - `http://localhost:3000/oauth2callback`（本地開發）
     - `https://host-pocket.vercel.app/oauth2callback`（Vercel 正式環境）
4. 將 Client ID / Secret 填入 `.env` 的 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`
5. 執行一次性授權取得 refresh token：

```bash
npm run google:auth
```

6. 將輸出的 `GOOGLE_REFRESH_TOKEN` 貼入 `.env`，重新 `npm start`

#### 選用：Resend 或 Gmail SMTP 自訂確認信

除 Google 日曆邀請外，可額外寄送 Host Pocket 品牌確認信。**擇一設定即可**：

**Resend** — 在 [Resend](https://resend.com) 取得 API Key：

```
RESEND_API_KEY=re_...
FROM_EMAIL=Host Pocket <bookings@yourdomain.com>
```

**Gmail SMTP** — 使用 Gmail 應用程式密碼（需開啟兩步驟驗證）。若尚未設定 Google OAuth，僅 SMTP 也能寄出確認信（不含 Meet 連結）：

```
SMTP_USER=you@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

測試 SMTP 設定可開啟 [email-test.html](email-test.html)。

#### API

| 端點 | 說明 |
|------|------|
| `GET /api/health` | 檢查 Google / Resend 是否已設定 |
| `POST /api/booking` | 寄送預定確認信（body: guestEmail, title, date, time, timezone…） |
| `POST /api/test-email` | Gmail SMTP 測試寄信 |

#### Gmail SMTP 測試頁

開啟 [email-test.html](email-test.html)（或 `http://localhost:3000/email-test.html`）可測試 Gmail 應用程式密碼寄信，無需 Google OAuth。需先 `npm install` 安裝 `nodemailer`。

#### Vercel 部署（https://host-pocket.vercel.app）

1. 在 [Vercel Dashboard](https://vercel.com) → 專案 → **Settings → Environment Variables** 加入：
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_CALENDAR_ID`（選填，預設 `primary`）
   - `RESEND_API_KEY`、`FROM_EMAIL`（選填）
   - `SMTP_USER`、`SMTP_APP_PASSWORD`（選填，Gmail SMTP 確認信）
2. 重新 Deploy
3. 確認：https://host-pocket.vercel.app/api/health 回傳 `"bookingConfigured": true`
4. OAuth 授權仍在本機執行 `npm run google:auth`；授權後 redirect 可用正式網址 `https://host-pocket.vercel.app/oauth2callback`

### 原型操作提示

- **語言切換**：頁首「繁體中文 / English」按鈕
- **快速測試**：Taipei、KYOTO、VILNIUS、RIO — 一鍵注入示範房源代碼
- **配對流程**：Phone 01 輸入代碼 →「配對並載入指南」→ Phone 02 / 03 同步更新
- **自訂代碼**：輸入任意代碼也會動態產生 fallback 指南資料

### 示範房源代碼

| 代碼 | 地點 |
|------|------|
| `TAIPEI-CITY` | 台北 |
| `KYOTO-STATION` | 京都 |
| `VILNIUS-OLDTOWN` | 維爾紐斯舊城 |
| `RIO-COPACABANA` | 里約 Copacabana |

### 技術棧

| 項目 | 說明 |
|------|------|
| [Tailwind CSS](https://tailwindcss.com/) | CDN，Sunset Terracotta 自訂色票 |
| [Hotwire Stimulus](https://stimulus.hotwired.dev/) | `global` / `pairing` / `dashboard` / `explorer` 四個 Controller |
| Node.js + Express | 預定 API、Google Calendar Meet、寄信 |
| Google Calendar API | 建立真實 Google Meet 連結與日曆邀請 |
| Resend（選用） | 自訂品牌確認信 |
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
- **Icon**：丹寧口袋 SVG 內嵌於 `guide.html`；App Icon 比例（圖示約 68%、四邊留白 16%）

### 專案檔案

```
host-pocket/
├── README.md
├── package.json
├── .env.example
├── index.html
├── guide.html
├── js/
│   ├── experience-details.js
│   └── booking-api.js
├── server/
│   ├── index.js
│   └── google-booking.js
├── scripts/
│   └── google-auth.js
└── pocket-icon.png
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

Install dependencies and start the local server (includes booking API):

```bash
npm install
cp .env.example .env   # Google OAuth credentials — see "Experience booking & Google Meet"
npm start
```

Open [http://localhost:3000](http://localhost:3000) for the app, or [http://localhost:3000/guide.html](http://localhost:3000/guide.html) for the guide.

Static-only preview (no real email):

```bash
python3 -m http.server 8080
```

### Experience booking & Google Meet

On confirm, the backend creates a **Google Calendar** event with a **Google Meet** link and emails the guest a calendar invite (`sendUpdates: all`).

Setup: enable Google Calendar API, create OAuth 2.0 Web client with redirect `http://localhost:3000/oauth2callback`, fill `.env`, then run `npm run google:auth` once for `GOOGLE_REFRESH_TOKEN`. Optional: `RESEND_API_KEY` + `FROM_EMAIL` for a branded confirmation email.

### Prototype tips

- **Language**: Toggle 繁體中文 / English in the header
- **Quick demo**: Taipei, KYOTO, VILNIUS, RIO inject sample listing codes
- **Pairing flow**: Enter code on Phone 01 → “Pair & load guide” → Phone 02 / 03 update together
- **Custom codes**: Any listing code generates fallback guide data on the fly

### Demo listing codes

| Code | Location |
|------|----------|
| `TAIPEI-CITY` | Taipei |
| `KYOTO-STATION` | Kyoto |
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
- **Icon**: Denim pocket SVG embedded in `guide.html`; app-icon spacing (~68% glyph, 16% inset)

### Project files

```
host-pocket/
├── README.md        # This file
├── index.html       # Full-screen interactive app (default entry)
├── guide.html       # Operation guide (three-phone showcase)
└── pocket-icon.png  # Brand pocket icon (raster reference)
```

### Parent repository

This prototype lives under `host-pocket/` in the [KimberlyYen/host-pocket](https://github.com/KimberlyYen/host-pocket) repository. The repo root also includes SearchAPI experiments:

- `search_test.py` — sample SearchAPI request
- `airbnb-api-test-summary.md` — Airbnb Experiences API test notes

### Disclaimer

This is a design and engineering prototype, not affiliated with Airbnb, Inc. Airbnb is a trademark of Airbnb, Inc.; host-pocket is a demo product name.
