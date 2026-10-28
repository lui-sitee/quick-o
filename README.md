# Quick O（MVP）
以 DATA.GOV.HK 官方數據（FEHD 食物環境衞生署、AFCD 漁農自然護理署）搵最近公廁，一按步行導航。

## 設計
- 定案設計：霓虹招牌風（2026-10-28）—— `theme.css`，毋須網址參數。
- 顏色模式：預設「自動」跟隨手機淺色／深色設定；頁頂可切換 自動／淺色／深色（記於 localStorage `qo_mode`）。測試可加 `?mode=light|dark`。
- 其他試用設計及舊截圖已移至 `archive/`（只作保留，**不要上載**）。

## 上載到 GitHub Pages repo 根目錄（只上載以下項目）
```
.nojekyll
index.html
app.js
style.css
theme.css
data/toilets.json
data/SOURCES.md
vendor/            （整個資料夾：leaflet/、markercluster/，含授權檔）
```
全部相對路徑，放 repo 根目錄或子路徑都可運行。`README.md` 可選擇上載（只供閱讀）。
**不要上載**：`archive/`、`tools/`、`data/raw/`、`fetch_data.py`、`PRODUCT_PLAN.md`、`final-*.png`（如想將 `fetch_data.py` 放入 repo 作日後自動更新，可另議）。

## 本機
- 更新數據：`python3 fetch_data.py`
- 本機運行：`python3 -m http.server 8000` → http://localhost:8000/ （測試可加 `?lat=22.2819&lng=114.1582`）
- 檢查（需 Chrome 及 `npm i puppeteer-core axe-core`）：
  - `node tools/check.js http://localhost:8000/index.html` —— 載入時間＋axe-core
  - `node tools/final.js http://localhost:8000/index.html` —— 淺色／深色 axe-core＋截圖 `final-light.png`、`final-dark.png`
- 來源見 `data/SOURCES.md`；產品計劃見 `PRODUCT_PLAN.md`。第三方庫授權見 `vendor/*/LICENSE*`。
