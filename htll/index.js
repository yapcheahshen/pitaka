import {parse,stringify} from './address.js'
import {scanLine,scanTag,fileLines,fileContent,convertLine} from './tagtext.js'
import Label from './label.js'
import LabelPB from './label-pb.js'
import LabelHeader from './label-header.js'
import LabelDictEntry from './label-dict-entry.js'
import LabelBook from './label-book.js'
import LabelChapter from './label-chapter.js'
import LabelSection from './label-section.js'
const LabelType={LabelPB,LabelHeader,
    LabelDictEntry,
    LabelBook,LabelChapter,LabelSection};
export {parse,stringify,Label,LabelType,scanLine,scanTag,convertLine,
    fileLines,fileContent}