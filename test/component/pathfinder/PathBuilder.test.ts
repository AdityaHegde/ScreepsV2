import {MemoryMockTestBase} from "@test-utils/MemoryMockTestBase";
import {deserializePath, MAX_X, MAX_Y, visualize} from "@test-utils/PathTestUtils";
import {DataProviderData} from "@test-utils/TestBase";
import should from "should";
import {PathFinderData} from "@pathfinder/PathFinderData";
import {PathBuilder} from "@pathfinder/PathBuilder";
import {RoadConnection, RoadIndirectConnection} from "@pathfinder/RoadTypes";

@MemoryMockTestBase.Suite
export class PathBuilderTest extends MemoryMockTestBase {
  public roadsProvider(): DataProviderData<[
    paths: Array<string>, connections: Array<Array<Array<RoadConnection>>>,
    indirectConnections: Array<Array<Array<RoadIndirectConnection>>>,
  ]> {
    return {
      subData: [{
        title: "Various overlapping paths",
        args: [
          ["01014x83x54x7", "01014x83x54x7", "01014x83x5", "09093x54x7", "01014x83x9", "05093x94x7"],
          [
            [ [], [ 13 ], [ 8 ] ],  [ [ 0 ] ],  [ [ 4 ] ],
          ],
          [
            [],  [ [], [], [ [ 0, 1 ] ] ],  [ [], [ [ 0, 1 ] ] ],
          ],
        ],
      }, {
        title: "Distant paths",
        args: [
          ["01014x83x54x7", "01092x44x42x4", "040624x42", "0407124x4221"],
          [
            [ [],  [ 4 ],  [ 8 ] ],
            [ [ 4 ], [], [], [ 3 ] ],
            [ [ 0 ], [], [], [], [ 2 ] ],
            [ [], [ 1 ] ], [ [], [], [ 0 ] ],
          ],
          [
            [ [], [], [], [ [ 1, 1 ] ], [ [ 2, 1 ] ] ],
            [ [], [], [ [ 0, 1 ] ], [], [ [ 0, 2 ] ] ],
            [ [], [ [ 0, 1 ] ], [], [ [ 0, 2 ] ] ],
            [ [ [ 1, 1 ] ], [], [ [ 1, 2 ] ], [], [ [ 1, 3 ] ] ],
            [ [ [ 2, 1 ] ], [ [ 2, 2 ] ], [], [ [ 2, 3 ] ] ],
          ],
        ],
      }, {
        // TODO: handle inter movement.
        title: "Parallel paths",
        args: [
          ["01014x83x54x7", "01092x442x4", "05035x5", "06035x5"],
          [
            [ [],  [ 4 ],  [ 5 ],  [ 4 ],  [ 5 ] ],
            [ [ 4 ],  [],  [],  [ 4 ] ],
            [ [ 0 ],  [],  [],  [],  [ 0 ] ],
            [ [ 2 ],  [ 2 ] ],
            [ [ 3 ],  [],  [ 3 ] ]
          ],
          [
            [],
            [ [], [], [ [ 0, 1 ] ], [], [ [ 0, 1 ] ] ],
            [ [], [ [ 0, 1 ] ], [], [ [ 0, 1 ] ] ],
            [ [], [], [ [ 0, 1 ] ], [], [ [ 0, 1 ] ] ],
            [ [], [ [ 0, 1 ] ], [], [ [ 0, 1 ] ] ],
          ],
        ],
      }, {
        title: "Multiple intersections",
        args: [
          ["01014x83x54x7", "14055x67x51x47785x6", "12055x8"],
          [
            [ [],  [ 13, 8, 6 ],  [ 5 ], [ 11 ] ],
            [ [ 4, 13, 17 ], [], [], [8] ],
            [ [ 0 ] ],
            [ [ 4 ], [ 6 ] ],
          ],
          [
            [],
            [ [], [], [ [ 0, 1 ] ] ],
            [ [], [ [ 0, 1 ] ], [], [ [ 0, 1 ] ] ],
            [ [], [], [ [ 0, 1 ] ] ],
          ],
        ],
      }, {
        title: "Circular paths",
        args: [
          [
            "05078822446", "070966882244", "09074466882", "070522446688",
            "06088x5", "08086x5", "08064x5", "06062x5",
          ],
          [
            [ [ 0, 8 ], [ 0, 8 ], [], [ 6 ], [ 2 ] ],
            [ [ 6 ], [ 0, 8 ], [ 0, 8 ], [], [], [ 2 ] ],
            [ [], [ 6 ], [ 0, 8 ], [ 0, 8 ], [], [], [ 2 ] ],
            [ [ 0, 8 ], [], [ 6 ], [ 0, 8 ], [], [], [], [ 2 ] ],
            [ [ 0 ] ],  [ [], [ 0 ] ],  [ [], [], [ 0 ] ],  [ [], [], [], [ 0 ] ],
          ],
          [
            [ [], [], [ [ 1, 1 ], [ 3, 1 ] ], [], [], [ [ 1, 1 ] ], [ [ 1, 2 ], [ 3, 2 ] ], [ [ 3, 1 ] ] ],
            [ [], [], [], [ [ 0, 1 ], [ 2, 1 ] ], [ [ 0, 1 ] ], [], [ [ 2, 1 ] ], [ [ 0, 2 ], [ 2, 2 ] ] ],
            [ [ [ 1, 1 ], [ 3, 1 ] ], [], [], [], [ [ 1, 2 ], [ 3, 2 ] ], [ [ 1, 1 ] ], [], [ [ 3, 1 ] ] ],
            [ [], [ [ 0, 1 ], [ 2, 1 ] ], [], [], [ [ 0, 1 ] ], [ [ 0, 2 ], [ 2, 2 ] ], [ [ 2, 1 ] ] ],
            [ [], [ [ 0, 1 ] ], [ [ 0, 2 ] ], [ [ 0, 1 ] ], [], [ [ 0, 2 ] ], [ [ 0, 3 ] ], [ [ 0, 2 ] ] ],
            [ [ [ 1, 1 ] ], [], [ [ 1, 1 ] ], [ [ 1, 2 ] ], [ [ 1, 2 ] ], [], [ [ 1, 2 ] ], [ [ 1, 3 ] ] ],
            [ [ [ 2, 2 ] ], [ [ 2, 1 ] ], [], [ [ 2, 1 ] ], [ [ 2, 3 ] ], [ [ 2, 2 ] ], [], [ [ 2, 2 ] ] ],
            [ [ [ 3, 1 ] ], [ [ 3, 2 ] ], [ [ 3, 1 ] ], [], [ [ 3, 2 ] ], [ [ 3, 3 ] ], [ [ 3, 2 ] ] ],
          ],
        ],
      }],
    };
  }

