import { readFileSync } from 'fs';
import { join } from 'path';
import { cwd, exit } from 'process';
import type { Arguments, CommandBuilder } from 'yargs';
import { Config, parse } from '../parser';

type Options = {
    config: string;
};

export const command: string = 'build';
export const desc: string = 'Greet <name> with Hello';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            config: { type: 'string', default: './katalog.json' },
        });

export const handler = (argv: Arguments<Options>): void => {
    const config: Config = JSON.parse(readFileSync(join(cwd(), argv.config), 'utf8'));
    try {
        parse(config);
    } catch (error) {
        exit(1);
    }
};