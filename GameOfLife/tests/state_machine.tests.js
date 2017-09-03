/// <reference path="../game.js"/>

QUnit.module("StateMachine tests");

test("StateMachine returns new state on proper trigger", function () {
    // Arrange
    var notStarted = new NotStartedState();
    var stateMachine = new StateMachine(notStarted);
    stateMachine.addTransition(notStarted, new GameStartingEvent(), new RunningState());
    stateMachine.addTransition(notStarted, new GamePausingEvent(), new PausedState());

    // Act
    var actual = stateMachine.nextState(new GameStartingEvent());

    // Assert
    ok(actual instanceof RunningState, "StateMachine returned new state");
});

test("StateMachine returns the same state on unconfigured trigger", function () {
    // Arrange
    var notStarted = new NotStartedState();
    var stateMachine = new StateMachine(notStarted);
    stateMachine.addTransition(notStarted, new GamePausingEvent(), new PausedState());

    // Act
    var actual = stateMachine.nextState(new GameStartingEvent()); // GameStartingEvent is not configured

    // Assert
    ok(actual instanceof NotStartedState, "StateMachine returned the same state");
});

test("StateMachine performs action before transition", function () {
    // Arrange
    var notStarted = new NotStartedState();
    var stateMachine = new StateMachine(notStarted);
    stateMachine.addTransition(notStarted, new GamePausingEvent(), new PausedState());

    stateMachine.onTransiting(notStarted, st => ok(st instanceof NotStartedState, "Executed action before transition"));

    // Act
    expect(2);

    var actual = stateMachine.nextState(new GamePausingEvent());

    // Assert
    ok(actual instanceof PausedState, "StateMachine returned new state");
});

test("StateMachine performs action after transition", function () {
    // Arrange
    var notStarted = new NotStartedState();
    var stateMachine = new StateMachine(notStarted);
    stateMachine.addTransition(notStarted, new GamePausingEvent(), new PausedState());

    stateMachine.onTransited(new PausedState(), st => ok(st instanceof PausedState, "Executed action on newly transited state"));

    // Act
    expect(2);

    var actual = stateMachine.nextState(new GamePausingEvent());

    // Assert
    ok(actual instanceof PausedState, "StateMachine returned new state");
});

test("StateMachine performs action before and after transition", function () {
    // Arrange
    var notStarted = new NotStartedState();
    var stateMachine = new StateMachine(notStarted);
    stateMachine.addTransition(notStarted, new GamePausingEvent(), new PausedState());

    stateMachine.onTransiting(notStarted, st => ok(st instanceof NotStartedState, "Executed action before transition"));
    stateMachine.onTransited(new PausedState(), st => ok(st instanceof PausedState, "Executed action on newly transited state"));

    // Act
    expect(3);

    var actual = stateMachine.nextState(new GamePausingEvent());

    // Assert
    ok(actual instanceof PausedState, "StateMachine returned new state");
});