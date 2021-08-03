import {MemoryMockTestBase} from "@test-utils/MemoryMockTestBase";
import {DataProviderData} from "@test-utils/TestBase";
import {Road} from "@pathfinder/Road";
import {deserializePath} from "@test-utils/PathTestUtils";
import should from "should";
import {RoadDirection} from "@pathfinder/RoadTypes";

@MemoryMockTestBase.Suite
export class RoadTest extends MemoryMockTestBase {
  public roadPathProvider(): DataProviderData<[paths: string, directions: Array<RoadDirection>]> {
    return {
      subData: [{
        args: [
          "01014x83x54x7",
          [
            [ 4, 0 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ],
            [ 3, 8 ], [ 3, 7 ], [ 3, 7 ], [ 3, 7 ], [ 3, 7 ],
            [ 4, 7 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 0, 8 ]
          ],
        ]
      }, {
        args: [
          "01092x44x42x4",
          [
            [ 2, 0 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ],
            [ 4, 6 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ],
            [ 2, 8 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ], [ 0, 6 ]
          ]
        ],
      }, {
        args: [
          "01092x74x46x7",
          [
            [ 2, 0 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ],
            [ 4, 6 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ],
            [ 6, 8 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ], [ 0, 2 ]
          ]
        ],
      }, {
        args: [
          "02102x54x56x58x4",
          [
            [ 2, 0 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ],
            [ 4, 6 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ],
            [ 6, 8 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ],
            [ 8, 2 ], [ 8, 4 ], [ 8, 4 ], [ 8, 4 ], [ 8, 4 ], [0, 4],
          ]
        ],
      }, {
        args: [
          "02102x54x56x58x5",
          [
            [ 2, 0 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ], [ 2, 6 ],
            [ 4, 6 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ], [ 4, 8 ],
            [ 6, 8 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ], [ 6, 2 ],
            [ 8, 2 ], [ 8, 4 ], [ 8, 4 ], [ 8, 4 ], [ 8, 4 ], [0, 4],
          ]
        ],
      }],
    };
  }

  @MemoryMockTestBase.Test("roadPathProvider")
  public shouldCreateRoad(path: string, directions: Array<RoadDirection>): void {
    const road = new Road("r", 0).addArrayOfPos(deserializePath(path));
    should(road.roadDirections).be.eql(directions);
  }
}
