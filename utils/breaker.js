import {OFFTAG_REGEX_G} from "../offtext/def.js"
import { diffChars, diffWords } from "diff";

export const spacify=str=>{ //remove all offtext and non ascii character, for more precise diff
    return str.replace(OFFTAG_REGEX_G,(m,tagname,attr)=>{
        return " ".repeat(tagname.length+(attr?attr.length:0)+1)
    }).replace(/[^a-zA-Z]/g,' ');
}
export const removeHeader=str=>{
    return str.replace(/^(.+)(\^n[\-\d]+)/,(m,rm,n)=>" ".repeat(rm.length)+n)
        .replace(/(\([^\)]+\))/g,(m,m1)=>" ".repeat(m1.length))
}
export const removeVariantBold=str=>{
    return str.replace(/(\^v[^\]]+?\])/g,(m,m1)=>" ".repeat(m1.length))
    .replace(/\^b([^\]]+?)\]/g,"  $1 ");
}
export const breakLine=(str,breaker)=>{
    const substrings=[],breakpos=[];
    let prev=0;
    str.replace(breaker,(m,m1,idx)=>{
        if (prev) breakpos.push(prev);
        substrings.push( str.substring(prev,idx+m1.length) );
        prev=idx+m1.length;
    })
    if (prev<str.length) {
        if (prev) breakpos.push(prev);
        substrings.push(str.substr(prev))
    }
    return {substrings,breakpos};
}
export const autoBreak=(lines,breaker="([?!।॥;–—] +)")=>{
    if (typeof lines==='string') lines=[lines];
    const sentences=[], breakpos=[];
    if (typeof breaker==='string') {
        breaker=new RegExp(breaker,"g");
    }
    for (let i=0;i<lines.length;i++) {
        const res=breakLine(lines[i],breaker);
        sentences.push(...res.substrings);
        breakpos.push(res.breakpos)
    }
    return {sentences,breakpos};
}
export const paragraphSimilarity=(p1,p2)=>{
    const P1=p1.map(l=>l.replace(/ +/g,'').trim()).filter(it=>!!it);
    const P2=p2.map(l=>l.replace(/ +/g,'').trim()).filter(it=>!!it);
    const p1len=P1.reduce( (p,v)=> p+v.length ,0);
    const p2len=P2.reduce( (p,v)=> p+v.length ,0);
    
    const ratio1=P1.map( l=> l.length/p1len||0);
    const ratio2=P2.map( l=> l.length/p2len||0);
    const accdiff=P1.reduce((p,v,i)=> p+=Math.abs(ratio1[i]-ratio2[i])||0,0);
    return accdiff;
}
export const breakSentence=(arr,breakpos,paraprefix='')=>{
    const out=[];
    for (let i=0;i<breakpos.length;i++) {
        const str=arr[i];
        let prev=0;
        let prefix=paraprefix;
        for (let j=0;j<breakpos[i].length;j++) {
            let bp=breakpos[i][j];
            let sub=str.substring(prev,bp);
            out.push( (i?prefix:'')+sub);
            prev=bp;
            prefix='';
        }
        if(prev<str.length-1) {
            out.push( str.substr(prev));
        }
    }
    return out;
}
const SENTENCESEP=String.fromCodePoint(0x2fff);
const SENTENCESEP1=String.fromCodePoint(0x2ffe);
export const diffBreak=(p1,p2)=>{ //p1 cs(larger unit), p2(smaller unit)
    let out=[];
    const breakpos=[],s1=p1.join(SENTENCESEP1), s2=p2.join(SENTENCESEP);
    const D=diffChars(s1,s2);
    let p2off=0, 
        leadspace=true; //combine leading space (probably offtext, ^sz ,etc to same line, see dn1.498)
    for (let i=0;i<D.length;i++) {
        const d=D[i];
        const trimd=d.value.trim();

        if ( trimd && trimd!==SENTENCESEP && trimd!==SENTENCESEP1) leadspace=false;
        if (d.value.trim()===SENTENCESEP && p2off>-1 && !leadspace) out.push(p2off); 
        else{
            let at=d.value.indexOf(SENTENCESEP);
            while (at>-1) {
                if (p2off >-1 && !leadspace) out.push(p2off+at);
                at=d.value.indexOf(SENTENCESEP,at+1);
            }
            at=d.value.lastIndexOf(SENTENCESEP1);
            if (at>-1){ //如果at>0，則還給上一行 ( 參見 dn1.272 行尾的校注)
                breakpos.push(out.filter(it=>!!it));
                if (out.length) out[out.length-1]+=at;
                out=[];
                p2off=-d.value.length;
                at=d.value.indexOf(SENTENCESEP1,at+1);
                leadspace=true;
            }
        }
        if ((!d.removed&&!d.added) || d.removed) p2off+=d.value.length;
    }
    if (breakpos.length<p1.length) breakpos.push(out.filter(it=>!!it));
    // console.log(breakpos)
    return breakpos;
}
//ensure arrary length
export const ensureArrayLength=(arr,length,marker='※')=>{
    if (length>arr.length) {
        while (length>arr.length) {
            arr.push(marker);
        }
    } else if (length<arr.length) {
        while (arr.length && length<arr.length) {
            const last=arr.pop();
            arr[arr.length-1]+=marker+last;
        }
    }
    return arr;
}
//find out shorted lead to reach pos
const MAXWIDTH=5;
const shortestLead= (line,pos,from)=>{
    let lead,at,width=2;//try from 2 chars, up to MAXWIDTH
    while (at!==pos) {
        lead=line.substr(pos,width);
        at=line.indexOf(lead,from);
        if (at==-1) {
            throw "cannot find lead at "+pos+'lead '+lead;
        }
        if (at===pos) return lead;
        const ch=line.charAt(pos+width);
        if (width>MAXWIDTH || ch===',' || ch==='^') { //try occur
            let occur=0;
            while (at!==pos) {
                at=line.indexOf(lead,at+1);
                occur++;
            }
            lead+='+'+occur;
            break;
        } else {
            width++;
        }
    }
    return lead;
}
/* convert sentence break of a paragraph to hooks, output one line per paragraph , separated by tab */
export const hookFromParaLines=paralines=>{
    let bp=[],breakpos=[],out=[];
    let p=0;
    for (let i=0;i<paralines.length;i++) {
        const l=paralines[i];
        if (l.substr(0,3)==='^n ') {
            breakpos.push(bp);
            bp=[];
            p=0;
        } else {
            if (p) bp.push(p);
        }
        p+=l.length;
    }
    breakpos.push(bp);
    const orilines=paralines.join('').replace(/\^n /g,'\n^n ').split('\n');

    for (let i=0;i<orilines.length;i++) {
        let from=0,leads=[];
        for (let j=0;j<breakpos[i].length;j++) {
            const leadword=shortestLead(orilines[i],breakpos[i][j], from );
            from=breakpos[i][j]+1;
            leads.push(leadword);
        }
        out.push(leads)
    }
    return out;
}
export const breakByHook=(line,hooks,id)=>{ //break a line by hook
    let prev=0,out=[];
    // if (id=='dn1.159') debugger
    for (let i=0;i<hooks.length;i++){
        let occur=0,at=0,hook=hooks[i];
        if (!hook) { //just insert a blank line
            out.push('')
            continue;
        }
        const m=hook.match(/\+(\d)$/);
        if (m) {
            occur=parseInt(m[1]);
            hook=hook.substr(0,hook.length-m[0].length);
        }
        at=line.indexOf(hook,prev+1);
        while (occur>0) {
            at=line.indexOf(hook,at+1);
            occur--;
        }
        if (at==-1) {
            console.log('hook error',id,'hook',hook);
            at=prev;
        }
        out.push(line.substring(prev,at));
        prev=at;
    }

    if (prev<line.length) out.push(line.substring(prev))
    return out;
}

export default {spacify,removeHeader,removeVariantBold,
    autoBreak,paragraphSimilarity,diffBreak,breakSentence,ensureArrayLength,
    hookFromParaLines, breakByHook}