import { fromSim } from "lossless-simplified-chinese";
import { parseQuery,plRanges } from "../search/index.js";
export async function fulltextSearch(tofind,opts={}){
    const ptk=this;

    tofind=tofind.slice(0,50);

    const [phrases,postings]=await parseQuery(ptk,tofind,opts);
    let scoredLine=[];
    const allhits=postings.reduce((acc,i)=>i.length+acc ,0 );
    const weights=postings.map( pl=> Math.sqrt(allhits/pl.length) );
    
    const ptr=new Array(postings.length);
    ptr.fill(0);
    const minscore=opts.minscore||0.6;
    const ltp=ptk.inverted.linetokenpos;
    const ltplast=ltp[ltp.length-1];
    const averagelinelen=ltplast/ltp.length;

    if (opts.excerpt) {
        let i=0;
        while (i<ltp.length-1) { //sum up all Postings 
            let rangescore=0,nearest=ltplast;
            const from=ltp[i], to=ltp[i+1];
            for (let j=0;j<postings.length;j++) {
                const pl=postings[j];
                let v=pl[ptr[j]];
                while (v<from&&ptr[j]<pl.length) {
                    ptr[j]++
                    v=pl[ptr[j]];
                }
                if (v>=from&&v<to) {
                    rangescore+=weights[j];
                }
                if (nearest>v) nearest=v;
            }
            //boost single phrase search with linelen, shorter line get higher score
            const boost=postings.length==1?Math.log(averagelinelen/(to-from+1)):1; 
            if (rangescore>=minscore) scoredLine.push([i+1,rangescore*boost]);//y is 1 base
            i++;
            while (nearest>ltp[i+1]) i++;
        }
        scoredLine=scoredLine.sort((a,b)=>b[1]-a[1]);
    }
    const r={ tofind,caption:'內文',postings, scoredLine ,phrases}
    return r;
}
export function registerQueryMethods(){
    const self=this;
    
    this.labels.forEach(label=>{
        if (label.query) self.querymethods[ label.name ]=[ label.query, label];
    });
    this.querymethods['*']=[fulltextSearch,self];
}
export async function runQuery(method,tofind,opts) {
    const [qm,self]=this.querymethods[method];
    let r=await qm.call(self,tofind,opts);
    if (!r.count && tofind!==fromSim(tofind)) {
        r=await qm.call(self,fromSim(tofind),opts);
    }
    return r;
}
export async function runAllQuery(tofind,opts){
    const out=[];
    for (let method in this.querymethods){
        const r=await runQuery.call(this,method,tofind,opts);
        out.push(r);
    }
    return out;
}

export default {registerQueryMethods,runAllQuery,runQuery,fulltextSearch};