#!/usr/bin/env node
import program from 'commander';
import { gendiff } from '../';
import { supportedFormats, defaultFormat } from '../renderers';


const supportedRegex = new RegExp(`^(${supportedFormats.join('|')})$`, 'i');
program
  .version('0.1.0')
  .description('Compares two configuration files and shows a difference.')
  .arguments('<firstConfig> <secondConfig>')
  .option('-f, --format <type>', 'Output format', supportedRegex, defaultFormat)
  .action((path1, path2) => {
    const diff = gendiff(path1, path2, program.format);
    console.log(diff);
  })
  .parse(process.argv);
