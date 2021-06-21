import {Globals} from "./globals/Globals";
import {RoomRunner} from "./runner/RoomRunner";
import {RoomRunnerInstance} from "./runner/RoomRunnerInstance";
import {JobAssigner} from "./job/JobAssigner";
import {JobAssignerInstance} from "./job/JobAssignerInstance";
import {Job} from "./job/Job";
import {JobInstance} from "./job/JobInstance";
import {CreepPool} from "./job/creep-pool/CreepPool";
import {CreepPoolInstance} from "./job/creep-pool/CreepPoolInstance";
import {Task} from "./task/Task";
import {TaskInstance} from "./task/TaskInstance";
import {SourceTarget} from "./task/target/SourceTarget";
import {SourceTargetPool} from "./task/target-pool/SourceTargetPool";
import {TargetPoolInstance} from "./task/target-pool/TargetPoolInstance";
import {DepositTarget} from "./task/target/DepositTarget";
import {DepositTargetPool} from "./task/target-pool/DepositTargetPool";
import {EventEntry, EventLoop} from "./events/EventLoop";
import {DEPOSIT_TARGET_POOL_ID, EVENT_LOOP_ID, JOB_ASSIGNER_ID, ROOM_RUNNER_ID} from "./constants";
import {Logger} from "./utils/Logger";

declare global {
  interface Memory {
    creepNameId: number;
    events: Array<EventEntry>;
  }

  interface RoomMemory {
    initialised: boolean;
  }

  interface CreepMemory {
    target?: string;
    weight?: number;

    power?: number;

    task?: number;
    subTask?: number;
  }
}

const roomRummer = Globals.addGlobalSingleton(new RoomRunner(ROOM_RUNNER_ID, RoomRunnerInstance, {
  eventLoop: Globals.addGlobalSingleton(new EventLoop(EVENT_LOOP_ID, null, {})),
  jobAssigner: Globals.addGlobalSingleton(new JobAssigner(JOB_ASSIGNER_ID, JobAssignerInstance, {
    jobs: [
      new Job("harvester", JobInstance as any, {
        creepPool: new CreepPool("harvester", CreepPoolInstance as any, {
          creepNamePrefix: "Harvester", maxCount: 10,
          initParts: [WORK, CARRY, MOVE, MOVE], creepParts: [WORK, CARRY], powerPart: WORK,
          addMove: true, maxParts: 12,
        }),
        tasks: [
          [new Task("harvest", TaskInstance, {
            target: new SourceTarget(),
            targetPool: new SourceTargetPool("source", TargetPoolInstance as any, {
              target: new SourceTarget(),
            }),
          })],
          [new Task("deposit", TaskInstance, {
            target: new DepositTarget(RESOURCE_ENERGY),
            targetPool: Globals.addGlobalSingleton(new DepositTargetPool(DEPOSIT_TARGET_POOL_ID, TargetPoolInstance as any, {
              target: new DepositTarget(RESOURCE_ENERGY),
            }, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION])),
          })],
        ],
      }),
    ],
  })),
}));

const logger = new Logger("Main");

export const loop = (): void => {
  logger.log("Tick:", Game.time);

  const rooms = new Array<Room>();

  Object.values(Game.rooms).forEach((room) => {
    if (!room.memory.initialised) {
      roomRummer.init(room);
    } else if (room.controller.my) {
      rooms.push(room);
    }
  });

  rooms.forEach(room => roomRummer.preTick(room));
  rooms.forEach(room => roomRummer.tick(room));
  rooms.forEach(room => roomRummer.postTick(room));
};
