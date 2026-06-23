# whatSearchAPIcanDo

SearchAPI 能力探索與 **host-pocket** 房東端原型。前者驗證 Airbnb 相關 API 是否可用；後者示範房東如何透過「房源代碼」配對，為房客建立可導回原 Airbnb 房源的在線指南。

## 專案結構

```
whatSearchAPIcanDo/
├── README.md
├── airbnb-api-test-summary.md   # SearchAPI Airbnb 成功呼叫紀錄
├── search_test.py               # SearchAPI 測試腳本（需自行設定 API key）
└── host-pocket/
    ├── index.html               # Hotwire Stimulus + Tailwind 互動原型
    ├── pocket-icon.svg          # 品牌口袋 icon（向量）
    ├── pocket-icon.png          # 品牌口袋 icon（點陣）
    └── building-icon.png        # 舊版 icon 素材
```

## host-pocket 原型

以三支手機 mockup 呈現房東／房客流程：

| 畫面 | 說明 |
|------|------|
| **Phone 01** | 配對啟動面板：輸入房源代碼、快速測試（KYOTO / HUALIEN / VILNIUS / RIO） |
| **Phone 02** | 配對後主面板：房源卡片、在地探索、一鍵導回 Airbnb |
| **Phone 03** | 地圖與實境探索 |

技術棧：Tailwind CSS、Hotwire Stimulus（CDN）、Font Awesome。無建置步驟，可直接用瀏覽器開啟。

### 本地預覽

```bash
cd host-pocket
python3 -m http.server 8080
```

瀏覽器開啟 `http://localhost:8080`。

### 品牌

- 主色：`#FF5B3E`（hp-coral）
- Airbnb 合作色：`#FF5A5F`
- 字標：**host-pocket**（全小寫）
- Partner bar：host-pocket ↔ Airbnb 合作廠商漸層列

## SearchAPI 測試

[`airbnb-api-test-summary.md`](./airbnb-api-test-summary.md) 記錄已驗證成功的端點：

- `airbnb_experiences_search` — 搜尋體驗
- `airbnb_experience_details` — 體驗詳情

### 執行測試腳本

1. 至 [SearchAPI](https://www.searchapi.io/) 取得 API key
2. 設定環境變數：

```bash
export SEARCHAPI_KEY="your_api_key_here"
python3 search_test.py
```

## 授權

本 repo 為探索與原型用途。Airbnb 為 Airbnb, Inc. 商標；host-pocket 為本專案示範名稱。
