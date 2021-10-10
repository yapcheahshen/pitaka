import LabelDictEntry from '../htll/label-dict-entry.js';
import Label from '../htll/label.js';
import LabelTransclusion from '../htll/label-transclusion.js';
//combine external quote

const CidianTypeDef=function(opts){
    return {
        'e': new LabelDictEntry('e',opts),
        'y': new Label('y',Object.assign({resets:['d','eg','q']},opts)),
        'd': new Label('e',opts),
        'eg': new Label('eg',opts),
        'q': new Label('q',opts),
        't': new LabelTransclusion('t',opts),
        'ref': new Label('ref',opts),
        'en': new Label('en',opts),
    }
};

export default CidianTypeDef;