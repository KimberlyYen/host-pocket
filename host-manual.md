# host-pocket 房東操作手冊

> 給 Airbnb 房東的使用教學 · 繁體中文（台灣）  
> 線上版 App：[https://host-pocket.vercel.app](https://host-pocket.vercel.app)

---

## 這是什麼？

**host-pocket（房東私藏）** 是給 Airbnb 房東用的「入住指南 + 在地推薦」網站。房客入住後，不必一再問 Wi‑Fi、門鎖密碼或附近去哪玩——掃描或點開你分享的連結，就能一次看完。

房東要做的事：**連結房源 → 設定內容 → 分享給房客**。  
房客要做的事：**輸入或開啟連結 → 瀏覽指南 → 需要時一鍵回到 Airbnb 原房源**。

---

## 快速上手（5 分鐘）

### 步驟 1：開啟 App

1. 瀏覽器開啟 [https://host-pocket.vercel.app](https://host-pocket.vercel.app)
2. 右上角可切換 **繁中 / EN**

### 步驟 2：連結你的 Airbnb 房源

1. 在首頁「**連結您的 Airbnb 房源**」區塊
2. 打開 Airbnb 房源頁，複製網址中 `rooms/` **後面的數字**  
   例：`airbnb.com.tw/rooms/12345678` → 輸入 `12345678`
3. 按 **「連結房源並建立指南」**

> **示範用快速主題**（台北、英國、立陶宛、里約）是預先填好的 demo，方便測試 UI，不是你的真實房源。

### 步驟 3：自訂在地精選（選填）

若要改 Wi‑Fi、精選卡片、房源照片等，開啟 **房東設定 · 在地精選**（配對頁底部連結）或 `host-settings.html?listing=你的ID`，儲存後用相同 ID 配對即可。詳見下方「在地精選：房東設定頁」章節。

### 步驟 4：確認房客會看到的內容

連結成功後會進入 **指南主頁（Phone 02）**，請檢查：

| 區塊 | 房客看到什麼 |
|------|----------------|
| 房源照片 | 可左右滑動切換多張照片 |
| 入住須知 | Wi‑Fi 名稱／密碼、電子鎖解鎖步驟 |
| 在地體驗 | 房東精選的 2 張推薦卡片（可點進詳情、預定） |
| 底部導覽 | 指南主頁、實境探索、求助房東 |

### 步驟 5：分享給房客

1. 在指南主頁房源照片右上角，按 **分享** 圖示
2. 系統會複製指南連結到剪貼簿
3. 貼到 Airbnb 訊息、Line、Email 等傳給已訂房的房客

---

## 房東常用功能說明

### 1. 房源代碼（Listing ID）

- 每個 Airbnb 房源有唯一數字 ID（URL 裡 `rooms/` 後面那段）
- 同一個 ID 對應同一份入住指南
- 輸入**從未用過的新 ID** 時，系統會自動產生一份**通用 fallback 指南**（可再客製內容，見下方「在地精選」章節）

### 2. 指南主頁（給房客看）

**入住須知 Tab**

- **Wi‑Fi**：網路名稱與密碼
- **電子鎖**：解鎖步驟；可點「取得動態密碼」查看示範流程

**在地體驗 Tab**

- 標題會顯示如「Mia 的精選私藏行程」
- 兩張橫向滑動卡片：標題、標籤、距離、價格、評分
- 點卡片 → 開啟 **Airbnb 體驗詳情**（照片／影片、地圖、評價、**可預定**）

**導回 Airbnb 房源**

- 房客可隨時從指南返回你的 Airbnb 原 listing 頁（原型示範流程）

### 3. 實境探索（地圖）

- 底部 **「實境探索」** 顯示推薦路線
- 地圖上 pin、虛線對齊兩個精選地點
- 房客可切換要看「推薦 1」或「推薦 2」的路線

### 4. 求助房東

- 底部 **「求助房東」** 開啟聯絡面板
- **傳送訊息給房東**：開啟 mailto（預填主旨）
- 快速跳轉至 Wi‑Fi、電子鎖、在地推薦區塊

### 5. 體驗預定與確認信

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

## 管理者設定：Email（一次性）

### 方式 A：Vercel 環境變數（正式環境推薦）

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

### 方式 B：本機測試

```bash
npm install
cp .env.example .env   # 填入 Resend 或 SMTP
npm start
```

瀏覽器開啟 [http://localhost:3000/email-test.html](http://localhost:3000/email-test.html) 測試寄信。

> `email-test.html` 是**管理者頁**，不要放進給房客的入口連結。

---

## 在地精選：房東設定頁（Neon Postgres）

### 怎麼用

1. 在 App 配對頁底部按 **「房東設定 · 在地精選」**，或直接開啟  
   `host-settings.html?listing=你的房源代碼`
2. 輸入與 App **相同的 Listing ID**（Airbnb `rooms/` 後的數字，或示範代碼如 `TAIPEI-CITY`）→ 按 **載入**
3. 編輯基本資訊與兩張在地精選 → **儲存設定**
4. 回 App 用相同 ID 配對，或開 **預覽 App**（`index.html?listing=ID`）

### 資料存在哪？

| 環境 | 儲存位置 |
|------|----------|
| **正式（Vercel + Neon）** | Postgres 資料表 `listing_settings`（跨裝置同步） |
| **本機** | 需在 `.env` 設定 `DATABASE_URL` 或 `POSTGRES_URL`，並執行 `npm start` |
| **API 不可用時** | 自動 fallback 至瀏覽器 localStorage（離線備援） |

管理者一次性設定：Vercel → Environment Variables → 貼上 Neon 的 `POSTGRES_URL`（或本機 `.env` 設 `DATABASE_URL`）。  
健康檢查：`/api/health` 應回傳 `"dbConfigured": true`。

### 原型限制

- 尚未有房東登入／權限，知道 Listing ID 即可讀寫（正式版需加 auth）
- 圖片仍為 URL，尚未支援上傳

### 示範房源代碼（已內建完整精選，可當範本修改）

| 代碼 | 地點 | 精選示例 |
|------|------|----------|
| `TAIPEI-CITY` | 台北大安 | 撫順街早餐、象山夕陽 |
| `UK-LONDON` | 倫敦 | 博羅市場、泰晤士河漫步 |
| `VILNIUS-OLDTOWN` | 維爾紐斯 | 特拉凱獨木舟、琥珀工坊 |
| `RIO-COPACABANA` | 里約 | 拉帕森巴、糖麵包山日出 |

輸入**全新 Listing ID** 且不在上表時，系統會先產生**通用 placeholder** 精選；可在設定頁覆寫成你的真實推薦。

### 可編輯欄位對照

| 欄位 | 用途 |
|------|------|
| `recTitle1Zh` / `recTitle1En` | 精選 1 標題 |
| `recTitle2Zh` / `recTitle2En` | 精選 2 標題 |
| `recImg1` / `recImg2` | 卡片封面圖 URL |
| `desc1Zh` / `desc1En` | 房東推薦文案（詳情、地圖用） |
| `recBadge1Zh`、`recDist1Zh`、`recPrice1Zh` | 標籤、距離、價格 |
| `recExperienceId1` / `recExperienceId2` | 對應 Airbnb 體驗詳情 API 的 ID |
| `roomGallery` | 房源輪播照片（設定頁：每行一張 URL） |
| `wifi`、`lockZh` | Wi‑Fi 與解鎖說明 |
| `hostEmail` | mailto 備援時帶入的房東 Email（選填） |

資料來源：`js/guide-defaults.js`（示範預設）+ Neon `listing_settings`（API `/api/listings/:id/settings`）。

### 建議的下一步（產品）

若要做成正式多房東 SaaS，建議：

1. 後端 API 依 Listing ID 讀寫設定
2. 圖片上傳（非僅 URL）
3. 房東登入／權限（只能改自己的房源）
4. 分享連結帶 `?listing=` 讓房客免配對直達指南

---

## 示範 vs 正式使用

| 項目 | 示範 | 正式 |
|------|------|------|
| 房源代碼 | `TAIPEI-CITY` 等主題按鈕 | 真實 Airbnb `rooms/` 數字 |
| 在地精選 | 設定頁 + Neon Postgres | 房東登入／權限控管 |
| 確認信 | 需設定 Vercel SMTP／Resend | 同上 |
| 分享連結 | 原型網域 `host-pocket.example.com` | 部署後實際網域 |

---

## 常見問題

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

## 相關連結

| 資源 | 網址 |
|------|------|
| 線上 App | https://host-pocket.vercel.app |
| Email 測試（管理者） | https://host-pocket.vercel.app/email-test.html |
| API 健康檢查 | https://host-pocket.vercel.app/api/health |
| 技術說明 | 專案內 `README.md` |
| 設計稿 | [Figma](https://www.figma.com/design/dgIfgAkZvpINvpzznta9XA/host-pocket) |

---

## 房東每日流程（建議）

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
