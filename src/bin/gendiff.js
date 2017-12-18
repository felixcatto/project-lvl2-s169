#!/usr/bin/env node
import program from 'commander';
import { gendiff, supportedFormats, defaultFormat } from '../';

program
  .version('0.1.0')
  .description('Compares two configuration files and shows a difference.')
  .arguments('<firstConfig> <secondConfig>')
  .option('-f, --format [type]', 'Output format')
  .action((path1, path2) => {
    const format = program.format || defaultFormat;
    if (!supportedFormats.includes(format)) {
      console.log(`${format} is not suppored`);
      return;
    }

    const diff = gendiff(path1, path2, format);
    console.log(diff);
  })
  .parse(process.argv);
