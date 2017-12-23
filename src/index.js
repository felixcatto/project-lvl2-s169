import yaml from 'js-yaml';
import ini from 'ini';
import fs from 'fs';
import _ from 'lodash';


const formatToParser = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  ini: ini.parse,
};
export const supportedFormats = ['yml', 'json', 'ini'];
export const defaultFormat = 'json';
export const getFileContent = path => fs.readFileSync(path).toString();

const makeAst = (objBefore, objAfter) => {
  const hasNestedData = (obj, key) => typeof obj[key] === 'object';
  const iter = (before, after, nestedLvl) => {
    const beforeKeys = Object.keys(before);
    const afterKeys = Object.keys(after);
    const unionKeys = _.union(beforeKeys, afterKeys).sort();
    return unionKeys.reduce((acc, key) => {
      if (beforeKeys.includes(key) && !afterKeys.includes(key)) {
        return [...acc, {
          key,
          oldValue: before[key],
          newValue: null,
          type: 'deleted',
          lvl: nestedLvl,
          children: [],
        }];
      } else if (!beforeKeys.includes(key) && afterKeys.includes(key)) {
        return [...acc, {
          key,
          oldValue: null,
          newValue: after[key],
          type: 'added',
          lvl: nestedLvl,
          children: [],
        }];
      } else if (hasNestedData(before, key) && hasNestedData(after, key)) {
        const children = iter(before[key], after[key], nestedLvl + 1);
        return [...acc, {
          key,
          oldValue: null,
          newValue: null,
          type: 'nested',
          lvl: nestedLvl,
          children,
        }];
      } else if (before[key] !== after[key]) {
        return [...acc, {
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'modified',
          lvl: nestedLvl,
          children: [],
        }];
      } else if (before[key] === after[key]) {
        return [...acc, {
          key,
          oldValue: before[key],
          newValue: after[key],
          type: 'not-modified',
          lvl: nestedLvl,
          children: [],
        }];
      }
      throw new Error('impossible case');
    }, []);
  };
  return iter(objBefore, objAfter, 1);
};

const render = (ast) => {
  const defaultPadding = '  ';
  const isObject = value => typeof value === 'object';
  const dataToString = (key, value, padding, modifier) => {
    if (isObject(value)) {
      const start = `${padding}${modifier}${key}: {\n`;
      const end = `${padding}${defaultPadding}}\n`;
      const rows = Object.keys(value).map((innerKey) => {
        const innerValue = value[innerKey];
        const innerPadding = `${padding}${defaultPadding.repeat(2)}`;
        if (isObject(innerValue)) {
          return dataToString(innerKey, innerValue, innerPadding, defaultPadding);
        }
        return `${innerPadding}${defaultPadding}${innerKey}: ${innerValue}\n`;
      });
      return `${start}${rows.join('')}${end}`;
    }
    return `${padding}${modifier}${key}: ${value}\n`;
  };
  const makeString = (acc, row) => {
    const {
      key,
      type,
      newValue,
      oldValue,
      lvl,
      children,
    } = row;
    const padding = defaultPadding.repeat((lvl * 2) - 1);
    if (type === 'added') {
      return `${acc}${dataToString(key, newValue, padding, '+ ')}`;
    } else if (type === 'deleted') {
      return `${acc}${dataToString(key, oldValue, padding, '- ')}`;
    } else if (type === 'modified') {
      const oldString = dataToString(key, oldValue, padding, '- ');
      const newString = dataToString(key, newValue, padding, '+ ');
      return `${acc}${oldString}${newString}`;
    } else if (type === 'not-modified') {
      return `${acc}${dataToString(key, oldValue, padding, '  ')}`;
    } else if (type === 'nested') {
      const start = `${padding}${defaultPadding}${key}: {\n`;
      const innerRows = children
        .map(innerRow => makeString('', innerRow))
        .join('');
      const end = `${padding}${defaultPadding}}\n`;
      return `${acc}${start}${innerRows}${end}`;
    }
    throw new Error('impossible case');
  };
  const rows = ast
    .map(row => makeString('', row))
    .join('');
  return `{\n${rows}}\n`;
};

export const gendiff = (path1, path2, format) => {
  const data1 = getFileContent(path1);
  const data2 = getFileContent(path2);
  const parse = formatToParser[format];
  const ast = makeAst(parse(data1), parse(data2));
  return render(ast);
};
