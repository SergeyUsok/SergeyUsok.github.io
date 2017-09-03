/// <reference path="../game.js"/>

QUnit.module("Game states tests");

test("NotStartedState apply function raises InitializeGameEvent with generation zero", function () {
    // Arrange
    var generation0 = new Models.Generation(3, 3);
    generation0.add(new Models.Unit(0, 0, new UnitStates.AliveState()));
    var generation1 = new Models.Generation(3, 3);

    var game = new Core.Game(generation0);
    game.history.push(generation1);

    var notStartedState = new NotStartedState();
    
    // Act, Assert
    expect(4);

    var token = EventAggregator.subscribe(new InitializeGameEvent(), (ev) => {
        ok(ev instanceof InitializeGameEvent);
        ok(ev.generation.population == 1, "InitializeGameEvent contains 0 generation");
    });
    ok(generation0.population == 1, "Generation 0 has 1 population");
    ok(generation1.population == 0, "Generation 1 has 0 population");
    notStartedState.apply(game);

    // Tear down
    EventAggregator.unsubscribe(new InitializeGameEvent(), token);
    notStartedState.dispose();
});

test("NotStartedState dispose function raises LeavingNotStartedStateEvent", function () {
    // Arrange
    var game = new Core.Game(new Models.Generation(3, 3));
    var notStartedState = new NotStartedState();

    // Act, Assert
    expect(1);

    notStartedState.apply(game);
    var token = EventAggregator.subscribe(new LeavingNotStartedStateEvent(), (ev) => ok(ev instanceof LeavingNotStartedStateEvent));
    
    notStartedState.dispose();

    // Tear down
    EventAggregator.unsubscribe(new LeavingNotStartedStateEvent(), token);
});

test("NotStartedState handles TileClickedEvent and sets Unit to Alive state", function () {
    // Arrange
    var game = new Core.Game(new Models.Generation(3, 3));
    var expectedX = 1;
    var expectedY = 2;

    var notStartedState = new NotStartedState();

    // Act, Assert
    expect(4);

    notStartedState.apply(game);

    var token = EventAggregator.subscribe(new UnitUpdatedEvent(), (ev) => {
        ok(ev instanceof UnitUpdatedEvent);
        ok(ev.unit.x == expectedX, "Clicked tile has expected x coordinate");
        ok(ev.unit.y == expectedY, "Clicked tile has expected y coordinate");
        ok(ev.unit.state instanceof UnitStates.AliveState, "Unit state sets to Alive");
    });
    
    EventAggregator.publish(new TileClickedEvent(expectedX, expectedY));

    // Tear down
    EventAggregator.unsubscribe(new UnitUpdatedEvent(), token);
    notStartedState.dispose();
});

test("NotStartedState handles TileClickedEvent and sets Unit to Dead state", function () {
    // Arrange
    var expectedX = 2;
    var expectedY = 1;
    var generation = new Models.Generation(3, 3);
    generation.add(new Models.Unit(expectedX, expectedY, new UnitStates.AliveState()));
    var game = new Core.Game(generation);

    var notStartedState = new NotStartedState();

    // Act, Assert
    expect(4);

    notStartedState.apply(game);

    var token = EventAggregator.subscribe(new UnitUpdatedEvent(), (ev) => {
        ok(ev instanceof UnitUpdatedEvent);
        ok(ev.unit.x == expectedX, "Clicked tile has expected x coordinate");
        ok(ev.unit.y == expectedY, "Clicked tile has expected y coordinate");
        ok(ev.unit.state instanceof UnitStates.DeadState, "Unit state sets to Dead");
    });

    EventAggregator.publish(new TileClickedEvent(expectedX, expectedY));

    // Tear down
    EventAggregator.unsubscribe(new UnitUpdatedEvent(), token);
    notStartedState.dispose();
});

