
const hasWildcard=s=>{
    return s.indexOf('?')>-1||s.indexOf('[')>-1||s.indexOf('*')>-1||s.indexOf('$')>-1||s.indexOf('{')>-1;
}
export const isSimpleRegEx=s=>!!s.match(/[\{\}\*\+\^\$\[\]\.\?\\]/); //regex string without ( )

export const glob=(files,filepat)=>{
    if (typeof files=='string') {
        files=fs.readdirSync(files);
    }
    let start,end;
    if (!filepat) return files;
    const m=filepat.match(/\{(\d+)\-(\d+)\}/);
    if (m) {
        start=parseInt(m[1]);
        end=parseInt(m[2]);
        filepat=filepat.replace(/\{\d+\-\d+\}/,'(\\d+)');
    }
    const pat=filepat.replace(/\*/g,'[^\\.]+').replace(/\./g,'\\.').replace(/\?/g,'.');

    const reg=new RegExp(pat);

    if (start && end) {
        return files.filter(f=>{
            const m= f.match(reg);
            return m&& (parseInt(m[1])>=start && parseInt(m[1])<=end) ;
        })
    } else {
        return files.filter(f=>f.match(reg));
    }
}
const expandWildcard=(folder,pat,isDir)=>{
    let files=[];
    if (hasWildcard(pat)) {
        const folderfiles=fs.readdirSync(folder);
        files=glob(folderfiles,pat);
    } else if (fs.existsSync(folder+pat)){
        files=[pat];
    }
    if (isDir) files=files.filter(fn=>fs.statSync(folder+fn).isDirectory())
    return files;
}
export function filesFromPattern(pat,rootdir=''){
    const outfiles={};
    const patterns=(typeof pat==='string')?pat.split(/[;,]/):pat;
    if (rootdir&&rootdir.slice(rootdir.length-1)!=='/') rootdir+='/';

    patterns.forEach(pat=>{
        const at=pat.lastIndexOf('/');
        let dir='';
        let subfolders=[''];
        if (at>-1) {
            dir=pat.slice(0,at);
            pat=pat.slice(at+1);
            subfolders=expandWildcard(rootdir,dir,true);
        } else {
            subfolders=['']
        }
        
        subfolders.forEach(subfolder=>{
            const files=expandWildcard(rootdir+subfolder,pat);
            files.forEach(f=>{
                outfiles[(subfolder?subfolder+'/':'')+f]=true;
            })    
        })
    });
    const out=[];
    for (let fn in outfiles){
        if (fs.statSync(rootdir+fn).isDirectory()) {
            const files=fs.readdirSync(rootdir+fn).map(f=>fn+'/'+f);
            out.push(...files);
        } else {
            out.push(fn);
        }
    }
    return out;
}

export const isIAST=w=>{
    const m=w.match(/([a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+)/);
    return (m && m[1].length==w.length);
}
export default {glob,filesFromPattern,isIAST,isSimpleRegEx}