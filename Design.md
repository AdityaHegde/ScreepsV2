### Job - Harvest
 - Role - HarvestForever
   - Task - Harvest, DepositTo(Hauler/Container)
   - JobRec - Based on energy in source. Request time based on distance.

### Job - Supply
 - Role - SupplyStructure (Structure = Spawn/Extension)
   - Task - PickupFrom(Harvester/Container), DepositToStructure
   - JobRec - Static
 - Role - SupplyUpgraders
   - Task - PickupFrom(Harvester/Container), DepositTo(Upgraders/Container)
   - JobRec - Static
    
### Job - Upgrade
 - Role - UpgradeForever
   - Task - PickupFrom(Hauler/Container), Upgrade
   - JobRec - Static ? (Revisit once reached RCL 8)

### Job - BuildAndRepair
 - Role - Build
   - Task - PickupFrom(Harvester/Container), Build
   - JobRec - Static
 - Role - Repair
   - Task - PickupFrom(Harvester/Container), Repair
   - JobRec - Static
   


1. Job types - [cost, type, ...args]
2. Single check pathing with caching
3. SetTimeout - [id, method, entityId, ...args]
4. getEntityById - Class in prototype (this.constructor type?)