test("RunningState raises NewGenerationEvent", function () {
    // Arrange
    var generation = new Models.Generation(3, 3);
    // make following board
    // |   | 1 |  |
    // | 1 | 1 |  |
    // |   |   |  |
    generation.add(new Models.Unit(0, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(1, 0, new UnitStates.AliveState()));
    var game = new Core.Game(generation);

    var runningState = new RunningState();

    // Act, Assert
    expect(3);

    var token = EventAggregator.subscribe(new NewGenerationEvent(), (ev) => {
        ok(ev instanceof NewGenerationEvent);
        ok(ev.generationNumber == 1, "Generation number is 1");
        ok(ev.generation.population == 9, `New generation has ${ev.generation.population} population`);
    });

    runningState.apply(game);

    // Tear down
    runningState.dispose();
    EventAggregator.unsubscribe(new NewGenerationEvent(), token);
});

test("RunningState raises GameOverEvent", function () {
    // Arrange
    var game = new Core.Game(new Models.Generation(3, 3));
    var runningState = new RunningState();

    // Act, Assert
    expect(2);

    var token = EventAggregator.subscribe(new GameOverEvent(), (ev) => {
        ok(ev instanceof GameOverEvent);
        ok(ev.reason == "The game came to zero population", "Check expected reason: The game came to zero population");
    });

    runningState.apply(game);

    // Tear down
    runningState.dispose();
    EventAggregator.unsubscribe(new GameOverEvent(), token);
});

test("PausedState raises HistoricalGenerationEvent when next requested", function () {
    // Arrange
    var game = new Core.Game(new Models.Generation(3, 3));
    var gen2 = new Models.Generation(3, 3);
    gen2.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    game.history.push(gen2);
    var pausedState = new PausedState();
    
    // Act, Assert
    expect(3);

    var token = EventAggregator.subscribe(new HistoricalGenerationEvent(), (ev) => {
        ok(ev instanceof HistoricalGenerationEvent);
        ok(ev.generationNumber == 1, "Expected generation number");
        ok(ev.generation.population == 1, "Generation has expected population");
    });

    pausedState.apply(game);
    pausedState.current = 0;

    EventAggregator.publish(new NextGenerationEvent());

    // Tear down
    pausedState.dispose();
    EventAggregator.unsubscribe(new HistoricalGenerationEvent(), token);
});

test("PausedState raises NewGenerationEvent if no history remains", function () {
    // Arrange
    var generation = new Models.Generation(3, 3);
    // make following board
    // |   | 1 |  |
    // | 1 | 1 |  |
    // |   |   |  |
    generation.add(new Models.Unit(0, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    generation.add(new Models.Unit(1, 0, new UnitStates.AliveState()));
    var game = new Core.Game(generation);
    
    var pausedState = new PausedState();

    // Act, Assert
    expect(3);

    var token = EventAggregator.subscribe(new NewGenerationEvent(), (ev) => {
        ok(ev instanceof NewGenerationEvent);
        ok(ev.generationNumber == 1, "Generation number is 1");
        ok(ev.generation.population == 9, `New generation has ${ev.generation.population} population`);
    });

    pausedState.apply(game);

    EventAggregator.publish(new NextGenerationEvent());

    // Tear down
    pausedState.dispose();
    EventAggregator.unsubscribe(new NewGenerationEvent(), token);
});

test("PausedState raises GameOverEvent when nextGeneration returns GameOver", function () {
    // Arrange
    var game = new Core.Game(new Models.Generation(3, 3));

    var pausedState = new PausedState();

    // Act, Assert
    expect(2);

    var token = EventAggregator.subscribe(new GameOverEvent(), (ev) => {
        ok(ev instanceof GameOverEvent);
        ok(ev.reason == "The game came to zero population", "Check expected reason: The game came to zero population");
    });

    pausedState.apply(game);

    EventAggregator.publish(new NextGenerationEvent());

    // Tear down
    pausedState.dispose();
    EventAggregator.unsubscribe(new GameOverEvent(), token);
});

test("PausedState raises HistoricalGenerationEvent when previous requested", function () {
    // Arrange
    var gen = new Models.Generation(3, 3);
    gen.add(new Models.Unit(1, 1, new UnitStates.AliveState()));
    var game = new Core.Game(gen);
    game.history.push(new Models.Generation(3, 3));
    var pausedState = new PausedState();

    // Act, Assert
    expect(3);

    var token = EventAggregator.subscribe(new HistoricalGenerationEvent(), (ev) => {
        ok(ev instanceof HistoricalGenerationEvent);
        ok(ev.generationNumber == 0, "Expected generation number");
        ok(ev.generation.population == 1, "Generation has expected population");
    });

    pausedState.apply(game);

    EventAggregator.publish(new PrevGenerationEvent());

    // Tear down
    pausedState.dispose();
    EventAggregator.unsubscribe(new HistoricalGenerationEvent(), token);
});