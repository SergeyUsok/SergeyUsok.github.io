/// <reference path="../game.js"/>

QUnit.module("Rules tests");

test("Rules Cache should return Rule by 'Alive' key", function () {
    // Arrange, Act
    var rule = RulesCache.getRule("Alive");

    // Assert
    ok(rule instanceof RulesCache.Rule, "Rule exist and returned");
});

test("Rules Cache should return Rule by 'Dead' key", function () {
    // Arrange, Act
    var rule = RulesCache.getRule("Dead");

    // Assert
    ok(rule instanceof RulesCache.Rule, "Rule exist and returned");
});

test("Rules Cache throws exception at non-existent key", function () {
    throws(
        function () {
            RulesCache.getRule("Non-Existent");
        },
        new Error("Provided Non-Existent is not present in cache"),
        "Raised error instance matches the Error instance and its message"
      );
});

test("Check DeadRule when alive neighbors count is 0", function() {
    // Arrange
    // create board which look like:
    // | d | d | d |
    // | d | d | d |
    // | d | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.DeadState, "Execute rule for dead Unit");

    // Act
    var result = RulesCache.getRule("Dead").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.DeadState, "Dead Unit should be returned");
});

test("Check DeadRule when alive neighbors count is 2", function () {
    // Arrange
    // create board which look like:
    // | d | d | d |
    // | d | d | a |
    // | a | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(2, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.DeadState, "Execute rule for dead Unit");

    // Act
    var result = RulesCache.getRule("Dead").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.DeadState, "Dead Unit should be returned");
});

test("Check DeadRule when alive neighbors count is 3", function () {
    // Arrange
    // create board which look like:
    // | a | d | d |
    // | d | d | a |
    // | a | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
    generation.add(new Models.Unit(2, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.DeadState, "Execute rule for dead Unit");

    // Act
    var result = RulesCache.getRule("Dead").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.AliveState, "Alive Unit should be returned");
});

test("Check DeadRule when alive neighbors greater than 3", function () {
    // Arrange
    // create board which look like:
    // | a | d | d |
    // | a | d | a |
    // | a | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(2, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.DeadState, "Execute rule for dead Unit");

    // Act
    var result = RulesCache.getRule("Dead").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.DeadState, "Dead Unit should be returned");
});

test("Check AliveRule when alive neighbors count is 0", function () {
    // Arrange
    // create board which look like:
    // | d | d | d |
    // | d | a | d |
    // | d | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.AliveState, "Execute rule for alive Unit");

    // Act
    var result = RulesCache.getRule("Alive").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.DeadState, "Dead Unit should be returned");
});

test("Check AliveRule when alive neighbors count is 2", function () {
    // Arrange
    // create board which look like:
    // | d | d | d |
    // | d | a | a |
    // | a | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(2, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.AliveState, "Execute rule for alive Unit");

    // Act
    var result = RulesCache.getRule("Alive").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.AliveState, "Alive Unit should be returned");
});

test("Check AliveRule when alive neighbors count is 3", function () {
    // Arrange
    // create board which look like:
    // | a | d | d |
    // | a | a | a |
    // | d | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(2, 1, new UnitStates.AliveState()));
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.AliveState, "Execute rule for alive Unit");

    // Act
    var result = RulesCache.getRule("Alive").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.AliveState, "Alive Unit should be returned");
});

test("Check AliveRule when alive neighbors count is 4", function () {
    // Arrange
    // create board which look like:
    // | a | d | d |
    // | a | a | a |
    // | a | d | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(2, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
    var unit = generation.getUnit(1, 1);

    ok(unit.state instanceof UnitStates.AliveState, "Execute rule for alive Unit");

    // Act
    var result = RulesCache.getRule("Alive").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.DeadState, "Dead Unit should be returned");
});

test("Can search neighbors out of borders", function () {
    // Arrange
    // create board which look like:
    // | a | d | d |
    // | d | d | d |
    // | a | a | d | where d - dead, a - alive
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
    generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
    generation.add(new Models.Unit(1, 2, new UnitStates.AliveState()));
    var unit = generation.getUnit(2, 0);

    ok(unit.state instanceof UnitStates.DeadState, "Execute rule for dead Unit");

    // Act
    var result = RulesCache.getRule("Dead").execute(unit, generation);

    // Assert
    ok(result.state instanceof UnitStates.AliveState, "Alive Unit should be returned");
});