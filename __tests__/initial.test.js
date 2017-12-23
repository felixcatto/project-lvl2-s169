import path from 'path';
import { gendiff, getFileContent } from '../src/';


const formatToPaths = {
  json: {
    before: path.join(__dirname, '__fixtures__/before.json'),
    after: path.join(__dirname, '__fixtures__/after.json'),
    result: path.join(__dirname, '__fixtures__/flatResult.txt'),
  },
  yml: {
    before: path.join(__dirname, '__fixtures__/before.yml'),
    after: path.join(__dirname, '__fixtures__/after.yml'),
    result: path.join(__dirname, '__fixtures__/flatResult.txt'),
  },
};


test('is correct render - JSON', () => {
  const paths = formatToPaths.json;
  const diff = gendiff(paths.before, paths.after, 'json');
  const expected = getFileContent(paths.result);
  expect(diff).toBe(expected);
});

test('is correct render - YAML', () => {
  const paths = formatToPaths.yml;
  const diff = gendiff(paths.before, paths.after, 'yml');
  const expected = getFileContent(paths.result);
  expect(diff).toBe(expected);
});
