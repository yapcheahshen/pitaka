import {readTextFile} from '../platform/inputfiles.js'
import { getFormat } from './format.js';
import TypeDef from './typedef.js'
import { LOCATORSEP } from '../platform/constants.js';
import { offtagRegex } from '../offtext/parser.js';
const fileContent=async(fn,format,ctx)=>{
    let c;
    const F=getFormat(format);
    if (typeof fn=='string') {
        if (F.parseFile) c= (await F.parseFile(fn,ctx));
        else            c=(await fs.promises.readFile(fn,'utf8')).replace(/\r?\n/g,'\n');
        if (c.rawcontent) c=c.rawcontent;
        
    } else {
       if (fn.zip) {
            const raw=await fn.zip.files[fn.name].async('string');
            if (F.parseBuffer) c=F.parseBuffer(raw,fn.name,ctx); 
            else              c=raw.replace(/\r?\n/g,'\n');
       } else {
            if (F.parseFile) c = await (F.parseFile(fn,ctx)).rawcontent;
            else            c =(await readTextFile(fn)).replace(/\r?\n/g,'\n');
       }
    }
    const bom=c.charCodeAt(0);
    if (bom===0xfeff || bom==0xffe) c=c.substr(1);
    return c;
}

const readFormatFile=async (f,format)=>{
    const fm=getFormat(format);
    return await fm.parseFile(f);
}

const getZipIndex=async (zip,format,fn)=>{
    const fm=getFormat(format);
    if (fm.getZipFileToc) return await fm.getZipFileToc(zip,fn);
    else return {files:zip.files,tocpage:[]};
}
const builtin_typedef={
    'bk':['LabelBook',{resets:'n,c'}],
    'c':'LabelChapter',
    'n':['LabelMilestone',{sequencial:true,range:true}],
    'b':'Label',
    'lang':'LabelLang',    
    'kai':'Label',
    'u':'Label',
    'i':'Label',
    'mu':'LabelMulu',
    't':'LabelTransclusion',
    'k':'LabelLink',
    "f":["Label", {"caption":"注"}],
    "fn":["LabelFootnote", {"caption":"注釋"}],
    //general versioning
    'cut':'Label','paste':'Label','del':'Label','add':'Label','edit':'Label','corr':'Label'
}

const getFormatTypeDef=(config,opts)=>{
    const def=Object.assign(builtin_typedef,config.labels||getFormat(config.format).def);
    if (config.label) { //additional custom label
        const labels=(typeof config.label==='string')?config.label.split(','):config.label;
        for (let i=0;i<labels.length;i++) {
            if (def[labels[i]]) {
                console.error('label already defined',labels[i])
            } else {
                def[labels[i]]="Label";
            }
        }
    }
    return TypeDef( def, {config,...opts});
}

const getFormatLocator=format=>{
    const fm=getFormat(format);
    let locator=fm.locator||'n';
    if (typeof locator==='string') locator=locator.split(LOCATORSEP);
    return locator;
}

const getFormatter=format=>{
    const fm=getFormat(format);
    return fm.Formatter;
}
const translatePointer=(ptr,format)=>{
    const fm=getFormat(format);
    return fm.translatePointer?fm.translatePointer(ptr):ptr;
}

const fileLines=async fn=>{
    const content=await fileContent(fn);
    const lines=content.split('\n');
    return lines;
 }
const getQuickPointerParser=format=>{
    const fm=getFormat(format);
    return fm.parseQuickPointer;
}
const getQuickPointerSyntax=format=>{
    const fm=getFormat(format);
    return fm.QuickPointerSyntax;
}

const removeLabels=(content,labels)=>{
    if (!labels) return content;
    if (typeof labels=='string') labels=labels.split(',');
    labels.forEach(lbl=>{
        const regex=offtagRegex(lbl);
        content=content.replace(regex,'');
    });
    return content;
}
export {readFormatFile, fileContent,translatePointer,getFormatter,getFormat,
fileLines,getZipIndex,getFormatTypeDef,getQuickPointerParser,getQuickPointerSyntax,getFormatLocator,
removeLabels};