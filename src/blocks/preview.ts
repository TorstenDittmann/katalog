import { Root } from "mdast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import { h } from 'hastscript'

export const previewBlock: Plugin<[], Root> = () => {
    return (tree, file) => {
        visit(tree, (node) => {
            if (
                node.type === 'textDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'containerDirective'
            ) {
                if (node.name !== 'preview') return;
                const data = node.data || (node.data = {});
                const hast = h(node.name, node.attributes);

                if (node.type === 'textDirective') file.fail('Text directives for `preview` not supported', node);
                data.hName = 'katalog-preview';
                data.hProperties = hast.properties;
            }
        })
    }
}