import { Root } from "mdast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import {h} from 'hastscript'

export const myRemarkPlugin: Plugin<[], Root> = () => {
    return (tree, file) => {
        visit(tree, (node) => {
            if (
                node.type === 'textDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'containerDirective'
            ) {
                if (node.name !== 'preview') return
                const data = node.data || (node.data = {})
                if (node.type === 'textDirective') file.fail('Text directives for `preview` not supported', node)

                data.hName = 'katalog-preview'
            }
        })
    }
}