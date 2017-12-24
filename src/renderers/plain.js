export default (ast) => {
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
