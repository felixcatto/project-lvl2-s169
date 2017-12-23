import path from 'path';
import { gendiff, getFileContent } from '../src/';


const formatToPaths = {
  json: {
    before: path.join(__dirname, '__fixtures__/before.json'),
    after: path.join(__dirname, '__fixtures__/after.json'),
    result: path.join(__dirname, '__fixtures__/result.txt'),
  },
  yml: {
    before: path.join(__dirname, '__fixtures__/before.yml'),
    after: path.join(__dirname, '__fixtures__/after.yml'),
    result: path.join(__dirname, '__fixtures__/result.txt'),
  },
  ini: {
    before: path.join(__dirname, '__fixtures__/before.ini'),
    after: path.join(__dirname, '__fixtures__/after.ini'),
    result: path.join(__dirname, '__fixtures__/result.txt'),
  },
};


test('is correct render - JSON', () => {
  const paths = formatToPaths.json;
  const diff = gendiff(paths.before, paths.after);
  const expected = getFileContent(paths.result);
  expect(diff).toBe(expected);
});

test('is correct render - YAML', () => {
  const paths = formatToPaths.yml;
  const diff = gendiff(paths.before, paths.after);
  const expected = getFileContent(paths.result);
  expect(diff).toBe(expected);
});

test('is correct render - INI', () => {
  const paths = formatToPaths.ini;
  const diff = gendiff(paths.before, paths.after);
  const expected = getFileContent(paths.result);
  expect(diff).toBe(expected);
});
