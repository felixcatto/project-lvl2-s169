import yaml from 'js-yaml';
import ini from 'ini';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';


const extensionToParser = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  ini: ini.parse,
};

export const supportedFormats = ['object', 'plain'];
export const defaultFormat = 'object';
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
          newValue: null,
          type: 'deleted',
          lvl: nestedLvl,
          children: [],
        };
      } else if (!beforeKeys.includes(key) && afterKeys.includes(key)) {
        return {
          key,
          oldValue: null,
          newValue: after[key],
          type: 'added',
          lvl: nestedLvl,
          children: [],
        };
      } else if (hasNestedData(before, key) && hasNestedData(after, key)) {
        const children = iter(before[key], after[key], nestedLvl + 1);
        return {
          key,
          oldValue: null,
          newValue: null,
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

const objectRenderer = (ast) => {
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
  const makeString = (row) => {
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
      return `${dataToString(key, newValue, padding, '+ ')}`;
    } else if (type === 'deleted') {
      return `${dataToString(key, oldValue, padding, '- ')}`;
    } else if (type === 'modified') {
      const oldString = dataToString(key, oldValue, padding, '- ');
      const newString = dataToString(key, newValue, padding, '+ ');
      return [oldString, newString];
    } else if (type === 'not-modified') {
      return `${dataToString(key, oldValue, padding, '  ')}`;
    } else if (type === 'nested') {
      const start = `${padding}${defaultPadding}${key}: {\n`;
      const innerRows = _.flatten(children.map(makeString)).join('');
      const end = `${padding}${defaultPadding}}\n`;
      return `${start}${innerRows}${end}`;
    }
    throw new Error('impossible case');
  };
  const rows = _.flatten(ast.map(makeString)).join('');
  return `{\n${rows}}\n`;
};

const plainRenderer = (ast) => {
  const isObject = value => typeof value === 'object';
  const makeString = (row, keyPrefix) => {
    const {
      key,
      type,
      newValue,
      oldValue,
      children,
    } = row;
    if (type === 'added') {
      const value = isObject(newValue)
        ? 'was added with complex value'
        : `was added with value '${newValue}'`;
      return `Property '${keyPrefix}${key}' ${value}\n`;
    } else if (type === 'deleted') {
      return `Property '${keyPrefix}${key}' was removed\n`;
    } else if (type === 'modified') {
      const oldValueStr = isObject(oldValue) ? 'complex value' : `'${oldValue}'`;
      const newValueStr = isObject(newValue) ? 'complex value' : `'${newValue}'`;
      return `Property '${keyPrefix}${key}' was updated. From ${oldValueStr} to ${newValueStr}\n`;
    } else if (type === 'not-modified') {
      return '';
    } else if (type === 'nested') {
      return children
        .map(innerRow => makeString(innerRow, `${keyPrefix}${key}.`))
        .join('');
    }
    throw new Error('impossible case');
  };
  return ast
    .map(row => makeString(row, ''))
    .join('');
};

const formatToRenderer = {
  object: objectRenderer,
  plain: plainRenderer,
};

export const gendiff = (path1, path2, format = defaultFormat) => {
  const extension = path.extname(path1).slice(1);
  const data1 = getFileContent(path1);
  const data2 = getFileContent(path2);
  const parse = extensionToParser[extension];
  const ast = makeAst(parse(data1), parse(data2));
  const render = formatToRenderer[format];
  return render(ast);
};
