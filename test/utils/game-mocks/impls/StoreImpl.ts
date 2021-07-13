export class StoreImpl {
  private readonly capacity: number;

  public energy = 0;

  public constructor(capacity: number) {
    this.capacity = capacity;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public getFreeCapacity(): number {
    return this.capacity - this.energy;
  }

  public getUsedCapacity(): number {
    return this.energy;
  }

  public transfer(store: StoreImpl): void {
    const freeCapacity = store.getFreeCapacity();

    if (this.energy < freeCapacity) {
      store.energy += this.energy;
      this.energy = 0;
    } else {
      store.energy = store.capacity;
      this.energy -= freeCapacity;
    }
  }

  public addEnergy(energy: number): void {
    this.energy = Math.max(0, Math.min(this.energy + energy, this.capacity));
  }
}
