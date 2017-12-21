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
  const treeRoot = new Tree({});
  const iter = (tree, before, after) => {
    const beforeKeys = Object.keys(before);
    const afterKeys = Object.keys(after);
    const unionKeys = _.union(beforeKeys, afterKeys).sort();
    unionKeys.forEach((key) => {
      if (beforeKeys.includes(key) && !afterKeys.includes(key)) {
        tree.addChild({
          key,
          oldValue: before[key],
          newValue: null,
          type: 'deleted',
        });
      } else if (!beforeKeys.includes(key) && afterKeys.includes(key)) {
        tree.addChild({
          key,
          oldValue: null,
          newValue: after[key],
          type: 'added',
        });
      } else if (before[key] !== after[key]) {
        tree.addChild({
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'modified',
        });
      } else if (before[key] === after[key]) {
        tree.addChild({
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'not-modified',
        });
      } else {
        throw new Error('impossible case');
      }
    });
    return tree;
  };

  return iter(treeRoot, objBefore, objAfter);
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

export const gendiff = (path1, path2, format = defaultFormat) => {
  const data1 = getFileContent(path1);
  const data2 = getFileContent(path2);
  const parse = formatToParser[format];
  const ast = makeAst(parse(data1), parse(data2));
  return render(ast);
};
