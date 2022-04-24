import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify';
import fsExtra from "fs-extra";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { cwd, exit } from "process";
import { Liquid } from 'liquidjs';
import { unified } from 'unified'
import { read } from 'to-vfile'
import { previewBlock } from "./blocks/preview.js";
import { fileURLToPath } from "url";
const { emptyDirSync, copySync, copy } = fsExtra;
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
    .use(previewBlock)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true });

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
            currentPage: page,
            nextPage: nextPage(page, config.pages),
            prevPage: prevPage(page, config.pages)
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
const normalizePages = (pages: Page[]): Page[] => pages.map(p => p.pages ? p.pages : p).flat();
const nextPage = (page: Page, pages: Page[]): Page | undefined => {
    const normalizedPages = normalizePages(pages);
    const nextIndex = normalizedPages.findIndex(p => p.path && p.path === page.path) + 1;

    if (nextIndex === 0) {
        throw new Error("Error");
    } else if (nextIndex >= normalizedPages.length) {
        return undefined;
    }
    return normalizedPages[nextIndex];
}
const prevPage = (page: Page, pages: Page[]): Page | undefined => {
    const normalizedPages = normalizePages(pages);
    const prevIndex = normalizedPages.findIndex(p => p.path && p.path === page.path) - 1;

    if (prevIndex === -2) {
        throw new Error("Error");
    } else if (prevIndex === -1) {
        return undefined;
    }
    return normalizedPages[prevIndex];
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
