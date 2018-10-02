module.exports = class StorageSlot {
  constructor(initialData, ref, key) {
    this.data = initialData;
    this.ref = ref;
    this.key = key;
  }

  getChild(key) {
    if (!Object.prototype.hasOwnProperty.call(this.data, key)) {
      // Should check hirachy here.
      return new StorageSlot(undefined);
    }

    if (key === 'length' && Array.isArray(this.data)) {
      return new StorageSlot(this.data.length);
    }

    const so = this.data[key];
    so.ref = this;
    so.key = key;
    return so;
  }

  set(value) {
    this.data = value;
  }

  toString() {
    return `«(${typeof this.data}) data:${this.data}»`;
  }

  toJSON(key) {
    if (typeof this.data === 'object' && this.data !== null) {
      return this.data;
    }
    return `«(${typeof this.data}) data:${this.data}»`;
  }

  valueOf() {
    return this.data;
  }

  typeOf() {
    return typeof this.data;
  }

  delete() {
    if (this.ref && this.key) {
      this.ref.data[this.key] = undefined;
      return new StorageSlot(true);
    } else {
      return new StorageSlot(false);
    }
  }
};
