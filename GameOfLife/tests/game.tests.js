/// <reference path="../game.js"/>

QUnit.module("Game tests");

test("Game returns Game Over when stable state achieved", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
	// make following board
	// | 1 | 1 |  |
	// | 1 | 1 |  |
	// |   |   |  |
	generation.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
	generation.add(new Models.Unit(1, 0, new UnitStates.AliveState()));
	generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
	var game = new Core.Game(generation);

	// Act
	var genResult = game.nextGeneration();

	// Assert
	ok(genResult.isGameOver, "Game over");
	equal(genResult.reason, "The game came to a stable state", "Expected message");
});

test("Game returns Game Over when no alive units left", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
	// make following board
	// |   |   |  |
	// |   | 1 |  |
	// |   |   |  |
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
	var game = new Core.Game(generation);

	// Act
	var genResult = game.nextGeneration();

	// Assert
	ok(genResult.isGameOver, "Game over");
	equal(genResult.reason, "The game came to zero population", "Expected message");
});

test("Game returns new Generation", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
	// make following board
	// |   | 1 |  |
	// | 1 | 1 |  |
	// |   |   |  |
	generation.add(new Models.Unit(0, 1, new UnitStates.AliveState()));
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
	generation.add(new Models.Unit(1, 0, new UnitStates.AliveState()));
	equal(generation.population, 3, "Old generation has 3 population number");

	var game = new Core.Game(generation);

	// Act
	var genResult = game.nextGeneration();

	// Assert
	notOk(genResult.isGameOver, "Game is continuing");
	equal(genResult.reason, "", "Empty message");
	equal(genResult.generation.population, 9, "New generation has 9 population number");
});

test("Game history contains all generations created during current game", function () {
	// Arrange
	var generation = new Models.Generation(3, 3);
	// make following board
	// | 1 | 1 |  |
	// | 1 | 1 |  |
	// |   |   |  |
	generation.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
	generation.add(new Models.Unit(1, 0, new UnitStates.AliveState()));
	generation.add(new Models.Unit(0, 2, new UnitStates.AliveState()));
	generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
	var game = new Core.Game(generation);

	// Act
	equal(game.history.length, 1, "Before next generation called. Only zero generation in history");

	game.nextGeneration();

	// Assert
	equal(game.history.length, 2, "After next generation called");
});

test("ZeroGenerationProvider provides generation with empty population", function () {
	// Arrange
	var provider = new Core.ZeroGenerationProvider();

	// Act
	var width = 3;
	var height = 4;
	var emptyGen = provider.getEmptyGeneration(width, height);

	// Assert
	equal(emptyGen.population, 0, "Empty generation with 0 population returned");
	equal(emptyGen.height, height, "Generation with expected height");
	equal(emptyGen.width, width, "Generation with expected width");
});

test("ZeroGenerationProvider provides generation with random non-zero population", function () {
	// Arrange
	var provider = new Core.ZeroGenerationProvider();

	// Act
	var width = 3;
	var height = 4;
	var randomGen = provider.getRandomGeneration(width, height);

	// Assert
	notEqual(randomGen.population, 0, "Retuned random generation with non-zero population");
	equal(randomGen.height, height, "Generation with expected height");
	equal(randomGen.width, width, "Generation with expected width");
});