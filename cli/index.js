export * from "./build.js"
import {glob} from '../utils/pattern.js'
import {patchBuf} from '../utils/errata.js'
import nodefs from '../platform/nodefs.js' // "await nodefs" at begining of cli script
import kluer from "./kluer.js"

const writeChanged=(fn,buf,enc='utf8')=>{ //write to fn only if changed
    const oldbuf=fs.existsSync(fn) && fs.readFileSync(fn,enc);
    if (oldbuf!==buf) {
        fs.writeFileSync(fn,buf,enc);
        return true;
    }
}


export {kluer,glob,patchBuf,nodefs,writeChanged};