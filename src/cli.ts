#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { cwd, exit } from "process";
import { Config, parse } from "./parser.js";
import { watch } from "chokidar";
import { fileURLToPath } from "url";
// @ts-ignore
import server from "@compodoc/live-server";

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

program
  .command('dev')
  .description('dev.desc')
  .option('--config <file>', 'separator character', './katalog.json')
  .option('--output <folder>', 'display just the first substring', 'output/')
  .action((args) => {
    const config: Config = JSON.parse(readFileSync(join(cwd(), args.config), 'utf8'));
    try {
      parse(config, args.output);
      console.log('✅ Generated Pages');
      const files = [
        join(cwd(), args.config),
        '../templates/index.liquid',
        ...config.stylesheets
      ];
      config.pages.forEach(page => {
        if (page.pages) {
          page.pages.forEach(p => {
            if (p.src) {
              files.push(join(cwd(), p.src));
            }
          })
        }
        if (page.src) {
          files.push(join(cwd(), page.src))
        }
      });

      watch(files, {
        ignoreInitial: true
      }).on('all', () => {
        parse(config, args.output);
        console.log('✅ Generated Pages');
      });

      server.start({
        root: join(cwd(), args.output)
      });
    } catch (error) {
      exit(1);
    }
  });

program.parse();