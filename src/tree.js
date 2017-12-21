export default class Tree {
  constructor(data) {
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

  addChild(data) {
    const child = new Tree(data);
    child.parent = this;
    child.lvl = this.lvl + 1;
    this.children.push(child);
    return child;
  }
}
