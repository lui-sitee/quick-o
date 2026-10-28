# 數據來源（自動生成：2026-10-28 03:08 UTC）

本專案只使用 DATA.GOV.HK 官方開放數據，未作任何非官方地理編碼或資料推測。
共 1139 個廁所，其中 1139 個有官方座標（FEHD 971、AFCD 168）。

## FEHD facility and service locations
- 發佈機構：Food and Environmental Hygiene Department
- 數據集頁面：https://data.gov.hk/tc-data/dataset/hk-fehd-fehdlocatn-fehd-facility-and-service-locations
- 下載／資源：
  - FEHD facility and service locations (English)（XML）：https://www.fehd.gov.hk/english/map/fehd_map_e.xml
  - FEHD facility and service locations (Traditional Chinese)（XML）：https://www.fehd.gov.hk/tc_chi/map/fehd_map_c.xml
  - FEHD facility and service locations (Simplified Chinese)（XML）：https://www.fehd.gov.hk/sc_chi/map/fehd_map_s.xml
  - FEHD facility and service locations (bilingual version)(Common Spatial Data Infrastructure)（API）：https://portal.csdi.gov.hk/geoportal/?datasetId=fehd_rcd_1629969687926_30590
- 數據字典：https://www.fehd.gov.hk/datagovhk/data_dictionary/english/datadict_locations.pdf
- 更新頻率：As and when necessary
- 數據集元數據最後更新（CKAN metadata_modified）：2023-02-20
- 檔案生成日期（XML generation_date）：中文版 2026-03-02；英文版 2026-10-26
- HTTP Last-Modified：中文版 Mon, 02 Mar 2026 08:58:20 GMT；英文版 Mon, 26 Oct 2026 04:11:32 GMT
- 記錄內最新 updateDate：2026-10-26 11:50:37
- 注意：中文版 XML 較英文版舊；只在中文版出現 11 項、只在英文版出現 7 項。位置及狀態採用 updateDate 較新者；暫停服務備註以英文版（較新）為準，另保留中文版備註。
- 已收錄類別：公廁, 長期擺放的流動廁所, 旱廁（map_type = toilet, portable_toilet, ap）
- 授權／條款：DATA.GOV.HK 使用條款 https://data.gov.hk/tc/terms-and-conditions（容許免費作商業及非商業用途，須註明來源並鳴謝政府及相關機構）

## Toilets in Country Parks
- 發佈機構：Agriculture, Fisheries and Conservation Department
- 數據集頁面：https://data.gov.hk/tc-data/dataset/hk-afcd-afcdlist-toilet
- 下載／資源：
  - Toilets in Country Parks (English / Traditional Chinese)（CSV）：https://www.afcd.gov.hk/data/AFCD_Toilet.csv
  - Toilets in Country Parks (English / Traditional Chinese)(CSDI Portal)（API）：https://portal.csdi.gov.hk/geoportal/?datasetId=afcd_rcd_1635136427551_29173
- 數據字典：https://www.afcd.gov.hk/data/AFCD_Toilet.pdf
- 更新頻率：As and when there are new entries
- 數據集元數據最後更新（CKAN metadata_modified）：2025-01-21
- HTTP Last-Modified：Fri, 18 Dec 2020 06:35:51 GMT
- 編碼：Big5-HKSCS；記錄內無逐項更新日期（updated = 官方數據未提供）
- 授權／條款：DATA.GOV.HK 使用條款 https://data.gov.hk/tc/terms-and-conditions（容許免費作商業及非商業用途，須註明來源並鳴謝政府及相關機構）

## 官方數據未提供的欄位
無障礙設施、嬰兒護理間、男/女/通用廁格數目、清潔時間 — 兩個數據集均無此類欄位，界面顯示「官方數據未提供」。

## 已知數據問題
- FEHD 所有「長期擺放的流動廁所」的 districtID 均為 CW（中西區），但座標遍佈全港（例如柴灣），故界面不採用其地區，改標「流動廁所（官方數據未有正確分區）」；原始代碼保留在 district_code_official。

## 未採用
- CSDI 空間數據共享平台圖層（FEHD：fehd_rcd_1629969687926_30590；AFCD：afcd_rcd_1635136427551_29173）與上述檔案屬同一數據，MVP 未另行使用。
