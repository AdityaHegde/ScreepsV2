import { inMemory } from "./inMemory";

/**
 * Defines CostMatrix property which is stored in memory using costMatrix.serialize.
 * And retrieved from memory using PathFinder.CostMatrix.deserialize.
 */
export function costMatrixInMemory(): any {
  return inMemory<CostMatrix>(null, (costMatrix) => {
    return costMatrix.serialize();
  }, (costMatrix) => {
    return PathFinder.CostMatrix.deserialize(costMatrix);
  });
}
