/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />
var RulesCache;
(function (RulesCache) {
    class Rule {
        countAliveNeighbors(unit, generation) {
            let aliveNeighborsCount = 0;
            for (let neighbor of this.getNeighbors(unit, generation)) {
                if (neighbor.state instanceof states.AliveState)
                    aliveNeighborsCount++;
            }
            return aliveNeighborsCount;
        }
        *getNeighbors(unit, generation) {
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    // skip current
                    if (i == 0 && j == 0)
                        continue;
                    let neighborX = this.getCoordinate(unit.x + i, generation.width);
                    let neighborY = this.getCoordinate(unit.y + j, generation.height);
                    yield generation.getUnit(neighborX, neighborY);
                }
            }
        }
        getCoordinate(maybeValidCoord, border) {
            if (maybeValidCoord < 0)
                return border - 1;
            if (maybeValidCoord >= border)
                return 0;
            return maybeValidCoord;
        }
    }
    RulesCache.Rule = Rule;
    class AliveRule extends Rule {
        execute(unit, generation) {
            let aliveNeighborsCount = this.countAliveNeighbors(unit, generation);
            if (window && window.navigator && window.navigator.userAgent && /Edge\/1[0-4]\./.test(window.navigator.userAgent)) {
                // Fix for bug in Microsoft Edge: https://github.com/Microsoft/ChakraCore/issues/1415#issuecomment-246424339
                // Construct function from SO: https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
                return aliveNeighborsCount >= 2 && aliveNeighborsCount < 4 ?
                    unit :
                    construct(Models.Unit, unit.x, unit.y, construct(states.DeadState));
            }
            return aliveNeighborsCount >= 2 && aliveNeighborsCount < 4 ?
                unit :
                new Models.Unit(unit.x, unit.y, new states.DeadState());
        }
    }
    class DeadRule extends Rule {
        execute(unit, generation) {
            let aliveNeighborsCount = this.countAliveNeighbors(unit, generation);
            if (window && window.navigator && window.navigator.userAgent && /Edge\/1[0-4]\./.test(window.navigator.userAgent)) {
                // Fix for bug in Microsoft Edge: https://github.com/Microsoft/ChakraCore/issues/1415#issuecomment-246424339
                // Construct function from SO: https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
                return aliveNeighborsCount == 3 ?
                    construct(Models.Unit, unit.x, unit.y, construct(states.AliveState)) :
                    unit;
            }
            return aliveNeighborsCount == 3 ?
                new Models.Unit(unit.x, unit.y, new states.AliveState()) :
                unit;
        }
    }
    let cache = getCache();
    function getRule(rule) {
        if (!cache.has(rule))
            throw new Error(`Provided ${rule} is not present in cache`);
        return cache.get(rule);
    }
    RulesCache.getRule = getRule;
    function getCache() {
        let cache = new Map();
        cache.set("Dead", new DeadRule());
        cache.set("Alive", new AliveRule());
        return cache;
    }
    function construct(cls, ...args) {
        return new (Function.prototype.bind.apply(cls, arguments));
    }
})(RulesCache || (RulesCache = {}));
/// <reference path="Rules.ts" />
var UnitStates;
(function (UnitStates) {
    class AliveState {
        constructor() {
            this.name = "Alive";
        }
        getRule() {
            return RulesCache.getRule(this.name);
        }
    }
    UnitStates.AliveState = AliveState;
    class DeadState {
        constructor() {
            this.name = "Dead";
        }
        getRule() {
            return RulesCache.getRule(this.name);
        }
    }
    UnitStates.DeadState = DeadState;
})(UnitStates || (UnitStates = {}));
/// <reference path="UnitStates.ts" />
var states = UnitStates; // just to try use import keyword
var Models;
(function (Models) {
    class Generation {
        constructor(width, height) {
            this._population = 0;
            this.width = width;
            this.height = height;
            this.board = this.initializeBoard(width, height);
        }
        get population() {
            return this._population;
        }
        add(unit) {
            if (this.board[unit.y][unit.x].state instanceof states.AliveState &&
                unit.state instanceof states.DeadState) {
                this._population--;
            }
            else if (this.board[unit.y][unit.x].state instanceof states.DeadState &&
                unit.state instanceof states.AliveState) {
                this._population++;
            }
            this.board[unit.y][unit.x] = unit;
        }
        getUnit(x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                throw new RangeError(`Provided x=${x} and y=${y} out of board borders`);
            let unit = this.board[y][x];
            return unit;
        }
        *[Symbol.iterator]() {
            for (let row of this.board) {
                for (let unit of row) {
                    yield unit;
                }
            }
        }
        initializeBoard(width, height) {
            let result = [];
            for (let y = 0; y < height; y++) {
                result[y] = [];
                for (let x = 0; x < width; x++) {
                    result[y][x] = new Unit(x, y, new states.DeadState());
                }
            }
            return result;
        }
    }
    Models.Generation = Generation;
    class Unit {
        constructor(x, y, state) {
            this.state = state;
            this.x = x;
            this.y = y;
        }
    }
    Models.Unit = Unit;
})(Models || (Models = {}));
/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />
var Core;
(function (Core) {
    class Game {
        constructor(zeroGeneration) {
            this.history = [];
            this.history.push(zeroGeneration);
        }
        nextGeneration() {
            let last = this.history[this.history.length - 1];
            var newGeneration = new Models.Generation(last.width, last.height);
            for (let unit of last) {
                let rule = unit.state.getRule();
                let newUnit = rule.execute(unit, last);
                newGeneration.add(newUnit);
            }
            let gameOverResult = this.isGameOver(last, newGeneration);
            this.history.push(newGeneration);
            return {
                generation: newGeneration,
                isGameOver: gameOverResult.marker,
                reason: gameOverResult.reason
            };
        }
        // there are 2 possible ways to end game:
        // 1. New generation has zero population
        // 2. Game came to a stable state and no changes in generations expected
        isGameOver(oldGen, newGen) {
            if (newGen.population == 0) {
                return {
                    reason: "The game came to zero population",
                    marker: true
                };
            }
            for (let oldUnit of oldGen) {
                let newUnit = newGen.getUnit(oldUnit.x, oldUnit.y);
                if (newUnit.state.name !== oldUnit.state.name) {
                    return {
                        reason: "",
                        marker: false
                    };
                }
            }
            return {
                reason: "The game came to a stable state",
                marker: true
            };
        }
    }
    Core.Game = Game;
    class ZeroGenerationProvider {
        getEmptyGeneration(width, height) {
            return new Models.Generation(width, height);
        }
        getRandomGeneration(width, height) {
            let zeroGeneration = new Models.Generation(width, height);
            let flattened = this.flattenBoard(width, height);
            let target = this.getTargetCount(width, height);
            for (let i = 1; i <= target; i++) {
                let index = this.getRandom(1, flattened.length) - 1; // since index zero based subtract 1
                let pair = flattened[index];
                flattened.splice(index, 1); // remove already used item
                let unit = new Models.Unit(pair.x, pair.y, new states.AliveState());
                zeroGeneration.add(unit);
            }
            return zeroGeneration;
        }
        // board like:
        // | 1 | 2 | 3 |
        // | 4 | 5 | 6 |
        // will become like
        // 1 2 3 4 5 6
        flattenBoard(width, height) {
            let flattened = [];
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    flattened.push({ x, y });
                }
            }
            return flattened;
        }
        getTargetCount(width, height) {
            const lowerBound = 10; // lower percent of alive units
            const upperBound = 70; // upper percent of alive units
            let totalSize = width * height;
            // get number of percent (from 10 to 70) of board that should be filled by alive units
            let actualPercent = this.getRandom(lowerBound, upperBound);
            // calculate actual number of alive units
            let target = actualPercent / 100 * totalSize;
            return Math.round(target);
        }
        getRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
    Core.ZeroGenerationProvider = ZeroGenerationProvider;
})(Core || (Core = {}));
class EventAggregator {
    constructor() {
        this.subscribers = new Map();
    }
    subscribe(event, action) {
        let key = event.name;
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(action);
        return this.subscribers.get(key).length - 1;
    }
    unsubscribe(event, token) {
        let key = event.name;
        if (!this.subscribers.has(key)) {
            return;
        }
        let array = this.subscribers.get(key);
        array[token] = null; // reset the corresponding action
        if (array.every(a => a == null))
            this.subscribers.delete(key); // since no subscribers left remove specified key
    }
    publish(event) {
        let key = event.name;
        if (!this.subscribers.has(key)) {
            return;
        }
        for (let action of this.subscribers.get(key)) {
            if (action != null)
                action(event);
        }
    }
}
class GameOverEvent {
    constructor() {
        this.name = "GameOverEvent";
    }
}
class GameEvent {
    constructor() {
        this.name = "GameEvent";
    }
}
class NewGameEvent {
    constructor() {
        this.name = "NewGameEvent";
    }
}
class GameState {
}
class NotStartedState extends GameState {
    constructor() {
        super(...arguments);
        this.name = "NotStartedState";
    }
    apply() {
    }
    dispose() {
    }
}
class RunningState extends GameState {
    constructor() {
        super(...arguments);
        this.name = "RunningState";
    }
    apply() {
    }
    dispose() {
    }
}
class PausedState extends GameState {
    constructor() {
        super(...arguments);
        this.name = "PausedState";
    }
    apply() {
    }
    dispose() {
    }
}
class GameOverState extends GameState {
    constructor() {
        super(...arguments);
        this.name = "GameOverState";
    }
    apply() {
    }
    dispose() {
    }
}
/// <reference path="Models.ts" />
/// <reference path="Core.ts" />
/// <reference path="UnitStates.ts" />
var MVC;
(function (MVC) {
    class GameController {
        constructor(view) {
            this.view = view;
            this.pauseRequested = true;
            this.state = GameState.NotStarted;
            this.gen0Provider = new Core.ZeroGenerationProvider();
            this.view.onNewGame(() => this.new());
            this.view.onRandomGame(() => this.randomGame());
            this.view.onGameStateChanged(() => this.gameStateChanged());
            this.view.onNext(() => this.next());
            this.view.onPrevoius(() => this.previous());
        }
        new() {
            this.resetToNotStartedState();
            let initialGen = this.gen0Provider.getEmptyGeneration(this.view.width, this.view.height);
            this.game = new Core.Game(initialGen);
            // render empty board with callback that allows on/off alive cells
            this.view.renderInitialBoard((x, y) => this.updateUnitState(x, y));
        }
        gameStateChanged() {
            switch (this.state) {
                case GameState.NotStarted:
                    this.view.makeTilesInactive();
                case GameState.Paused:
                    this.pauseRequested = false;
                    this.runGame();
                    break;
                case GameState.Running:
                    this.pauseGame();
                    break;
            }
        }
        pauseGame() {
            this.state = GameState.Paused;
            this.pauseRequested = true;
            this.view.showPausedState();
            this.checkPreviousAvailable();
        }
        runGame() {
            if (this.pauseRequested)
                return;
            this.state = GameState.Running;
            this.view.showRunningState();
            this.getNewGeneration();
            setTimeout(() => this.runGame(), 1000);
        }
        getNewGeneration() {
            let result = this.game.nextGeneration();
            this.cursor = this.game.history.length - 1;
            this.view.renderGeneration(result.generation);
            this.view.updateGenNumber(this.cursor);
            this.view.updatePopulation(result.generation.population);
            if (result.isGameOver) {
                this.gameOver(result.reason);
            }
        }
        gameOver(reason) {
            this.pauseRequested = true;
            this.view.showGameOver(reason);
        }
        resetToNotStartedState() {
            this.state = GameState.NotStarted;
            this.pauseRequested = true;
            this.view.showNotStartedState();
            this.cursor = 0;
            this.view.updateGenNumber(0);
            this.view.updatePopulation(0);
        }
        previous() {
            this.cursor--;
            this.checkPreviousAvailable();
            this.view.renderGeneration(this.game.history[this.cursor]);
            this.view.updateGenNumber(this.cursor);
            this.view.updatePopulation(this.game.history[this.cursor].population);
        }
        next() {
            this.cursor++;
            this.checkPreviousAvailable();
            if (this.cursor >= this.game.history.length)
                this.getNewGeneration();
            else {
                this.view.renderGeneration(this.game.history[this.cursor]);
                this.view.updateGenNumber(this.cursor);
                this.view.updatePopulation(this.game.history[this.cursor].population);
            }
        }
        checkPreviousAvailable() {
            this.view.changePrevButtonState(this.cursor == 0);
        }
        randomGame() {
            this.resetToNotStartedState();
            let initialGen = this.gen0Provider.getRandomGeneration(this.view.width, this.view.height);
            this.game = new Core.Game(initialGen);
            // render empty board with callback that allows on/off alive cells
            this.view.renderInitialBoard((x, y) => this.updateUnitState(x, y), initialGen);
            this.view.updatePopulation(initialGen.population);
        }
        updateUnitState(x, y) {
            let initialGen = this.game.history[0];
            let unit = initialGen.getUnit(x, y);
            let newUnit;
            if (unit.state instanceof UnitStates.AliveState) {
                newUnit = new Models.Unit(unit.x, unit.y, new UnitStates.DeadState());
            }
            else {
                newUnit = new Models.Unit(unit.x, unit.y, new UnitStates.AliveState());
            }
            initialGen.add(newUnit);
            this.view.updatePopulation(initialGen.population);
            return newUnit.state;
        }
    }
    MVC.GameController = GameController;
    class View {
        constructor() {
            this._height = 20; // default height
            this.maxWidth = this.calculateMaxWidth();
            this._width = this.maxWidth;
            $("#widthInput").on("input", () => this.updateWidth())
                .val(this.maxWidth.toString());
            $("#heightInput").on("input", () => this.updateHeight())
                .val(this._height.toString());
            $("#widthUp").click(() => this.widthUp());
            $("#widthDown").click(() => this.widthDown());
            $("#heightUp").click(() => this.heightUp());
            $("#heightDown").click(() => this.heightDown());
        }
        calculateMaxWidth() {
            let availableWidth = $("#board-container").width();
            const tileWidth = 30; // div width
            return Math.floor(availableWidth / tileWidth);
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        onGameStateChanged(callback) {
            $("#game-state-controller").click(callback);
        }
        updatePopulation(population) {
            $("#pop-count").html(population.toString());
            if (population > 0 && $("#game-state-controller").prop('disabled'))
                $("#game-state-controller").prop('disabled', false);
            else if (population == 0 && !$("#game-state-controller").prop('disabled'))
                $("#game-state-controller").prop('disabled', true);
        }
        updateGenNumber(genNumber) {
            $("#gen-count").html(genNumber.toString());
        }
        showGameOver(reason) {
            $(".game-over-block").show("slow");
            $(".reason").html(reason);
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
            $("#game-state-controller").prop("disabled", true);
        }
        onNext(callback) {
            $("#nextBtn").click(callback);
        }
        onPrevoius(callback) {
            $("#prevBtn").click(callback);
        }
        onNewGame(callback) {
            $("#newGameBtn").click(callback);
            $(window).on('resize', () => {
                let tempWidth = this.calculateMaxWidth();
                if (tempWidth != this.maxWidth) {
                    this.maxWidth = tempWidth;
                    this._width = this.maxWidth;
                    callback();
                }
            });
        }
        onRandomGame(callback) {
            $("#randomBtn").click(callback);
        }
        renderInitialBoard(changeState, board) {
            $("#board-container").empty();
            for (let y = 0; y < this.height; y++) {
                let row = $("<div/>").addClass("row").get(0);
                for (let x = 0; x < this.width; x++) {
                    let tile = $("<div/>").attr("id", `${x}-${y}`)
                        .addClass("tile notstarted")
                        .get(0);
                    if (board && board.getUnit(x, y).state instanceof UnitStates.AliveState) {
                        $("<div/>").addClass("alive").appendTo(tile);
                    }
                    this.attachOnClickHandler(tile, changeState);
                    row.appendChild(tile);
                }
                $("#board-container").append(row);
            }
        }
        renderGeneration(generation) {
            for (let unit of generation) {
                let tile = $(`#${unit.x}-${unit.y}`).get(0);
                if (unit.state instanceof UnitStates.AliveState && !tile.hasChildNodes()) {
                    $("<div/>").addClass("alive").appendTo(tile);
                }
                else if (unit.state instanceof UnitStates.DeadState && tile.hasChildNodes()) {
                    tile.lastElementChild.remove();
                }
            }
        }
        makeTilesInactive() {
            $("#board-container").find(".tile")
                .off("click")
                .removeClass("notstarted");
        }
        showRunningState() {
            $("#game-state-controller").html("Pause");
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
        }
        showNotStartedState() {
            $("#game-state-controller").html("Start");
            $("#game-state-controller").prop("disabled", false);
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
            $(".game-over-block").hide();
        }
        showPausedState() {
            $("#game-state-controller").html("Continue");
            $("#nextBtn").prop("disabled", false);
        }
        changePrevButtonState(disable) {
            $("#prevBtn").prop("disabled", disable);
        }
        attachOnClickHandler(tile, changeState) {
            // onclick event processing
            $(tile).click(() => {
                // get coordinates of clicked node 
                let [x, y] = tile.id.split('-'); // Array Destructuring
                // get state after click was processed
                let newState = changeState(parseInt(x), parseInt(y));
                // draw alive element if state is Alive
                if (newState instanceof UnitStates.AliveState) {
                    $("<div/>").addClass("alive").appendTo(tile);
                }
                else if (newState instanceof UnitStates.DeadState) {
                    tile.firstElementChild.remove();
                }
            });
        }
        updateWidth() {
            if (this.isValid($("#widthInput").val())) {
                let width = parseInt($("#widthInput").val());
                if (width <= this.maxWidth)
                    this._width = width;
            }
            // if new value is correct it will be set. If not set onld value
            $("#widthInput").val(this._width.toString());
        }
        updateHeight() {
            if (this.isValid($("#heightInput").val())) {
                this._height = parseInt($("#heightInput").val());
            }
            else {
                // do not allow to input incorrect value and set up previous one
                $("#heightInput").val(this._height.toString());
            }
        }
        widthUp() {
            let width = this._width + 1;
            if (width <= this.maxWidth)
                this._width = width;
            $("#widthInput").val(this._width.toString());
        }
        widthDown() {
            let temp = this._width - 1;
            if (temp > 0) {
                this._width = temp;
                $("#widthInput").val(temp.toString());
            }
        }
        heightUp() {
            $("#heightInput").val((++this._height).toString());
        }
        heightDown() {
            let temp = this._height - 1;
            if (temp > 0) {
                this._height = temp;
                $("#heightInput").val(temp.toString());
            }
        }
        isValid(maybeNumber) {
            let regex = new RegExp('^[0-9]+$');
            if (regex.test(maybeNumber))
                return parseInt(maybeNumber) > 0;
            return false;
        }
    }
    MVC.View = View;
    var GameState;
    (function (GameState) {
        GameState[GameState["NotStarted"] = 0] = "NotStarted";
        GameState[GameState["Running"] = 1] = "Running";
        GameState[GameState["Paused"] = 2] = "Paused";
    })(GameState || (GameState = {}));
})(MVC || (MVC = {}));
$(document).ready(() => {
    let view = new MVC.View();
    let game = new MVC.GameController(view);
    game.new();
});
/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />
var MVCNew;
(function (MVCNew) {
    class Game {
        next(generation) {
        }
    }
    class ZeroGenerationProvider {
    }
    class GameController {
        constructor() {
            let aggregator = new EventAggregator();
            this.stateMachine =
                StateMachine.startsFrom(new NotStartedState())
                    .on(new GameEvent()).moveTo(new RunningState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                    .after(s => s.dispose())
                    .and()
                    .for(new RunningState())
                    .on(new GameEvent()).moveTo(new PausedState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                    .on(new GameOverEvent()).moveTo(new GameOverState())
                    .after(s => s.dispose())
                    .and()
                    .for(new PausedState())
                    .on(new GameEvent()).moveTo(new RunningState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                    .on(new GameOverEvent()).moveTo(new GameOverState())
                    .and()
                    .for(new GameOverState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                    .done();
        }
    }
    MVCNew.GameController = GameController;
    class View {
        constructor() {
        }
    }
    MVCNew.View = View;
    class Button {
        constructor(id) {
        }
        disable() {
        }
        enable() {
        }
    }
})(MVCNew || (MVCNew = {}));
class StateMachine {
    constructor(initialState) {
        this.initialState = initialState;
        this.transishionsMap = new Map();
        this.preActionsMap = new Map();
        this.postActionsMap = new Map();
        this.currentState = initialState;
    }
    static startsFrom(state) {
        let stateMachine = new StateMachine(state);
        return new TriggerConfigurator(stateMachine, state);
    }
    addTransition(from, trigger, to) {
        let key = `${from.name}_${trigger.name}`;
        this.transishionsMap.set(key, to);
    }
    preAction(state, action) {
        this.preActionsMap.set(state.name, action);
    }
    postAction(state, action) {
        this.postActionsMap.set(state.name, action);
    }
    nextState(trigger) {
        let key = `${this.currentState.name}_${trigger.name}`;
        if (this.transishionsMap.has(key)) {
            if (this.postActionsMap.has(this.currentState.name)) {
                let postAction = this.postActionsMap.get(this.currentState.name);
                postAction(this.currentState);
            }
            this.currentState = this.transishionsMap.get(key);
            if (this.preActionsMap.has(this.currentState.name)) {
                let preAction = this.preActionsMap.get(this.currentState.name);
                preAction(this.currentState);
            }
        }
        return this.currentState;
    }
    toStart() {
        return this.initialState;
    }
}
class StateConfigurator {
    constructor(machine) {
        this.machine = machine;
    }
    for(state) {
        return new TriggerConfigurator(this.machine, state);
    }
}
class TriggerConfigurator {
    constructor(machine, state) {
        this.machine = machine;
        this.state = state;
    }
    on(trigger) {
        return new TransitionConfigurator(this.machine, this.state, trigger);
    }
    and() {
        return new StateConfigurator(this.machine);
    }
    before(action) {
        this.machine.preAction(this.state, action);
        return this;
    }
    after(action) {
        this.machine.postAction(this.state, action);
        return this;
    }
    done() {
        return this.machine;
    }
}
class TransitionConfigurator {
    constructor(machine, state, trigger) {
        this.machine = machine;
        this.state = state;
        this.trigger = trigger;
    }
    moveTo(destination) {
        this.machine.addTransition(this.state, this.trigger, destination);
        return new TriggerConfigurator(this.machine, this.state);
    }
}
//# sourceMappingURL=game.js.map