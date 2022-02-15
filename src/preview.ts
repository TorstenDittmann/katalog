import { PluginSimple } from "markdown-it";
import { RuleBlock } from "markdown-it/lib/parser_block";
import { RenderRule } from "markdown-it/lib/renderer";

export const preview_plugin: PluginSimple = (md) => {
    const min_markers = 3,
        marker_str = ':',
        name = 'preview',
        marker_char = marker_str.charCodeAt(0),
        marker_len = marker_str.length;

    // Second param may be useful if you decide
    // to increase minimal allowed marker length
    const validate = (params: string): boolean => {
        return params.trim().split(' ', 2)[0] === name;
    }

    const render: RenderRule = (tokens, idx, _options, env, slf) => {
        return slf.renderToken(tokens, idx, _options);
    }
    const container: RuleBlock = (state, startLine, endLine, silent) => {
        var pos, nextLine, marker_count, markup, params, token,
            old_parent, old_line_max,
            auto_closed = false,
            start = state.bMarks[startLine] + state.tShift[startLine],
            max = state.eMarks[startLine];
        if (marker_char !== state.src.charCodeAt(start)) { return false; }

        // Check out the rest of the marker string
        //
        for (pos = start + 1; pos <= max; pos++) {
            if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                break;
            }
        }
        marker_count = Math.floor((pos - start) / marker_len);
        if (marker_count < min_markers) { return false; }
        pos -= (pos - start) % marker_len;

        markup = state.src.slice(start, pos);
        params = state.src.slice(pos, max);
        if (!validate(params)) { return false; }
        // Since start is found, we can report success here in validation mode
        //
        if (silent) { return true; }

        // Search for the end of the block
        //
        nextLine = startLine;

        for (; ;) {
            nextLine++;
            if (nextLine >= endLine) {
                // unclosed block should be autoclosed by end of document.
                // also block seems to be autoclosed by end of parent
                break;
            }

            start = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];

            if (start < max && state.sCount[nextLine] < state.blkIndent) {
                // non-empty line with negative indent should stop the list:
                // - ```
                //  test
                break;
            }

            if (marker_char !== state.src.charCodeAt(start)) { continue; }

            if (state.sCount[nextLine] - state.blkIndent >= 4) {
                // closing fence should be indented less than 4 spaces
                continue;
            }

            for (pos = start + 1; pos <= max; pos++) {
                if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                    break;
                }
            }

            // closing code fence must be at least as long as the opening one
            if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

            // make sure tail has spaces only
            pos -= (pos - start) % marker_len;
            pos = state.skipSpaces(pos);

            if (pos < max) { continue; }

            // found!
            auto_closed = true;
            break;
        }
        old_parent = state.parentType;
        old_line_max = state.lineMax;
        //state.parentType = 'preview';

        // this will prevent lazy continuations from ever going past our end marker
        state.lineMax = nextLine;

        token = state.push('preview_open', 'katalog-preview', 1);
        token.markup = markup;
        token.block = true;
        token.info = params;
        token.map = [startLine, nextLine];
        state.md.block.tokenize(state, startLine + 1, nextLine);

        token = state.push('preview_close', 'katalog-preview', -1);
        token.markup = state.src.slice(start, pos);
        token.block = true;

        token = state.push('preview_open', 'katalog-source', 1);
        token.markup = markup;
        token.block = true;
        token.info = params;

        token.map = [startLine, nextLine];
        state.md.block.tokenize(state, startLine + 1, nextLine);

        token = state.push('preview_close', 'katalog-source', -1);
        token.markup = state.src.slice(start, pos);
        token.block = true;

        state.parentType = old_parent;
        state.lineMax = old_line_max;
        state.line = nextLine + (auto_closed ? 1 : 0);

        return true;
    }

    md.block.ruler.before('fence', 'preview', container);
    md.renderer.rules['preview_open'] = render;
    md.renderer.rules['preview_close'] = render;
};