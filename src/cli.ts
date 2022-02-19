#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { cwd, exit } from "process";
import { Config, parse } from "./parser.js";

const program = new Command();

program
  .name('string-util')
  .description('CLI to some JavaScript string utilities')
  .version('0.8.0');

program
  .command('build')
  .description('build.desc')
  .option('--config <file>', 'separator character', './katalog.json')
  .option('--output <folder>', 'display just the first substring', 'output/')
  .action((args) => {
      const config: Config = JSON.parse(readFileSync(join(cwd(), args.config), 'utf8'));
      try {
          parse(config, args.output);
          console.log('✅ Generated Pages');
      } catch (error) {
          exit(1);
      }
  });

program.parse();