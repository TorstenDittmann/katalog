import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { emptyDirSync, copySync, copy } from "fs-extra";
import { dirname, join } from "path";
import { cwd, exit } from "process";
import { Liquid } from 'liquidjs';
// import { preview_plugin } from "./preview";
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
// import { visit } from 'unist-util-visit'
// import { h } from 'hastscript'
import {read} from 'to-vfile'
import { myRemarkPlugin } from "./preview.js";
import { fileURLToPath } from "url";

export type Page = {
    title: string;
    src?: string;
    path?: string;
    pages?: Page[];
}
export type Config = {
    title: string;
    logoSrc: string;
    theme: object;
    stylesheets: string[];
    pages: Page[];
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const engine = new Liquid();
const md = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(myRemarkPlugin)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeFormat)
    .use(rehypeStringify, {allowDangerousHtml: true});

export const parse = async (config: Config, output: string) => {
    const outputDir = join(
        cwd(),
        output
    );
    console.log('⚙️ Generating your Katalog');
    console.log(`Destination: ${outputDir}`);
    console.log(' ')
    emptyDirSync(outputDir);
    copyRuntime(outputDir);
    console.log('✅ Copied Runtime');
    copyAssets([
        ...config.stylesheets,
        config.logoSrc
    ], outputDir);
    console.log('✅ Copied Assets');
    const index = readFileSync(__dirname + '/../templates/index.liquid', 'utf-8');

    const generate = async (page: Page) => {
        console.log(page.path)
        if (!page.src || !page.path) {
            throw new Error("config invalid");
        }

        const file = join(cwd(), page.src);
        if (!existsSync(file)) {
            console.error(`${page.src} not found.`);
            exit(1);
        }
        const content = await md.process(await read(file));

        const html = engine.parseAndRenderSync(index, {
            ...config,
            body: content.toString(),
            currentPage: page.path
        });
        const target = join(
            outputDir,
            page.path,
            'index.html'
        );

        if (!existsSync(dirname(target))) {
            mkdirSync(dirname(target), {
                recursive: true
            });
        }
        writeFileSync(target, html, {
            encoding: "utf8"
        });
        console.log(`- generated ${file}`);
    };

    config.pages.forEach(async (page: Page) => {
        if (page.pages) {
            page.pages.forEach(async (p) => await generate(p));
            return
        }
        await generate(page);
    });
}
const copyRuntime = (outputDir: string) => {
    copySync(join(__dirname, '../runtime'), join(
        outputDir,
        '_runtime'
    ));
}
const copyAssets = (files: string[], outputDir: string) => {
    files.forEach(file => {
        copy(join(cwd(), file), join(outputDir, '_assets', file))
        console.log(`- copied ${file}`);
    });
}