  @MemoryMockTestBase.Test("roadsProvider")
  public shouldAddAFewRoads(
    paths: Array<string>, connections: Array<Array<Array<number>>>,
    indirectConnections: Array<Array<Array<RoadIndirectConnection>>>,
  ): void {
    const {pathBuilder, pathFinderData} = this.getPathFinderInstances();
    paths.forEach(path => pathBuilder.addRoad(deserializePath(path)));

    visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap);
    pathFinderData.roads.forEach((road, roadIdx) => console.log(`${roadIdx}`, road.connections));
    pathFinderData.roads.forEach((road, roadIdx) => console.log(`${roadIdx}`, road.indirectConnections));
    // console.log(pathFinderData.roadPosMap, pathFinderData.posToRoadMap);

    should(pathFinderData.roads.length).be.equal(connections.length);
    pathFinderData.roads.forEach((road, roadIdx) => {
      should(road.connections).be.eql(connections[roadIdx], `Road connections for ${roadIdx} do not match.`);
      should(road.indirectConnections).be.eql(indirectConnections[roadIdx], `Road indirect connections for ${roadIdx} do not match.`);
    });
  }

  private getPathFinderInstances() {
    const room = { name: "r" } as Room;
    const pathFinderData = new PathFinderData("path", room);
    const pathBuilder = new PathBuilder(pathFinderData);
    return {pathFinderData, pathBuilder};
  }
}
