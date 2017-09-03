/// <reference path="../game.js"/>

QUnit.module("EventAggregator tests");

test("Event Aggregator - subscribe works", function () {
    // Arrange
    expect(1);

    // Act, Assert
    var token = EventAggregator.subscribe(new GameOverEvent(), (ev) => ok(ev instanceof GameOverEvent));
    EventAggregator.publish(new GameOverEvent());
    EventAggregator.unsubscribe(new GameOverEvent(), token);
});

test("Event Aggregator subscribe works only if subscribed event called", function () {
    // Arrange
    expect(2);

    // Act, Assert
    var token = EventAggregator.subscribe(new GameOverEvent(), (ev) => ok(ev instanceof GameOverEvent));

    EventAggregator.publish(new GameStartingEvent());
    EventAggregator.publish(new GameOverEvent());
    EventAggregator.publish(new GameStartingEvent());
    EventAggregator.publish(new GameOverEvent());

    EventAggregator.unsubscribe(new GameOverEvent(), token);
});

test("Event Aggregator. Every time when Publish called subscriber called as well", function () {
    // Arrange
    var count = 0;

    // Act
    var token = EventAggregator.subscribe(new GameOverEvent(), (ev) => count++);
    EventAggregator.publish(new GameOverEvent());
    EventAggregator.publish(new GameOverEvent());

    // Assert
    equal(count, 2, "Publish-and-then-subscriber called 2 times");
    EventAggregator.unsubscribe(new GameOverEvent(), token);
});

test("Event Aggregator. Unsubscribe works", function () {
    // Arrange
    var count = 0;
    var token = EventAggregator.subscribe(new GameOverEvent(), (ev) => count++);
    
    // Act
    EventAggregator.publish(new GameOverEvent());
    EventAggregator.unsubscribe(new GameOverEvent(), token);
    EventAggregator.publish(new GameOverEvent());

    // Assert
    equal(count, 1, "Publish called 2 times but subscriber called only once");
});