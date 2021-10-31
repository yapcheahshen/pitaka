/* algorithm from https://github.com/hermanschaaf/jieba-js */
let min_freq = 0 ;//freq 是小於1對數，一定是負值
import {bsearch} from '../utils/bsearch.js';
let sentanceDAG = function(sentence,dict) { // 產生句子的 DAG 
    let N = sentence.length, DAG = {},
        i = 0, j = 0, s='';
        //  p = trie;
    while (i < N) {
        const c = sentence[j];
        const at=bsearch(dict,s+c,true);
        if (at>0) {
            s+=c;
            if ( dict[at]===s ){
                if (!(DAG[i])) DAG[i] = [];
                DAG[i].push(j);
            }
            j += 1;
            if (j >= N) { //終點超過字串，不會再構成詞
                i += 1;
                j = i;
                s = ''
            }
        } else { //構不成詞，試字串的下一個字。
            s = c;
            i += 1;
            j = i;
        }
    }    
    for (i = 0; i < sentence.length; i++) { //對於不存在於字典的每個字視為單字詞
        if (!DAG[i]) DAG[i]=[i];
        else if (DAG[i].indexOf(i)==-1) DAG[i].push(i); //連回自己
    }
    return DAG;
}
//最佳路徑的一部份也必然是該兩點間的最佳路徑
const bestRoute = function( DAG , sentence,dict,dictfreq) { //找尋DAG最短路徑
    let N = sentence.length; //句子長度
    let route=[],//每一個節點的最佳路徑
        idx=0, //目前的出發節點
        bestProb,//從idx出發的最佳概率
        bestEnd; //最大機率到達的終點
    route[N] = [0.0,N]; //終止元素，否則 route[sentence.length] 會出錯

    for (idx = N - 1; idx > -1; idx--) { //從後面開始算起，因為中文句子一般權重往後的較大
        bestProb=-Infinity;   //重設為最小值(保證第一次bestProb一定會被設置)
        for (let xi in DAG[idx]) { //對所有從idx出發的可能路徑
            let end = DAG[idx][xi]; //
            let w=sentence.substring(idx, end+1) ; //此路徑經過的的字，也就是詞
            const at=bsearch(dict,w);
            let wfreq = dictfreq[at] || min_freq ;  //查詞頻，無此詞則視為最小機率
            if (w.length==1) wfreq=1;
            let candidateProb=wfreq + route[end+1][0];//候選概率，概率相乘。(已轉成對數，用加法)
            if (candidateProb>bestProb){ //是否有較佳概率？
                bestProb=candidateProb;  //設為最佳概率
                bestEnd=end;
            }
        }
        route[idx] = [bestProb, bestEnd]; //從idx出發的最佳概率及終端
    }
    return route;
}

export const segmentText = function(sentence,dict,dictfreq) {
    let out = [] ,i=0;
    const DAG = sentanceDAG(sentence,dict);
    const route = bestRoute(DAG, sentence,dict,dictfreq);
    while ( i<route.length){
        let end=route[i][1]+1;
        let s=sentence.substring(i,end);
        if (s) out.push(s);
        i=end;
    }
    return out;
}

