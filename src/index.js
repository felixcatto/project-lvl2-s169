import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { getRenderer, defaultFormat } from './renderers';
import getParser from './parsers';


export const getFileContent = filepath => fs.readFileSync(filepath).toString();

const makeAst = (objBefore, objAfter) => {
  const hasNestedData = (obj, key) => typeof obj[key] === 'object';
  const iter = (before, after, nestedLvl) => {
    const beforeKeys = Object.keys(before);
    const afterKeys = Object.keys(after);
    const unionKeys = _.union(beforeKeys, afterKeys).sort();
    return unionKeys.map((key) => {
      if (beforeKeys.includes(key) && !afterKeys.includes(key)) {
        return {
          key,
          oldValue: before[key],
          type: 'deleted',
          lvl: nestedLvl,
          children: [],
        };
      } else if (!beforeKeys.includes(key) && afterKeys.includes(key)) {
        return {
          key,
          newValue: after[key],
          type: 'added',
          lvl: nestedLvl,
          children: [],
        };
      } else if (hasNestedData(before, key) && hasNestedData(after, key)) {
        const children = iter(before[key], after[key], nestedLvl + 1);
        return {
          key,
          type: 'nested',
          lvl: nestedLvl,
          children,
        };
      } else if (before[key] !== after[key]) {
        return {
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'modified',
          lvl: nestedLvl,
          children: [],
        };
      } else if (before[key] === after[key]) {
        return {
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'not-modified',
          lvl: nestedLvl,
          children: [],
        };
      }
      throw new Error('impossible case');
    });
  };
  return iter(objBefore, objAfter, 1);
};

export const gendiff = (path1, path2, format = defaultFormat) => {
  const extension = path.extname(path1).slice(1);
  const render = getRenderer(format);
  const parse = getParser(extension);
  const data1 = getFileContent(path1);
  const data2 = getFileContent(path2);
  const ast = makeAst(parse(data1), parse(data2));
  return render(ast);
};
