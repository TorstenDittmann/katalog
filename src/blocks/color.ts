import { Root } from "mdast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import { h } from 'hastscript'

export const colorBlock: Plugin<[], Root> = () => {
    return (tree, file) => {
        visit(tree, (node) => {
            if (
                node.type === 'textDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'containerDirective'
            ) {
                if (node.name !== 'color') return;
                const data = node.data || (node.data = {});
                const hast = h(node.name, node.attributes);
                if (node.type === 'textDirective') file.fail('Text directives for `preview` not supported', node);
                console.log(hast);
                data.hName = 'katalog-color';
                data.hProperties = hast.properties;
            }
        })
    }
}