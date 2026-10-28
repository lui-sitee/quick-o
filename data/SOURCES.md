# 數據來源（自動生成：2026-10-28 11:08 UTC）

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

<!-- babycare -->
## Baby-care Facilities in Government Premises（育嬰間）
- 發佈機構：Department of Health（衞生署）
- 數據集頁面：https://data.gov.hk/tc-data/dataset/hk-dh-dh_fhs-fhs-dataset-4
- 下載／資源：
  - Baby-care Facilities in Government Premises (English)（GML）：https://portal.csdi.gov.hk/geoportal/?lang=en&datasetId=dh_rcd_1730081674729_50015
  - Baby-care Facilities in Government Premises (Traditional Chinese)（GML）：https://portal.csdi.gov.hk/geoportal/?lang=zh-cn&datasetId=dh_rcd_1730081674729_50015
  - Baby-care Facilities in Government Premises (Simplified Chinese)（GML）：https://portal.csdi.gov.hk/geoportal/?lang=zh-hk&datasetId=dh_rcd_1730081674729_50015
- 實際下載（CSDI WFS GeoJSON，中文／英文圖層）：https://portal.csdi.gov.hk/server/services/common/dh_rcd_1730081674729_50015/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=csdi:Babycare_Facilities_TC&outputFormat=geojson&srsName=EPSG:4326（英文圖層把 TC 換成 EN）
- 數據字典：官方數據未提供
- 更新頻率：Twice per year or as when necessary
- 數據集元數據最後更新（CKAN metadata_modified）：2026-02-25
- 下載日期：2026-10-28 11:08 UTC
- 原始記錄：中文 306、英文 306（以 OBJECTID 配對，中英座標不一致 0 項）；收錄 306 項；剔除：無
- 官方欄位：名稱、部門、地區、區域、數量（Amount）、場地網址、座標；**無地址、開放時間、無障礙、性別／開放對象、逐項更新日期**，界面顯示「官方數據未提供」
- 只限政府處所（康文署、醫管局、衞生署、房屋署等），不包括商場等私人處所
- 授權／條款：DATA.GOV.HK 使用條款 https://data.gov.hk/tc/terms-and-conditions（容許免費作商業及非商業用途，須註明來源並鳴謝政府及相關機構）
<!-- /babycare -->



<!-- had -->
## Barrier-free facilities in community halls/ community centres（社區會堂無障礙洗手間）
- 發佈機構：Home Affairs Department（民政事務總署）
- 數據集頁面：https://data.gov.hk/tc-data/dataset/hk-had-json1-barrier-free-facilities-in-community-halls-community-centres
- 下載／資源：
  - Barrier-free facilities in community halls/ community centres (English)（CSV）：https://www.had.gov.hk/psi/barrier-free-facilities-in-community-halls-community-centres/barrier_free_facilities_in_community_halls_community_centres_en.csv
  - Barrier-free facilities in community halls/ community centres (Traditional Chinese)（CSV）：https://www.had.gov.hk/psi/barrier-free-facilities-in-community-halls-community-centres/barrier_free_facilities_in_community_halls_community_centres_tc.csv
  - Barrier-free facilities in community halls/ community centres (Simplified Chinese)（CSV）：https://www.had.gov.hk/psi/barrier-free-facilities-in-community-halls-community-centres/barrier_free_facilities_in_community_halls_community_centres_sc.csv
  - Barrier-free facilities in community halls/ community centres（API）：https://portal.csdi.gov.hk/geoportal/?datasetId=had_rcd_1635393119641_62162
- 實際下載：CSDI WFS GeoJSON（座標、名稱、地址、設施、LastUpdate）https://portal.csdi.gov.hk/server/services/common/had_rcd_1635393119641_62162/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=csdi:BFFCHCC&outputFormat=geojson&srsName=EPSG:4326；另下載中／英 CSV 取「地區」欄及交叉核對
- 數據字典：https://www.had.gov.hk/datagovhk/dataspec/en/dataspec_barrier_free_facilities_in_community_halls_community_centres_en.pdf
- 更新頻率：As and when necessary
- 數據集元數據最後更新（CKAN metadata_modified）：2023-02-13；記錄 LastUpdate 最新 2025-08-13；CSV HTTP Last-Modified：Tue, 04 Aug 2026 09:52:29 GMT
- 下載日期：2026-10-28 11:08 UTC
- 原始記錄：WFS 119 個場地（CSV 119 行）；只收錄 WFS「暢通易達洗手間 = Yes」：116 個；不收錄（官方為 No）：青嶼幹線訪客中心及觀景台、鴨脷洲社區會堂、西區社區中心
- WFS 與 CSV 不一致（以有座標的 WFS 為準，不作推測）：機場核心計劃展覽中心：WFS 有、CSV 無同名場地；西樓角花園多功能活動中心：WFS 有、CSV 無同名場地；鴨脷洲社區會堂：WFS 暢通易達洗手間 = No，CSV = *（以 WFS 為準）；長洲社區會堂：CSV 有、WFS 無同名場地（無座標，不收錄）；西樓角花園多功能活動室：CSV 有、WFS 無同名場地（無座標，不收錄）
- **座標為所在建築位置，非洗手間本身**；官方無開放時間欄位，界面顯示「官方數據未提供」
- 授權／條款：DATA.GOV.HK 使用條款 https://data.gov.hk/tc/terms-and-conditions（容許免費作商業及非商業用途，須註明來源並鳴謝政府及相關機構）
<!-- /had -->

## 官方數據未提供的欄位
無障礙設施、嬰兒護理間、男/女/通用廁格數目、清潔時間 — 兩個廁所數據集均無此類欄位（育嬰間另見上面衞生署數據集，以獨立類別顯示，不當作廁所設施），界面顯示「官方數據未提供」。

## 已知數據問題
- FEHD 所有「長期擺放的流動廁所」的 districtID 均為 CW（中西區），但座標遍佈全港（例如柴灣），故界面不採用其地區，改標「流動廁所（官方數據未有正確分區）」；原始代碼保留在 district_code_official。

## 未採用
- CSDI 空間數據共享平台圖層（FEHD：fehd_rcd_1629969687926_30590；AFCD：afcd_rcd_1635136427551_29173）與上述檔案屬同一數據，MVP 未另行使用。
