module.exports = class AstItem {
  constructor(...children) {
    children.forEach(x => {
      if (x === null || x === undefined) {
        throw new Error(this + ' all children must be defined, got: ' + x);
      }

      if (Array.isArray(x)) {
        throw new Error(
          this + ' all children must not be array, got: ' + x.constructor.name
        );
      }
      if (!x instanceof AstItem) {
        throw new Error(
          this +
            ' all children must be instanceof AstItem, got: ' +
            x.constructor.name
        );
      }
      if (!x.toStringAll) {
        throw new Error(
          this +
            ' all children must have x.toStringAll, got: ' +
            x.constructor.name
        );
      }
    });
    this.children = children;
  }

  run(scope) {
    let res = undefined;
    for (let child of this.children) {
      res = child.run(scope);
      if ('__error' in scope) return;
    }
    return res;
  }

  toString(pad = '') {
    return `${pad}[${this.constructor.name}]`;
  }

  toStringAll(pad = '') {
    // if (pad.length === 0 && this.constructor.name !== 'Program') {
    //   throw new Error();
    // }
    let str = this.toString(pad);
    if (this.children.length) {
      str +=
        '\n' +
        this.children
          .map((child, i) => {
            if (!child.toStringAll) {
              console.log('no toStringAll' + child.constructor.name);
            }
            return i + child.toStringAll(pad + '  ');
          })
          .join('\n');
    }
    return str;
  }

  mustBeOrNull(name, t) {
    if (name() === null) return;
    this.mustBe(name, t);
  }

  mustBe(name, t) {
    if (!(name() instanceof t)) {
      throw new Error(
        `${this} is expecting property ${name} to be ${
          t.name
        } but got ${name()}`
      );
    }
  }

  allMustBe(name, t) {
    const arr = name();
    if (!Array.isArray(arr)) {
      throw new Error(
        `${this} is expecting property ${name} to be an array but got: ${name()}`
      );
    }

    const badOne = arr.find(item => !(item instanceof t));
    if (badOne) {
      throw new Error(
        `${this} is expecting every item of property ${name} to be an ${
          t.name
        } but got: ${badOne}`
      );
    }
  }
};
