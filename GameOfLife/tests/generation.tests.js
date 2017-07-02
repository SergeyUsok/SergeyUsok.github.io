/// <reference path="../game.js"/>

QUnit.module("Generation tests");

test("Generation initializes with Dead units", function () {
	// Arrange, Act
	expect(10);
	var generation = new Models.Generation(3, 3);

	// Assert
	equal(generation.population, 0, "Population is 0");
    
	for(var unit of generation) {
		ok(unit.state instanceof UnitStates.DeadState, `unit (${unit.x},${unit.y}) in Dead state`);
    }
});

test("Add Dead unit to cell with Dead unit. Population should not be changed", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);

	// Act
	equal(generation.population, 0, `Population is ${generation.population} before adding`);
	generation.add(new Models.Unit(1, 1, new UnitStates.DeadState()));

	// Assert
	equal(generation.population, 0, `Population is ${generation.population} after adding`);
});

test("Add Dead unit to cell with Alive unit. Population should be decremented", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));

	// Act
	equal(generation.population, 1, `Population is ${generation.population} before adding`);
	generation.add(new Models.Unit(1, 1, new UnitStates.DeadState()));

	// Assert
	equal(generation.population, 0, `Population is ${generation.population} after adding`);
});

test("Add Alive unit to cell with Alive unit. Population should not be changed", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));

	// Act
	equal(generation.population, 1, `Population is ${generation.population} before adding`);
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));

	// Assert
	equal(generation.population, 1, `Population is ${generation.population} after adding`);
});

test("Add Alive unit to cell with Dead unit. Population should be incremented", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);

	// Act
	equal(generation.population, 0, `Population is ${generation.population} before adding`);
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));

	// Assert
	equal(generation.population, 1, `Population is ${generation.population} after adding`);
});

test("Get unit should return unit", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);

	// Act
	var unit = generation.getUnit(0, 0);

	// Assert
	ok(unit instanceof Models.Unit, "Unit has been returned");
});

test("Get unit should throw error when x is less than 0", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);

	throws(
        function () {
        	generation.getUnit(-1, 0);
        },
        new RangeError("Provided x=-1 and y=0 out of board borders"),
        "Raised Range error with message: 'Provided x=-1 and y=0 out of board borders'"
      );
});

test("Get unit should throw error when x is greater or equal width", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
    
	equal(generation.width, 3, `Width is equal to ${generation.width}`);

	throws(
        function () {
        	generation.getUnit(3, 0);
        },
        new RangeError("Provided x=3 and y=0 out of board borders"),
        "Raised Range error with message: 'Provided x=3 and y=0 out of board borders'"
      );
});

test("Get unit should throw error when y is greater or equal height", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);

	equal(generation.height, 3, `Height is equal to ${generation.height}`);

	throws(
        function () {
        	generation.getUnit(0, 4);
        },
        new RangeError("Provided x=0 and y=4 out of board borders"),
        "Raised Range error with message: 'Provided x=0 and y=4 out of board borders'"
      );
});

test("Get unit should throw error when y is less than 0", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);

	throws(
        function () {
        	generation.getUnit(0, -1);
        },
        new RangeError("Provided x=0 and y=-1 out of board borders"),
        "Raised Range error with message: 'Provided x=0 and y=-1 out of board borders'"
      );
});

test("Iterator check. Should iterate through all units", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
	var totalNumber = generation.width * generation.height;

	equal(totalNumber, 9, "Total number is 9. So iterator should go through 9 units");

	// Act
	var count = 0;
	for(var unit of generation) {
		count++;
    }

	// Assert
	equal(count, totalNumber, `Number of iterated units is ${count}`);
});