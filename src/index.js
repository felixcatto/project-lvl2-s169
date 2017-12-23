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
  const beforeKeys = Object.keys(objBefore);
  const afterKeys = Object.keys(objAfter);
  const unionKeys = _.union(beforeKeys, afterKeys).sort();
  return unionKeys.reduce((acc, key) => {
    if (beforeKeys.includes(key) && !afterKeys.includes(key)) {
      return [...acc, {
        key,
        oldValue: objBefore[key],
        newValue: null,
        type: 'deleted',
      }];
    } else if (!beforeKeys.includes(key) && afterKeys.includes(key)) {
      return [...acc, {
        key,
        oldValue: null,
        newValue: objAfter[key],
        type: 'added',
      }];
    } else if (objBefore[key] !== objAfter[key]) {
      return [...acc, {
        key,
        oldValue: objBefore[key],
        newValue: objAfter[key],
        type: 'modified',
      }];
    } else if (objBefore[key] === objAfter[key]) {
      return [...acc, {
        key,
        oldValue: objBefore[key],
        newValue: objAfter[key],
        type: 'not-modified',
      }];
    }
    throw new Error('impossible case');
  }, []);
};

const render = (ast) => {
  const rows = ast.reduce((acc, row) => {
    const {
      key,
      type,
      newValue,
      oldValue,
    } = row;
    if (type === 'added') {
      return `${acc}  + ${key}: ${newValue}\n`;
    } else if (type === 'deleted') {
      return `${acc}  - ${key}: ${oldValue}\n`;
    } else if (type === 'modified') {
      return `${acc}  - ${key}: ${oldValue}\n  + ${key}: ${newValue}\n`;
    } else if (type === 'not-modified') {
      return `${acc}    ${key}: ${newValue}\n`;
    }
    throw new Error('impossible case');
  }, '');
  return `{\n${rows}}\n`;
};

export const gendiff = (path1, path2, format) => {
  const data1 = getFileContent(path1);
  const data2 = getFileContent(path2);
  const parse = formatToParser[format];
  const ast = makeAst(parse(data1), parse(data2));
  return render(ast);
};
