export const patchBuf=(buf,errata,fn='')=>{
    if (!errata||!errata.length) return buf;
    let outbuf=buf;
    for (let i=0;i<errata.length;i++) {
        const [from,to]=errata[i];
        let n=errata[i][3]||0;
        let occur=errata[i][2]||1;
        let newoutbuf=outbuf;
        if (typeof to==='function'){
            if (typeof from==='string') {
                while (occur>0) {
                    newoutbuf=newoutbuf.replace(from, (m,m1,m2)=>{
                        occur--;
                        return to(m,m1,m2,m3);    
                    });
                    occur--;
                }    
            } else { //regex
                newoutbuf=newoutbuf.replace(from,(m,m1,m2,m3)=>{
                    occur--;
                    return to(m,m1,m2,m3);
                });
            }
        } else {
            if (typeof from==='string') {
                while (occur>0) {
                    let torepl=to.replace(/\$\$/g,n);
                    newoutbuf=newoutbuf.replace(from,torepl);
                    n++;
                    occur--;
                }    
            } else { //regex from , string to
                newoutbuf=newoutbuf.replace(from,(m,m1,m2)=>{
                    let torepl=to.replace(/\$1/g,m1).replace(/\$2/g,m2).replace(/\$\$/g,n);
                    n++;
                    occur--;
                    return torepl;
                })
            }
        }
        if (newoutbuf===outbuf) {
            console.log(fn,"cannot replace",errata[i]);
        }
        outbuf=newoutbuf;
        if (occur!==0) {
            console.log(fn,"errata is not cleared!",occur,'left',errata[i]);
        }
    }

/*
    for (let i=0;i<lines.length;i++) {
        let line=lines[i];
        errata.forEach(err=>{
            if (typeof from==='string' && line.indexOf(from)==-1) return;
            const rline=line.replace(from,to);
            if (rline!==line) {
                err[2]--;
                lines[i]=rline;
                line=rline;
            }
        })
    }
    const residue=errata.filter(err=>err[2]);
    if (residue.length) console.log(fn,"errata is not cleared!",residue);
*/
    return outbuf;
}

export default {patchBuf}