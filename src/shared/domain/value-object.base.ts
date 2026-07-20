export abstract class ValueObject<T> {
  protected constructor(protected readonly value: T) {}

  equals(other?: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  toString(): string {
    return typeof this.value === "string" ? this.value : JSON.stringify(this.value);
  }

  toValue(): T {
    return this.value;
  }
}
