import {MemoryMockTestBase} from "../../utils/MemoryMockTestBase";
import {deserializePath, MAX_X, MAX_Y, visualize} from "../../utils/PathTestUtils";
import {DataProviderData} from "../../utils/TestBase";
import should from "should";
import {RoadConnection, RoadIndirectConnection} from "../../../src/pathfinder/Road";
import {PathFinderData} from "../../../src/pathfinder/PathFinderData";
import {PathBuilder} from "../../../src/pathfinder/PathBuilder";

@MemoryMockTestBase.Suite
export class PathBuilderTest extends MemoryMockTestBase {
  public roadsProvider(): DataProviderData<[
    paths: Array<string>, connections: Array<Array<Array<RoadConnection>>>,
    indirectConnections: Array<Array<Array<RoadIndirectConnection>>>,
  ]> {
    return {
      subData: [{
        args: [
          ["01014x83x54x7", "01014x83x54x7", "01014x83x5", "09093x54x7"],
          [[]], [[]],
        ]
      }, {
        args: [
          ["01014x83x54x7", "01014x83x9"],
          [
            [ [],  [ 13 ] ],
            [ [ 0 ] ]
          ],
          [[], []],
        ],
      }, {
        args: [
          ["01014x83x54x7", "01092x44x42x4"],
          [
            [ [],  [ 4 ],  [ 8 ] ],
            [ [ 4 ] ], [ [ 0 ] ]
          ],
          [
            [],
            [ [], [], [ [ 0, 4 ] ] ],
            [ [], [ [ 0, 4 ] ] ],
          ],
        ],
      }, {
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
        args: [
          ["01014x83x54x7", "14055x67x51x67x45x6", "12055x8"],
          [
            [ [],  [ 13, 8, 4 ],  [ 11 ] ],
            [ [ 4, 13, 21 ],  [],  [ 8 ] ],
            [ [ 4 ],  [ 6 ] ],
          ],
          [[], [], []],
        ],
      }, {
        args: [
          ["01014x83x54x7", "14055x67x51x47785x6"],
          [
            [ [],  [ 13, 8, 6 ],  [ 5 ] ],
            [ [ 4, 13, 17 ] ],
            [ [ 0 ] ],
          ],
          [
            [],
            [ [], [], [ [ 0, 4 ] ] ],
            [ [], [ [ 0, 4 ] ] ],
          ],
        ],
      }, {
        args: [
          ["02102x54x56x58x4"],
          [[ [ 0, 20 ] ]],
          [[]],
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

    // visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap);
    // pathFinderData.roads.forEach((road, roadIdx) => console.log(`${roadIdx}`, road.connections));
    // pathFinderData.roads.forEach((road, roadIdx) => console.log(`${roadIdx}`, road.indirectConnections));
    // console.log(pathFinderData.roadPosMap, pathFinderData.posToRoadMap);

    should(pathFinderData.roads.length).be.equal(connections.length);
    pathFinderData.roads.forEach((road, roadIdx) => {
      should(road.connections).be.eql(connections[roadIdx], `Road connections for ${roadIdx} do not match.`)
      should(road.indirectConnections).be.eql(indirectConnections[roadIdx], `Road indirect connections for ${roadIdx} do not match.`)
    });
  }

  private getPathFinderInstances() {
    const room = { name: "r" } as Room;
    const pathFinderData = new PathFinderData("path", room);
    const pathBuilder = new PathBuilder(pathFinderData);
    return {pathFinderData, pathBuilder};
  }
}
