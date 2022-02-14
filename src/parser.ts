import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import MarkdownIt from "markdown-it";
import { dirname, join } from "path";
import { cwd, exit } from "process";
import { Liquid } from 'liquidjs';

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
    pages: Page[];
};

const engine = new Liquid({

});
const md = new MarkdownIt({
    highlight: (str: string, lang: string, attrs: string) => {
        console.log({ str, lang, attrs });
        console.log('str', str);
        return str;
    }
});
export const parse = async (config: Config) => {
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
        });
        let target = join(
            cwd(),
            'output/',
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
    };

    config.pages.forEach(async (page: Page) => {
        if (page.pages) {
            page.pages.forEach(generate);
            return
        }
        generate(page);
    });
}
