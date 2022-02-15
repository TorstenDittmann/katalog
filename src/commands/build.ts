import { readFileSync } from 'fs';
import { join } from 'path';
import { cwd, exit } from 'process';
import type { Arguments, CommandBuilder } from 'yargs';
import { Config, parse } from '../parser';

type Options = {
    config: string;
    output: string;
};

export const command: string = 'build';
export const desc: string = 'Greet <name> with Hello';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            config: { type: 'string', default: './katalog.json' },
            output: { type: 'string', default: 'output/' },
        });

export const handler = (argv: Arguments<Options>): void => {
    const config: Config = JSON.parse(readFileSync(join(cwd(), argv.config), 'utf8'));
    try {
        parse(config, argv.output);
    } catch (error) {
        exit(1);
    }
};