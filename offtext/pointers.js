//unpack array of serialized pointer
import pool from '../basket/pool.js';
import {PATHSEP,DELTASEP,LOCATORSEP} from '../platform/constants.js'
import {makeHook, parseHook} from './hook.js';
import {parseOfftextLine} from './parser.js';

export const stringifyAddress=attrs=>{
    const out=[];
    out.push(attrs.basket||'');
    if (attrs.loc)out.push(attrs.loc||'');
    for (let key in attrs ) {
        if (key!=='loc' && key!=='basket' && attrs[key]) {
            out.push(key+'='+attrs[key]);
        }
    }
    return out.join(PATHSEP);
}

/*
   loc                   loc only , no PATHSEP, local
   db/loc                2 items, second item has no = , external
   loc/dy=0              2 items, second items has =
   db/loc/dy=0/other=xx/other=yy  , more than 2 items , external
   loc/dy=0/other=x
*/
export const parseAddress=str=>{
    if (!str) return null; 
    const res={basket:'',loc:'', locator:[], dy:0, attrs:{} }; //dy must follow loc
    const arr=str.split(PATHSEP);
    if (arr.length===1) {
        res.loc=arr.shift();
    } else if (arr.length===2) {
        if (arr[1].indexOf('=')>-1) { //no basket
            basket=arr.shift();
        }
        res.loc=arr.shift();
    }
    //just in case
    res.basket=res.basket.replace(/=.+/,'');
    res.loc=res.loc.replace(/=.+/,'');
    res.locator=res.loc.split(LOCATORSEP);
    arr.forEach( (item,idx) =>{
        const at=it.indexOf('=');
        if (at>0) {
            const key=item.substr(0,at);
            const value=item.substr(at+1);
            res[key]=(key==='dy')?parseInt(value)||0: value;
        } else {
            res.attrs[idx]=item;
        }
    })
    return res;
}
/*
export const parsePointer=str=>{
    if (!str) return {};
    const res={basket:'',loc:'',dy:0,loc:''};
    const pths=str.split(PATHSEP);
    if (str[0]!=='/') {
        res.basket=pths.shift();
        // res.basket=pths.shift();
    }
    
    res.loc=pths.shift();
    if (!pths.length) return res;

    pths.forEach(pth=>{
        const at=pth.indexOf('=');
        if (at>0) {
            res[pth.substr(0,at)]=pth.substr(at+1);
        }
    })
    if (res.dy) res.dy=parseInt(dy)||0;
    return res;

    // res.dy=parseInt(dy)||0;

    // let loc,dy,dy2;//缺少idarr 時會有dy2，如  :0:7  表示第0卷第7行
    
    
    if (res.bk.indexOf(DELTASEP)>0) { //only one level, no chunk
        [bk,dy]=res.bk.split(DELTASEP);
        res.bk=bk;
    } else {
        [c,dy,dy2]=pths.shift().split(DELTASEP);
        if (c=='') { // leading DELTASEP
            c=c+DELTASEP+dy;
            dy=dy2;
        }
    }
    // res.c=c;
    // res.hook=pths.join(PATHSEP);
    // res.loc=res.bk+PATHSEP+res.c;
}
*/
export const dereferencing=async (arr,ptk=null)=>{
    if (typeof arr=='string') arr=[arr];
    const out=[],jobs=[];
    for (let i=0;i<arr.length;i++) {
        const ptr={ptk:null, p:'',h:null};
        if (ptk) ptr.ptk=pool.get(ptk.name);
        const pths=arr[i].split(LOCATORSEP);
        if (arr[i][0]!==LOCATORSEP) {
            pths.shift(); //drop leading PATHSEP
            ptk=pool.get(pths.shift());
            ptr.ptk=ptk.name;
        }

        const addr=pths.join(PATHSEP);
        const [from,to]=ptk.getPageRange(addr);

        // const thetree=(ptk.header.locator||DEFAULT_LOCATOR).split(LOCATORSEP);
        // const branches=[];

        // parseAddress()
        // for (let j=0;j<thetree.length;j++) {
        //     let pth=pths.shift();
        //     const m=pth.lastIndexOf(DELTASEP);
        //     let delta=m>-1?parseInt(pth.substr(m+1)):0;
        //     if (m>-1 && !isNaN(delta) ) {
        //         pth=pth.substr(0,m);
        //     }
        //     branches.push({lbl:thetree[j], id:pth , dy:delta});
        //     ptr.p += (ptr.p?PATHSEP:'')+ pth+(delta?DELTASEP+delta:'');
        
        // }
        // const [from,to]=ptk.narrowDown(branches);
        // ptr.b=branches;
        // ptr.y=from-branches[branches.length-1].dy; //starting of the chunk
        const chunks=ptk.unreadyChunk(from,to)
        if (chunks.length) jobs.push( ptk.prefetchChunks(chunks));
        out.push([ptr, pths, from, to]);
    }
    await Promise.all(jobs);    //text is ready

    for (let i=0;i<out.length;i++) {
        const [ptr,pths, y, to]=out[i];
        const linetext= ptr.ptk.getLine(y);
        ptr.next=to;
        ptr.h=parseHook(pths,linetext,y);
    }

    return out.map(i=>i[0]);
}

export const serializePointer=obj=>{
    let ptk=obj.ptk;
    if (!ptk && typeof obj.basket=='string') ptk=pool.get(obj.basket);
    let s=ptk.name+PATHSEP+obj.loc+ (obj.dy?PATHSEP+'dy='+obj.dy:'');

    for (let key in obj) {
        if (key=='basket' || key=='ptk' || key=='loc' || key=='dy') continue;
        s+= PATHSEP+ key+'='+obj[key];
    }
    return s;
}

//serialize array of pointers
export const referencing=async (arr, ptk=null)=>{
    if (!Array.isArray(arr)) arr=[arr];
    const jobs=[];
    const pointers=[];
    let from,to;
    
    for (let i=0;i<arr.length;i++) {
        let {p,x,y,w,hook}=arr[i];
        if (hook) { y=hook.y;x=hook.x;w=hoo.w; }

        if (p) {
            if (p[0]==PATHSEP) {
                const pths=p.split(PATHSEP);
                pths.shift();
                ptk=pool.get(pths.shift());
                p=pths.join(PATHSEP)
            }
            [from,to]=ptk.getPage(p);
            y=from;
        } else {
            if (!y) y=0;
            p=ptk.locOf(y||0);
        }
        const unready=ptk.unreadyChunk(from,to-from);

        if (unready.length) jobs.push(ptk.prefetchChunks( unready));
        pointers.push({p,y, x, w ,t:'',k:''});
    }
    jobs.length && await Promise.all(jobs);

    for (let i=0;i<pointers.length;i++) {
        const ptr=pointers[i];
        const linetext=ptk.getLine(ptr.y);

        const [text]=parseOfftextLine(linetext);
        if (ptr.w==-1) ptr.w=text.length-ptr.x;

        ptr.t=text.substr(ptr.x,ptr.w);
        ptr.k=makeHook(text,ptr.x,ptr.w);
    }

    //convert to hook
    // return pointers;
    return pointers.map(({p,k})=>p+PATHSEP+k);
}
