import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { emptyDirSync, copySync, copy } from "fs-extra";
import { dirname, join } from "path";
import { cwd, exit } from "process";
import { Liquid } from 'liquidjs';
import { preview_plugin } from "./preview";
import MarkdownIt from "markdown-it";

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

const engine = new Liquid();
const md = new MarkdownIt({
    html: true
});
md.use(preview_plugin);

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
    copyAssets(config.stylesheets, outputDir);
    console.log('✅ Copied Assets');
    const index = readFileSync(__dirname + '/../templates/index.liquid', 'utf-8');

    const generate = async (page: Page) => {
        if (!page.src || !page.path) {
            throw new Error("config invalid");
        }

        const file = join(cwd(), page.src);
        if (!existsSync(file)) {
            console.error(`${page.src} not found.`);
            exit(1);
        }
        const content = md.render(readFileSync(file, 'utf-8'));
        const html = engine.parseAndRenderSync(index, {
            title: config.title,
            body: content,
            pages: config.pages,
            currentPage: page.path,
            stylesheets: config.stylesheets
        });
        let target = join(
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
            page.pages.forEach(generate);
            return
        }
        generate(page);
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
