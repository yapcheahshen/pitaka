# Pitaka

## 結構
一個 籃子 (basket) 由若干個檔構成，包含了內文、輔助連結的資料結構，可能包括全文索引。

每個basket有若干個 名域 namespace ，原則上每個 htm 產生一個名域，
如果htm太大，可分子目錄或拆成小檔，依然是同一個namespace。

每個htm只能有一個　`<htll>` 包住整個檔案，其他的標籤不能跨行。

    big.1.htm big.2.htm big.3.htm  //名域  是 big
    folder/1.htm folder/2.htm folder/3.htm  //名域  是 folder

## 錨點 Anchor
每個名域中的錨點名稱必須唯一。定義錨點方式為  `<a name="ID"/>` 同HTML，在每行的開頭定義，
前方不能有文字，可以定義多個錨點。如：

    <a name="j1"/><h2>素問第一卷</h2>
    <a name="1"/><a name="上古天真論"/><h3>上古天真論篇第一</h3>


錨點的預設格式為  `數字.數字.數字`  ，數字為大於等於0的整數，層級不限。

    1
    1.0   //不行，與 1 等效
    1.0.1  //可以從 零開始
    1.1
    1.1.1
    1.3    //不行，要先有1.2

### 錨點樣版
`＜htll aname="j1">` 定義樣版
多個樣版以 `,` 隔開，如 `number="j1,sn2"`

`j1` 表示`j`之後只能有一個數字。如 `j0` `j1` `j100` ，表示卷號。
`sn2` 表示最多兩級數字，如 `sn1.1` `sn56` `sn56.11` 合法，`sn4.1.4` 不合法。

數字型的儲存效率高，在建basket時會檢查。
如果不是數字，也不符合錨點樣版，則為文字型錨點。

### 文字型錨點
用於詞條，會進行排序及壓縮。查開頭符合最快。

## 位址語法 (兼容HTML)

    同一個basket內，同一個名域
    <a href="#ID">跳到這個ID</a>
    <a href="?p=3#ID">跳到 ID 再跳過3段 ，到第四段開頭</a>
    <a href="?s=tofind#ID">從ID開始尋找字串tofind</a>
    
    到其他名域的某個ID
    <a href="big.1.htm#ID>   // 名域 是big

    到其他籃子 ，必須以 ../htll- 前綴，這樣在未產生籃子之前也可以用瀏覽器測試
    <a href="../htll-cct/lunyu.htm#ID>   //cct 是籃子 , lunyu是名域

## 生成籃子

## 文件進化階段
1. 讀取：多個純文字檔（不限格式）合併成籃子，只能以絕對行號取得內容。
    - 檔頭：版本、總行數、每個jsonp的起始行陣列。

2. 分段：以定義錨點、章節等文件結構。

3. 全文索引。


## 分散式 JSONP
1. 大約每256KB一個js 檔，file:// 也可以隨需讀取
2. 未來再考慮包成單一檔案。
3. 最多分成 999 個檔。檔頭為000.js，其他檔名為 001.js ~ 999.js 
