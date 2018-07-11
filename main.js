var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

const harvestersCount = 2;
const buildersCount = 5;
const upgradersCount = 1;

const BUILDER_BODY_TIERS = [
    [WORK,WORK,CARRY,MOVE],
    [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
];
const HARVESTER_BODY_TIERS = [
    [WORK,CARRY,CARRY,MOVE,MOVE],
    [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
]

module.exports.loop = function () {

    let creepTier = 0;

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var targets = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.energy == structure.energyCapacity;
        }
    });

    if(targets.length == 6) {
        creepTier = 1;
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    console.log('Builders: ' + builders.length +'Upgraders: ' + upgraders.length+'Harvesters: ' + harvesters.length);

    if(upgraders.length < upgradersCount && harvesters.length >= harvestersCount && builders.length >= buildersCount) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName, 
            {memory: {role: 'upgrader'}});
    }

    
    if(builders.length < buildersCount && harvesters.length >= harvestersCount) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep(BUILDER_BODY_TIERS[creepTier], newName, 
            {memory: {role: 'builder'}});
    }
    
    if(harvesters.length < harvestersCount) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep(HARVESTER_BODY_TIERS[creepTier], newName, 
            {memory: {role: 'harvester'}});
            
    }
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}
