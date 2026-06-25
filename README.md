# 房東私藏 host-pocket

If you are
- Airbnb HOST 
    - [Host Guide (EN)](#host-guide-en)
    - [房東使用指南](#房東使用指南)

- Programmer 
    - [English](#english)
    - [繁體中文](#繁體中文)
    
    [Design system](https://www.figma.com/design/dgIfgAkZvpINvpzznta9XA/host-pocket?node-id=0-1&t=s4yI820zRJ2lL9v7-1)

- volunteering  
   [Sheet](https://forms.gle/Deo5HpTECjG8rYB57)

---

<a id="host-guide-en"></a>

## Host Guide

> **[繁體中文](#房東使用指南)** · **[English](#host-guide-en)**  
> 線上版 App · Live app：[https://host-pocket.vercel.app](https://host-pocket.vercel.app)  
> Standalone file: [host-manual.en.md](host-manual.en.md)

---

### What is this?

**host-pocket** host-pocket is a stay guide handcrafted for Airbnb hosts. Share just one link with your guests, and they can easily explore your tips and local picks—making them feel truly cared for and welcomed.

---

### Quick start (5 minutes)

#### Step 1: Open the app

1. Go to [https://host-pocket.vercel.app](https://host-pocket.vercel.app)
2. Toggle **繁中 / EN** in the top bar

#### Step 2: Link your Airbnb listing

1. On the home screen, find **Link Your Airbnb Listing**
2. Open your Airbnb listing page and copy the numbers **after** `rooms/` in the URL  
   e.g. `airbnb.com/rooms/12345678` → enter `12345678`
3. Tap **Link Listing & Build Guide**

> **Quick demo themes** (Taipei, UK, Vilnius, Rio) are pre-filled samples for testing—not your real listing.

#### Step 3: Customize local picks (optional)

To edit Wi‑Fi, recommendation cards, photos, etc., open **Host settings · Local picks** (link at the bottom of the pairing screen) or `host-settings.html?listing=YOUR_ID`. Save, then pair again with the same ID. See **Local picks: host settings** below.

#### Step 4: Review what guests will see

After linking, you land on the **guide home (Phone 02)**. Check:

| Area | What guests see |
|------|-----------------|
| Listing photos | Swipe horizontally through gallery |
| Stay essentials | Wi‑Fi name/password, smart-lock steps |
| Local experiences | 4 host-picked cards (details, booking) |
| Bottom nav | Guide home, map explorer, contact host |

#### Step 5: Share with guests

1. On the guide home, tap **Share** on the listing photo
2. The guide URL is copied to the clipboard
3. Paste into Airbnb messages, Line, email, etc.

---

### Host features

#### 1. Listing ID

- Each Airbnb listing has a unique numeric ID (after `rooms/` in the URL)
- One ID = one stay guide
- A **new ID** never used before gets a generic fallback guide (customize via settings)

#### 2. Guide home (guest-facing)

**Stay essentials tab**

- **Wi‑Fi**: network name and password
- **Smart lock**: unlock steps; tap for demo dynamic code flow

**Local experiences tab**

- Title like “Mia's Handpicked Escapes”
- Four swipeable cards: title, badge, distance, price, rating
- Tap a card → **Airbnb experience details** (media, map, reviews, **bookable**)

**Back to Airbnb listing**

- Guests can open your linked listing overlay from the guide (prototype flow)

#### 3. Map explorer

- Bottom **Map explorer** shows a recommended route
- Pins and dashed line align to pick locations
- Guests can switch routes for picks 1–4 via map actions

#### 4. Contact host

- Bottom **Contact host** opens the help panel
- **Send message**: opens mailto with prefilled subject
- Quick jump to Wi‑Fi, lock, and local picks

#### 5. Experience booking & confirmation email

After **Book experience** in the detail view:

1. Pick date, time slot, timezone (including custom “Other”)
2. Enter **email**
3. Tap **Confirm booking**

**Email delivery (one-time admin setup):**

| Method | Description |
|--------|-------------|
| **Automatic email** | Resend or Gmail SMTP configured → guest receives confirmation |
| **mailto fallback** | No SMTP → opens guest’s mail app with booking details |

> Guests never enter Gmail or SMTP credentials.

---

### Admin setup: Email (one-time)

#### Option A: Vercel env vars (production)

[Vercel Dashboard](https://vercel.com) → **Settings → Environment Variables**

**Resend (recommended)**

```
RESEND_API_KEY=re_...
FROM_EMAIL=Host Pocket <bookings@yourdomain.com>
```

**Or Gmail SMTP**

```
SMTP_USER=you@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Redeploy, then verify:  
`https://host-pocket.vercel.app/api/health` returns `"bookingConfigured": true`

#### Option B: Local testing

```bash
npm install
cp .env.example .env   # Resend or SMTP
npm start
```

Open [http://localhost:3000/email-test.html](http://localhost:3000/email-test.html) to test email.

> `email-test.html` is an **admin page**—do not link it from the guest UI.

---

### Local picks: host settings (Neon Postgres)

#### How to use

1. Tap **Host settings · Local picks** on the pairing screen, or open  
   `host-settings.html?listing=YOUR_LISTING_ID`
2. Enter the **same Listing ID** as in the app → **Load**
3. Edit basics and four local picks → **Save**
4. Pair again in the app, or **Preview** via `index.html?listing=ID`

#### Where data is stored

| Environment | Storage |
|-------------|---------|
| **Production (Vercel + Neon)** | Postgres table `listing_settings` (syncs across devices) |
| **Local** | Set `DATABASE_URL` or `POSTGRES_URL` in `.env`, run `npm start` |
| **API unavailable** | Falls back to browser localStorage |

One-time admin: add Neon `POSTGRES_URL` in Vercel (or `DATABASE_URL` locally).  
Health check: `/api/health` should return `"dbConfigured": true`.

#### Prototype limits

- No host login yet—anyone with the Listing ID can read/write (add auth for production)
- Images are URLs only; no upload yet

#### Demo listing codes

| Code | Location | Sample picks |
|------|----------|--------------|
| `TAIPEI-CITY` | Taipei Da'an | Breakfast street, sunset hike, night market, tea walk |
| `UK-LONDON` | London | Borough Market, Thames walk, coffee crawl, St Paul's stroll |
| `VILNIUS-OLDTOWN` | Vilnius | Trakai kayak, amber workshop, street art, vault café |
| `RIO-COPACABANA` | Rio | Lapa samba, Sugarloaf sunrise, Ipanema run, Selarón steps |

New IDs get placeholder picks until you override them in settings.

#### Editable fields

| Field | Purpose |
|-------|---------|
| `recTitle1Zh` / `recTitle1En` | Pick 1 title |
| `recTitle2Zh` / `recTitle2En` | Pick 2 title |
| `recTitle3Zh` / `recTitle3En` | Pick 3 title |
| `recTitle4Zh` / `recTitle4En` | Pick 4 title |
| `recImg1`–`recImg4` | Card cover image URLs |
| `desc1Zh` / `desc1En` | Host recommendation copy |
| `recBadge*`, `recDist*`, `recPrice*` | Badge, distance, price |
| `recExperienceId1`–`4` | Airbnb experience detail IDs |
| `roomGallery` | Listing carousel (one URL per line in settings) |
| `wifi`, `lockZh` / `lockEn` | Wi‑Fi and lock instructions |
| `hostEmail` | Optional host email for mailto fallback |

Data: `js/guide-defaults.js` (demo defaults) + Neon `listing_settings` (`GET/PUT /api/listings/:id/settings`).

---

### Demo vs production

| Item | Demo | Production |
|------|------|------------|
| Listing ID | Theme buttons like `TAIPEI-CITY` | Real Airbnb `rooms/` number |
| Local picks | Settings page + Neon Postgres | Host login / access control |
| Confirmation email | Requires Resend/SMTP on Vercel | Same |
| Share link | Prototype domain | Your deployed domain |

---

### FAQ

**Q: Do guests need to install an app?**  
A: No. Any mobile browser works.

**Q: Multiple listings?**  
A: Yes. Each Listing ID has its own guide; enter a new ID on the home screen to switch.

**Q: Why does confirm booking open the mail app?**  
A: The server has no Resend/SMTP yet. Complete [Email setup](#admin-setup-email-one-time); then confirmations send automatically.

**Q: How do I change images?**  
A: Use **Host settings · Local picks** for gallery and card URLs.

**Q: Official Airbnb product?**  
A: No. This is a design/engineering prototype, not affiliated with Airbnb, Inc.

---

### Links

| Resource | URL |
|----------|-----|
| Live app | https://host-pocket.vercel.app |
| Email test (admin) | https://host-pocket.vercel.app/email-test.html |
| API health | https://host-pocket.vercel.app/api/health |
| Tech docs | `README.md` in this repo |
| Design | [Figma](https://www.figma.com/design/dgIfgAkZvpINvpzznta9XA/host-pocket) |

---

### Suggested daily host flow

```
Booking confirmed
   ↓
Link Listing ID → verify Wi‑Fi, lock, local picks
   ↓
Share guide link (Airbnb message)
   ↓
Guests self-serve; contact host if needed
   ↓
(Optional) Confirm email is configured for booking confirmations
```

---

*Doc version: 2026-06 · host-pocket prototype (email-only booking, mailto fallback, custom timezone “Other”)*

---

## 房東使用指南

> **[繁體中文](#房東使用指南)** · **[English](#host-guide-en)**  
> 線上版 App · Live app：[https://host-pocket.vercel.app](https://host-pocket.vercel.app)  
> Standalone file: [host-manual.md](host-manual.md)

---

### 這是什麼？

**host-pocket（房東私藏）** 是給 Airbnb 房東用的「入住指南 + 在地推薦」網站。房客入住後，不必一再問 Wi‑Fi、門鎖密碼或附近去哪玩——掃描或點開你分享的連結，就能一次看完。

房東要做的事：**連結房源 → 設定內容 → 分享給房客**。  
房客要做的事：**輸入或開啟連結 → 瀏覽指南 → 需要時一鍵回到 Airbnb 原房源**。

---

### 快速上手（5 分鐘）

#### 步驟 1：開啟 App

1. 瀏覽器開啟 [https://host-pocket.vercel.app](https://host-pocket.vercel.app)
2. 右上角可切換 **繁中 / EN**

#### 步驟 2：連結你的 Airbnb 房源

1. 在首頁「**連結您的 Airbnb 房源**」區塊
2. 打開 Airbnb 房源頁，複製網址中 `rooms/` **後面的數字**  
   例：`airbnb.com.tw/rooms/12345678` → 輸入 `12345678`
3. 按 **「連結房源並建立指南」**

> **示範用快速主題**（台北、英國、立陶宛、里約）是預先填好的 demo，方便測試 UI，不是你的真實房源。

#### 步驟 3：自訂在地精選（選填）

若要改 Wi‑Fi、精選卡片、房源照片等，開啟 **房東設定 · 在地精選**（配對頁底部連結）或 `host-settings.html?listing=你的ID`，儲存後用相同 ID 配對即可。詳見下方「在地精選：房東設定頁」章節。

#### 步驟 4：確認房客會看到的內容

連結成功後會進入 **指南主頁（Phone 02）**，請檢查：

| 區塊 | 房客看到什麼 |
|------|----------------|
| 房源照片 | 可左右滑動切換多張照片 |
| 入住須知 | Wi‑Fi 名稱／密碼、電子鎖解鎖步驟 |
| 在地體驗 | 房東精選的 4 張推薦卡片（可點進詳情、預定） |
| 底部導覽 | 指南主頁、實境探索、求助房東 |

#### 步驟 5：分享給房客

1. 在指南主頁房源照片右上角，按 **分享** 圖示
2. 系統會複製指南連結到剪貼簿
3. 貼到 Airbnb 訊息、Line、Email 等傳給已訂房的房客

---

### 房東常用功能說明

#### 1. 房源代碼（Listing ID）

- 每個 Airbnb 房源有唯一數字 ID（URL 裡 `rooms/` 後面那段）
- 同一個 ID 對應同一份入住指南
- 輸入**從未用過的新 ID** 時，系統會自動產生一份**通用 fallback 指南**（可再客製內容，見下方「在地精選」章節）

#### 2. 指南主頁（給房客看）

**入住須知 Tab**

- **Wi‑Fi**：網路名稱與密碼
- **電子鎖**：解鎖步驟；可點「取得動態密碼」查看示範流程

**在地體驗 Tab**

- 標題會顯示如「Mia 的精選私藏行程」
- 四張橫向滑動卡片：標題、標籤、距離、價格、評分
- 點卡片 → 開啟 **Airbnb 體驗詳情**（照片／影片、地圖、評價、**可預定**）

**導回 Airbnb 房源**

- 房客可隨時從指南返回你的 Airbnb 原 listing 頁（原型示範流程）

#### 3. 實境探索（地圖）

- 底部 **「實境探索」** 顯示推薦路線
- 地圖上 pin、虛線對齊兩個精選地點
- 房客可切換要看「推薦 1」或「推薦 2」的路線

#### 4. 求助房東

- 底部 **「求助房東」** 開啟聯絡面板
- **傳送訊息給房東**：開啟 mailto（預填主旨）
- 快速跳轉至 Wi‑Fi、電子鎖、在地推薦區塊

#### 5. 體驗預定與確認信

房客在體驗詳情按 **「預定體驗」** 後：

1. 選日期、時段、時區（含「其他」自訂時區）
2. 輸入 **Email**
3. 按 **確認預定**

**寄信方式（二擇一，由房東／管理者設定一次即可）：**

| 方式 | 說明 |
|------|------|
| **自動寄信** | 後端已設定 Resend 或 Gmail SMTP → 房客收到確認信 |
| **mailto 備援** | 未設定 SMTP 時 → 開啟房客手機的郵件 App，收件人為房客輸入的 Email，內文已帶預定資訊 |

> 房客**不需要**也不應填寫 Gmail 或 SMTP 密碼。

---

### 管理者設定：Email（一次性）

#### 方式 A：Vercel 環境變數（正式環境推薦）

登入 [Vercel Dashboard](https://vercel.com) → 專案 **Settings → Environment Variables**

**Resend（推薦）**

```
RESEND_API_KEY=re_...
FROM_EMAIL=Host Pocket <bookings@yourdomain.com>
```

**或 Gmail SMTP**

```
SMTP_USER=you@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

設定後 **重新 Deploy**，並確認：  
`https://host-pocket.vercel.app/api/health` 回傳 `"bookingConfigured": true`

#### 方式 B：本機測試

```bash
npm install
cp .env.example .env   # 填入 Resend 或 SMTP
npm start
```

瀏覽器開啟 [http://localhost:3000/email-test.html](http://localhost:3000/email-test.html) 測試寄信。

> `email-test.html` 是**管理者頁**，不要放進給房客的入口連結。

---

### 在地精選：房東設定頁（Neon Postgres）

#### 怎麼用

1. 在 App 配對頁底部按 **「房東設定 · 在地精選」**，或直接開啟  
   `host-settings.html?listing=你的房源代碼`
2. 輸入與 App **相同的 Listing ID**（Airbnb `rooms/` 後的數字，或示範代碼如 `TAIPEI-CITY`）→ 按 **載入**
3. 編輯基本資訊與四張在地精選 → **儲存設定**
4. 回 App 用相同 ID 配對，或開 **預覽 App**（`index.html?listing=ID`）

#### 資料存在哪？

| 環境 | 儲存位置 |
|------|----------|
| **正式（Vercel + Neon）** | Postgres 資料表 `listing_settings`（跨裝置同步） |
| **本機** | 需在 `.env` 設定 `DATABASE_URL` 或 `POSTGRES_URL`，並執行 `npm start` |
| **API 不可用時** | 自動 fallback 至瀏覽器 localStorage（離線備援） |

管理者一次性設定：Vercel → Environment Variables → 貼上 Neon 的 `POSTGRES_URL`（或本機 `.env` 設 `DATABASE_URL`）。  
健康檢查：`/api/health` 應回傳 `"dbConfigured": true`。

#### 原型限制

- 尚未有房東登入／權限，知道 Listing ID 即可讀寫（正式版需加 auth）
- 圖片仍為 URL，尚未支援上傳

#### 示範房源代碼（已內建完整精選，可當範本修改）

| 代碼 | 地點 | 精選示例 |
|------|------|----------|
| `TAIPEI-CITY` | 台北大安 | 撫順街早餐、象山夕陽 |
| `UK-LONDON` | 倫敦 | 博羅市場、泰晤士河漫步 |
| `VILNIUS-OLDTOWN` | 維爾紐斯 | 特拉凱獨木舟、琥珀工坊 |
| `RIO-COPACABANA` | 里約 | 拉帕森巴、糖麵包山日出 |

輸入**全新 Listing ID** 且不在上表時，系統會先產生**通用 placeholder** 精選；可在設定頁覆寫成你的真實推薦。

#### 可編輯欄位對照

| 欄位 | 用途 |
|------|------|
| `recTitle1Zh` / `recTitle1En` | 精選 1 標題 |
| `recTitle2Zh` / `recTitle2En` | 精選 2 標題 |
| `recTitle3Zh` / `recTitle3En` | 精選 3 標題 |
| `recTitle4Zh` / `recTitle4En` | 精選 4 標題 |
| `recImg1` / `recImg2` | 卡片封面圖 URL |
| `desc1Zh` / `desc1En` | 房東推薦文案（詳情、地圖用） |
| `recBadge1Zh`、`recDist1Zh`、`recPrice1Zh` | 標籤、距離、價格 |
| `recExperienceId1` / `recExperienceId2` | 對應 Airbnb 體驗詳情 API 的 ID |
| `roomGallery` | 房源輪播照片（設定頁：每行一張 URL） |
| `wifi`、`lockZh` | Wi‑Fi 與解鎖說明 |
| `hostEmail` | mailto 備援時帶入的房東 Email（選填） |

資料來源：`js/guide-defaults.js`（示範預設）+ Neon `listing_settings`（API `/api/listings/:id/settings`）。

#### 建議的下一步（產品）

若要做成正式多房東 SaaS，建議：

1. 後端 API 依 Listing ID 讀寫設定
2. 圖片上傳（非僅 URL）
3. 房東登入／權限（只能改自己的房源）
4. 分享連結帶 `?listing=` 讓房客免配對直達指南

---

### 示範 vs 正式使用

| 項目 | 示範 | 正式 |
|------|------|------|
| 房源代碼 | `TAIPEI-CITY` 等主題按鈕 | 真實 Airbnb `rooms/` 數字 |
| 在地精選 | 設定頁 + Neon Postgres | 房東登入／權限控管 |
| 確認信 | 需設定 Vercel SMTP／Resend | 同上 |
| 分享連結 | 原型網域 `host-pocket.example.com` | 部署後實際網域 |

---

### 常見問題

**Q：房客要安裝 App 嗎？**  
A：不用。用手機瀏覽器開連結即可。

**Q：可以管理多個房源嗎？**  
A：可以。每個 Airbnb Listing ID 對應一份指南；首頁可重新輸入另一個 ID 切換。

**Q：為什麼按「確認預定」後開啟郵件 App 而不是直接收到信？**  
A：代表伺服器尚未設定 Resend／SMTP。請管理者完成 [Email 設定](#管理者設定email一次性)；設定完成後會改為自動寄信。

**Q：圖片怎麼換？**  
A：房源輪播與精選卡圖片目前都在 `guidesDb` 的 URL 欄位，需改程式或等房東設定頁。

**Q：和 Airbnb 官方有關係嗎？**  
A：本專案為設計／技術原型，與 Airbnb, Inc. 無官方關聯。

---

### 相關連結

| 資源 | 網址 |
|------|------|
| 線上 App | https://host-pocket.vercel.app |
| Email 測試（管理者） | https://host-pocket.vercel.app/email-test.html |
| API 健康檢查 | https://host-pocket.vercel.app/api/health |
| 技術說明 | 專案內 `README.md` |
| 設計稿 | [Figma](https://www.figma.com/design/dgIfgAkZvpINvpzznta9XA/host-pocket) |

---

### 房東每日流程（建議）

```
訂房確認
   ↓
連結 Listing ID → 檢查 Wi‑Fi／門鎖／在地精選是否正確
   ↓
分享指南連結給房客（Airbnb 訊息）
   ↓
房客自助查指南；有問題用「求助房東」
   ↓
（可選）確認 Email 設定正常，以便體驗預定確認信自動寄出
```

---

*文件版本：2026-06 · 對應 host-pocket 原型（email-only 預定、mailto 備援、時區「其他」選項）*

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
cp .env.example .env   # 填入 Resend 或 SMTP 環境變數（見下方「體驗預定與 Email 確認信」）
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

確認預定時，後端會透過 **Resend** 或 **Gmail SMTP（環境變數）** 寄送確認信至旅客 email。**房客不需要填寫任何 Gmail 或 SMTP 設定**，只需輸入自己的收件 email。

#### 管理者設定（一次性）

在 [Vercel Dashboard](https://vercel.com) → **Settings → Environment Variables** 擇一設定：

**Resend（推薦）**

```
RESEND_API_KEY=re_...
FROM_EMAIL=Host Pocket <bookings@yourdomain.com>
```

**Gmail SMTP**

```
SMTP_USER=you@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

本機開發可複製 `.env.example` 為 `.env` 填入上述變數，或寫入 `config/smtp.local.json`（見 `config/smtp.local.json.example`）。

管理者測試頁：[email-test.html](email-test.html)（`/email-test.html`，不對房客開放入口）

#### API

| 端點 | 說明 |
|------|------|
| `GET /api/health` | 檢查 Resend / SMTP 是否已設定 |
| `POST /api/booking` | 寄送預定確認信（body: guestEmail, title, date, time, timezone…） |
| `POST /api/test-email` | 管理者 SMTP 測試寄信 |

#### Vercel 部署（https://host-pocket.vercel.app）

1. 在 **Settings → Environment Variables** 加入 `RESEND_API_KEY` + `FROM_EMAIL`，或 `SMTP_USER` + `SMTP_APP_PASSWORD`
2. 重新 Deploy
3. 確認：https://host-pocket.vercel.app/api/health 回傳 `"bookingConfigured": true`

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
| Node.js + Express | 預定 API、寄送確認信 |
| Resend / Gmail SMTP | 寄送預定確認信 |
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
│   ├── booking.js
│   └── smtp-mail.js
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

**host-pocket** is a stay guide for Airbnb hosts. Share one link with guests—they can browse your tips and local picks, and get back to your Airbnb listing in one tap.

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

Install dependencies and start the local server (includes booking email API):

```bash
npm install
cp .env.example .env   # Resend or SMTP credentials — see "Experience booking & email"
npm start
```

Open [http://localhost:3000](http://localhost:3000) for the app, or [http://localhost:3000/guide.html](http://localhost:3000/guide.html) for the guide.

Static-only preview (no real email):

```bash
python3 -m http.server 8080
```

### Experience booking & email

On confirm, the backend sends a **booking confirmation email** to the guest via **Resend** or **Gmail SMTP**. Guests only need to enter their email — no OAuth or SMTP setup on their side.

**Admin setup (one-time)** — in [Vercel Dashboard](https://vercel.com) → **Settings → Environment Variables**, choose one:

**Resend (recommended)**

```
RESEND_API_KEY=re_...
FROM_EMAIL=Host Pocket <bookings@yourdomain.com>
```

**Gmail SMTP**

```
SMTP_USER=you@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

For local dev, copy `.env.example` to `.env`, or use `config/smtp.local.json` (see `config/smtp.local.json.example`).

Admin test page: [email-test.html](email-test.html) (`/email-test.html`, not linked in the guest UI)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Check whether Resend / SMTP is configured |
| `POST /api/booking` | Send booking confirmation email |
| `POST /api/test-email` | Admin SMTP test send |

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
| Node.js + Express | Booking API, confirmation email |
| Resend / Gmail SMTP | Booking confirmation email |
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
