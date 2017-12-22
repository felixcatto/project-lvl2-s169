import _ from 'lodash';

export default class Tree {
  constructor(key, data) {
    this.key = key;
    this.data = data;
    this.parent = null;
    this.lvl = 0;
    this.children = [];
  }

  getData() {
    return this.data;
  }

  getParent() {
    return this.parent;
  }

  getLvl() {
    return this.lvl;
  }

  getChildren() {
    return this.children;
  }

  isRoot() {
    return this.parent === null;
  }

  find(key) {
    return this.children.find(tree => tree.key === key) || null;
  }

  deepFind(treeKeys) {
    const [rootKey, ...restKeys] = treeKeys;
    if (treeKeys.length === 1 && rootKey === this.key) {
      return this;
    }
    const iter = (acc, keys) => {
      if (keys.length === 0) {
        return acc;
      }
      const [key, ...rest] = keys;
      const tree = this.find(key);
      if (!tree) {
        return null;
      }
      return iter(tree, rest);
    };
    return iter(this, restKeys);
  }

  addChild(parentsKeys, key, data) {
    const newTree = _.cloneDeep(this);
    const parent = newTree.deepFind(parentsKeys);
    const child = new Tree(key, data);
    child.parent = parent;
    child.lvl = parent.lvl + 1;
    parent.children.push(child);
    return newTree;
  }
}
