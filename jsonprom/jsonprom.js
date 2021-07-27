import {loadJSONP,loadFetch,loadNodeJs} from './loadchunk.js';
import {readLines,prefetchLines} from './readline.js';

class JSONPROM {
    constructor(opts) {
        this.context = {
            accLength:0,
            loadedChunk:[],
        };
        this.header= {
            name:opts.name||'noname',
            lineCount:1,
            chunkStarts:[1],
            sectionNames:['txt'],
            sectionStarts:[1],
        }
        this.opts=opts||{};
        const lines=[''];
        this._lines=lines;
        this._loader=loadNodeJs;
        if (typeof window!=='undefined') {
            const protocol=window.location.protocol;
            if (protocol=='http:' || protocol=='https:') {
                this._loader=loadFetch;
            } else {
                this._loader=loadJSONP;
                this.context.jsonp=true;
            }
        };
        this.readLines=readLines;
        this.prefetchLines=prefetchLines;
        this.getLine=i=>lines[i];
        return this;
    }
    setChunk(chunk,header,payload){
        if (chunk==0) {
            this.header=header;
            this.payload=payload;
            if (this.opts.onReady) {
                this.opts.onReady(this);
            }
        } else {
            for (let i=0;i<payload.length;i++) {
                this._lines[header.start+i]=payload[i];
            }
        }
        this.context.loadedChunk[chunk]=true;
    }
    async load(_chunk=0){
        let res;
        if (!this.context.loadedChunk[_chunk]) {
            res = await this._loader(this.header.name,_chunk,this);
            this.context.loadedChunk[_chunk]=true;
            if (res) this.setChunk(_chunk,res.header,res.payload);
        }        
    }
    getSectionRange(name){
        const {sectionNames,sectionStarts,lineCount}=this.header;
        const i=sectionNames.indexOf(name);
        if (i<0) return;
        const from=sectionStarts[i];
        const to= (i<sectionNames.length-1)?sectionStarts[i+1]:lineCount;
        return [from,to];
    }
    getSection(name) {
        const out=[];
        const [from,to]=this.getSectionRange(name);
        for (let i=from;i<to;i++) out.push(this.getLine(i));
        return out;
    }
    async loadSection(name){
        const [from,to]=this.getSectionRange(name)
        await this.prefetchLines(from,to);
    }
}
export default JSONPROM;