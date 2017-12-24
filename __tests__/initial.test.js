import path from 'path';
import { gendiff, getFileContent } from '../src/';


const formatToPaths = {
  json: {
    before: path.join(__dirname, '__fixtures__/before.json'),
    after: path.join(__dirname, '__fixtures__/after.json'),
    objectResult: path.join(__dirname, '__fixtures__/resultJsonToObject.txt'),
    plainResult: path.join(__dirname, '__fixtures__/resultJsonToPlain.txt'),
    jsonResult: path.join(__dirname, '__fixtures__/resultJsonToJson.txt'),
  },
  yml: {
    before: path.join(__dirname, '__fixtures__/before.yml'),
    after: path.join(__dirname, '__fixtures__/after.yml'),
    objectResult: path.join(__dirname, '__fixtures__/objectResult.txt'),
    plainResult: path.join(__dirname, '__fixtures__/plainResult.txt'),
  },
  ini: {
    before: path.join(__dirname, '__fixtures__/before.ini'),
    after: path.join(__dirname, '__fixtures__/after.ini'),
    objectResult: path.join(__dirname, '__fixtures__/objectResult.txt'),
    plainResult: path.join(__dirname, '__fixtures__/plainResult.txt'),
  },
};


test('is correct render - JSON -> OBJECT', () => {
  const paths = formatToPaths.json;
  const diff = gendiff(paths.before, paths.after, 'object');
  const expected = getFileContent(paths.objectResult);
  expect(diff).toBe(expected);
});

test('is correct render - YAML -> OBJECT', () => {
  const paths = formatToPaths.yml;
  const diff = gendiff(paths.before, paths.after, 'object');
  const expected = getFileContent(paths.objectResult);
  expect(diff).toBe(expected);
});

test('is correct render - INI -> OBJECT', () => {
  const paths = formatToPaths.ini;
  const diff = gendiff(paths.before, paths.after, 'object');
  const expected = getFileContent(paths.objectResult);
  expect(diff).toBe(expected);
});

test('is correct render - JSON -> PLAIN', () => {
  const paths = formatToPaths.json;
  const diff = gendiff(paths.before, paths.after, 'plain');
  const expected = getFileContent(paths.plainResult);
  expect(diff).toBe(expected);
});

test('is correct render - JSON -> JSON', () => {
  const paths = formatToPaths.json;
  const diff = gendiff(paths.before, paths.after, 'json');
  const expected = getFileContent(paths.jsonResult);
  expect(diff).toBe(expected);
});
