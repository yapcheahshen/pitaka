﻿# 文件編碼格式的思考
* 只考慮開放格式 (排除  pdf, .doc )

## 名詞界定
* 合式 well-formatted，語法無誤，可成功化為內存形態。
* 失式 ill-formatted       語法有誤，無法化為內存形態。
* 有效  valid，               語義無誤，正確反映了現實。
* 失效 invalid                 valid 的反義
* 源     source               人工直接編輯的源頭文件。
* 染     rendered           自動生成，用戶消費的文件。
* 文素  element            組成文件的各種元素。
* 文人  bookman          以生產文化財為主業的人。包括學者，作家，律師等。級別較高、能影響決策和意識型態的文人稱士，級別較低的稱書生、書僮。
* 碼人  coder                數字化的技術人員。碼人的職業理想是：「吾指使而群工役焉。捨我，眾莫能就一宇。」

## 純文本 （列基文件 Row-Base）
純文本在內存表現為「字符串陣列」 Array of String
優點：
* 編輯工具繁多，直觀。
* 自動化方便  正則表達式
* 最基礎的格式，所有高級結構的交集。
缺點：
* 自由度太高，造成程序歧義。

## 表基文件 (Tabular-Base)
內存表現形態為二維陣列（表格式）。 Two dimensional Array (Tabular) 。
常見的實作是 SQL 、試算表。
優點：
* 技術成熟
* 可嚴格限定數據的格式。
缺點：
* 通常要定制前端介面。對數據製作人員門檻較高。

## 樹基文件 (Tree-base)
這類文件在內存的表現方式是樹。(Tree)
代表格式是 XML , HTML 。
優點：
* 系統通透性最好
缺點：
* 結構複雜文件人工編輯困難
* 語法冗餘較大（標記可能是純文本的數倍）
* 尋訪複雜

## 象基文件 (Object-Base)
內存表現形態為對象 (Object)。代表格式是 JSON。
優點：
* 表現能力(Expressiveness)比樹基更強，更有效描述複雜結構。
* 程序處理友好
缺點：
* 需熟悉相關語法
* 語法冗餘大

## 複合式文件
由於樹基和象基不適於做成單一巨大文件，實作上通常將文件切分成較小單元，然後用表基儲存。
表基系統有很強的排序及搜尋能力，詞目以及須快速查找的文素，抽取成表格的某欄即可。
代表格式有 mediawiki ，每個詞條以 wiki 語法標記（也是樹基），詞條的集合，詞典成為一個表。
Mdict 格式原理類似。

合格文件不一定有效，有效文件必然合格。列基文件的好處是，擷取任意列，皆是合格的。

## 人文與碼人分工

而樹基與象基都必須讀入及剖析整份文件，栽切通常要程序介入，人工編輯很容易造成文件失效，甚至失式。

合式與否，軟件非常容易檢查。有效性的確保，則必須人工介入和判讀。

數字化的重心，在於將文件內容的規律，從文人的腦袋移到電腦。

XML 的有效性是以 Document Type Defination 來描述，對文人極不友好。
當碼人離開專項之後，文人很難將自己對文本的知識納入系統。

在數字世界，碼人掌握了挖掘機及炸藥的技術，而文人決定了方向和目標。
文人沒有碼人配合，舉步艱難，旅程充滿了費勁、笨拙、重覆低效的操作。
而碼人少了文人指引和積極參與，容易陷入新技術的追逐，表面上看起來開發了許多軟件，但由於人文知識無法在其中沉澱，因此大部分的作品也只是過眼雲煙。

文人和碼人的充分協作，必須先推倒[三座數字大山](3mountain.md)。
## 文件編碼
數字化的核心，底層在編碼，上層在數據結構。