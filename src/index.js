import fs from 'fs';
import _ from 'lodash';
import Tree from './tree';


const formatToParser = {
  json: JSON.parse,
};
export const supportedFormats = ['yml', 'json', 'ini'];
export const defaultFormat = 'json';
export const getFileContent = path => fs.readFileSync(path).toString();

const makeAst = (objBefore, objAfter) => {
  const iter = (tree, parentsKeys, before, after) => {
    const beforeKeys = Object.keys(before);
    const afterKeys = Object.keys(after);
    const unionKeys = _.union(beforeKeys, afterKeys).sort();
    return unionKeys.reduce((acc, key) => {
      if (beforeKeys.includes(key) && !afterKeys.includes(key)) {
        return acc.addChild(parentsKeys, key, {
          key,
          oldValue: before[key],
          newValue: null,
          type: 'deleted',
        });
      } else if (!beforeKeys.includes(key) && afterKeys.includes(key)) {
        return acc.addChild(parentsKeys, key, {
          key,
          oldValue: null,
          newValue: after[key],
          type: 'added',
        });
      } else if (before[key] !== after[key]) {
        return acc.addChild(parentsKeys, key, {
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'modified',
        });
      } else if (before[key] === after[key]) {
        return acc.addChild(parentsKeys, key, {
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'not-modified',
        });
      }
      throw new Error('impossible case');
    }, tree);
  };
  return iter(new Tree('root', null), ['root'], objBefore, objAfter);
};

const render = (ast) => {
  const iter = (acc, tree) => {
    const data = tree.getData();
    if (tree.isRoot()) {
      return tree.getChildren()
        .map(child => iter('', child))
        .join('');
    }
    const {
      key,
      type,
      newValue,
      oldValue,
    } = data;
    if (type === 'added') {
      return `  + ${key}: ${newValue}\n`;
    } else if (type === 'deleted') {
      return `  - ${key}: ${oldValue}\n`;
    } else if (type === 'modified') {
      return `  - ${key}: ${oldValue}\n  + ${key}: ${newValue}\n`;
    } else if (type === 'not-modified') {
      return `    ${key}: ${newValue}\n`;
    }
    throw new Error('impossible case');
  };
  const rows = iter('', ast);
  return `{\n${rows}}\n`;
};

export const gendiff = (path1, path2, format) => {
  const data1 = getFileContent(path1);
  const data2 = getFileContent(path2);
  const parse = formatToParser[format];
  const ast = makeAst(parse(data1), parse(data2));
  return render(ast);
};
