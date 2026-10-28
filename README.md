# Quick O
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
manifest.webmanifest
sw.js
assets/            （logo-1-light.svg、logo-1-dark.svg、logo-2-light.svg、logo-2-dark.svg、icon-c.svg、favicon-32.png、apple-touch-icon.png、icon-192.png、icon-512.png）
data/toilets.json
data/babycare.json
data/had_accessible.json
data/SOURCES.md
vendor/            （整個資料夾：leaflet/、markercluster/，含授權檔）
```
全部相對路徑，放 repo 根目錄或子路徑都可運行。`README.md` 可選擇上載（只供閱讀）。
**不要上載**：`archive/`、`tools/`、`logo/`（原始設計檔，網站用 `assets/`）、`data/raw/`、`fetch_data.py`、`PRODUCT_PLAN.md`、`DATA_EXPANSION.md`、所有 `*.png` 截圖（如想將 `fetch_data.py` 放入 repo 作日後自動更新，可另議）。

## 本機
- 更新數據：`python3 fetch_data.py`（只更新育嬰間：`python3 fetch_data.py --babycare-only`；只更新民政署社區會堂無障礙洗手間：`python3 fetch_data.py --had-only`）
- 本機運行：`python3 -m http.server 8000` → http://localhost:8000/ （測試可加 `?lat=22.2819&lng=114.1582`）
- 檢查（需 Chrome 及 `npm i puppeteer-core axe-core`）：
  - `node tools/check.js http://localhost:8000/index.html` —— 載入時間＋axe-core
  - `node tools/final.js http://localhost:8000/index.html` —— 淺色／深色 axe-core＋截圖 `final-light.png`、`final-dark.png`
  - `node tools/babycare.js http://localhost:8000/index.html` —— 育嬰間彈出視窗淺色／深色 axe-core＋截圖 `babycare-light.png`、`babycare-dark.png`
  - `node tools/release.js http://localhost:8000/index.html` —— 發佈前全套：功能測試、淺色／深色 axe-core（含社區會堂彈出視窗）、截圖 `home-*`、`release-*`、`markers-*`、`popup-*`、`had-popup-*`、`accessible-filter-light.png`、`offline-light.png`（請在專案根目錄執行）
- 發佈新版本時：更新 `sw.js` 內的 `VERSION`，用戶裝置會換走舊快取。
- 重新生成 PNG 圖示：`node tools/make_icon_png.js`
- 發佈前整體檢查：`node tools/release.js http://localhost:8000/index.html`（淺色／深色截圖、axe-core、功能、離線測試）
- 來源見 `data/SOURCES.md`；產品計劃見 `PRODUCT_PLAN.md`。第三方庫授權見 `vendor/*/LICENSE*`。
