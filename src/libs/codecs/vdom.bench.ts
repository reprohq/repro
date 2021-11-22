import {
  encodeVDocType,
  encodeVDocument,
  encodeVElement,
  encodeVText,
  encodeVTree,
} from '@/libs/codecs/vdom'
import { approxByteLength } from '@/libs/record/buffer-utils'
import { stress } from '@/utils/bench'
import {
  documentNode,
  docTypeNode,
  elementNode,
  textNode,
  vtree,
} from './fixtures/vdom'
// @ts-ignore
import vtree_big from './fixtures/vtree-big.json'

console.table({
  VDocument: {
    raw: approxByteLength(documentNode),
    binary: approxByteLength(encodeVDocument(documentNode)),
    perf_encode: stress(() => encodeVDocument(documentNode)),
  },

  VDocType: {
    raw: approxByteLength(docTypeNode),
    binary: approxByteLength(encodeVDocType(docTypeNode)),
    perf_encode: stress(() => encodeVDocType(docTypeNode)),
  },

  VElement: {
    raw: approxByteLength(elementNode),
    binary: approxByteLength(encodeVElement(elementNode)),
    perf_encode: stress(() => encodeVElement(elementNode)),
  },

  VText: {
    raw: approxByteLength(textNode),
    binary: approxByteLength(encodeVText(textNode)),
    perf_encode: stress(() => encodeVText(textNode)),
  },

  VTree: {
    raw: approxByteLength(vtree),
    binary: approxByteLength(encodeVTree(vtree)),
    perf_encode: stress(() => encodeVTree(vtree)),
  },

  VTreeFull: {
    raw: approxByteLength(vtree_big),
    binary: approxByteLength(encodeVTree(vtree_big)),
    // Too slow to run in benchmarks :(
    // 'perf_encode': stress(() => encodeVTree(vtree_big)),
  },
})
