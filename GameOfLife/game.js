/// <reference path="Rules.ts" />
var UnitStates;
(function (UnitStates) {
    class AliveState {
        constructor() {
            this.name = "Alive";
        }
        getRule() {
            return new Rules.AliveRule();
        }
    }
    UnitStates.AliveState = AliveState;
    class DeadState {
        constructor() {
            this.name = "Dead";
        }
        getRule() {
            return new Rules.DeadRule();
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
            if (this.board[unit.y][unit.x] == null) {
                if (unit.state instanceof states.AliveState)
                    this._population++;
            }
            else if (this.board[unit.y][unit.x].state instanceof states.AliveState &&
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
                    result[y][x] = null;
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
var Rules;
(function (Rules) {
    class Rule {
        countAliveNeighbors(unit, generation) {
            let aliveNeighborsCount = 0;
            for (let neighbor of this.getNeighbors(unit, generation)) {
                if (neighbor.state instanceof UnitStates.AliveState)
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
    Rules.Rule = Rule;
    class AliveRule extends Rule {
        execute(unit, generation) {
            let aliveNeighborsCount = this.countAliveNeighbors(unit, generation);
            return aliveNeighborsCount >= 2 && aliveNeighborsCount < 4 ?
                unit :
                new Models.Unit(unit.x, unit.y, new UnitStates.DeadState());
        }
    }
    Rules.AliveRule = AliveRule;
    class DeadRule extends Rule {
        execute(unit, generation) {
            let aliveNeighborsCount = this.countAliveNeighbors(unit, generation);
            return aliveNeighborsCount == 3 ? new Models.Unit(unit.x, unit.y, new UnitStates.AliveState()) : unit;
        }
    }
    Rules.DeadRule = DeadRule;
})(Rules || (Rules = {}));
/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />
var Core;
(function (Core) {
    class Game {
        constructor(emptyGeneration) {
            this._currentGeneration = emptyGeneration;
        }
        static createNew(width, height) {
            let emptyGeneration = new Models.Generation(width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let unit = new Models.Unit(x, y, new UnitStates.DeadState());
                    emptyGeneration.add(unit);
                }
            }
            return new Game(emptyGeneration);
        }
        get currentGeneration() {
            return this._currentGeneration;
        }
        static fromRandomGeneration(width, height) {
        }
        nextGeneration() {
            var newGeneration = new Models.Generation(this._currentGeneration.width, this._currentGeneration.height);
            for (let unit of this._currentGeneration) {
                let rule = unit.state.getRule();
                let newUnit = rule.execute(unit, this._currentGeneration);
                newGeneration.add(newUnit);
            }
            let gameOverResult = this.isGameOver(this._currentGeneration, newGeneration);
            this._currentGeneration = newGeneration;
            return {
                generation: newGeneration,
                isGameOver: gameOverResult.marker,
                reason: gameOverResult.reason
            };
        }
        // there are 2 possible ways to end game:
        // 1. New generation has zero population
        // 2. Game came to a stable  state and no changes in generations expected
        isGameOver(oldGen, newGen) {
            if (newGen.population == 0) {
                return {
                    reason: "The game came to zero population",
                    marker: true
                };
            }
            for (var oldUnit of oldGen) {
                var newUnit = newGen.getUnit(oldUnit.x, oldUnit.y);
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
})(Core || (Core = {}));
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
            this.view.onNewGame(() => this.new());
            this.view.onRandomGame(() => this.randomGame());
            this.view.onGameStateChanged(() => this.gameStateChanged());
            this.view.onNext(() => this.next());
            this.view.onPrevoius(() => this.previous());
        }
        new() {
            this.resetToNotStartedState();
            this.game = Core.Game.createNew(this.view.width, this.view.height);
            let initialGen = this.game.currentGeneration;
            this.generations.push(initialGen);
            // render empty board with callback that allows on/off alive cells
            this.view.renderInitialBoard((x, y) => {
                let unit = initialGen.getUnit(x, y);
                if (unit.state instanceof UnitStates.AliveState) {
                    let newUnit = new Models.Unit(unit.x, unit.y, new UnitStates.DeadState());
                    initialGen.add(newUnit);
                    this.view.updatePopulation(initialGen.population);
                    return newUnit.state;
                }
                else {
                    let newUnit = new Models.Unit(unit.x, unit.y, new UnitStates.AliveState());
                    initialGen.add(newUnit);
                    this.view.updatePopulation(initialGen.population);
                    return newUnit.state;
                }
            });
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
            this.generations.push(result.generation);
            this.cursor = this.generations.length - 1;
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
            this.generations = [];
            this.cursor = 0;
            this.view.updateGenNumber(0);
            this.view.updatePopulation(0);
        }
        previous() {
            this.cursor--;
            this.checkPreviousAvailable();
            this.view.renderGeneration(this.generations[this.cursor]);
            this.view.updateGenNumber(this.cursor);
            this.view.updatePopulation(this.generations[this.cursor].population);
        }
        next() {
            this.cursor++;
            this.checkPreviousAvailable();
            if (this.cursor >= this.generations.length)
                this.getNewGeneration();
            else {
                this.view.renderGeneration(this.generations[this.cursor]);
                this.view.updateGenNumber(this.cursor);
                this.view.updatePopulation(this.generations[this.cursor].population);
            }
        }
        checkPreviousAvailable() {
            this.view.changePrevButtonState(this.cursor == 0);
        }
        randomGame() {
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
            window.onresize = () => {
                this.maxWidth = this.calculateMaxWidth();
                this._width = this.maxWidth;
                callback();
            };
        }
        onRandomGame(callback) {
            $("#randomBtn").click(callback);
        }
        renderInitialBoard(changeState) {
            $("#board-container").empty();
            for (let y = 0; y < this.height; y++) {
                let row = $("<div/>").addClass("row").get(0);
                for (let x = 0; x < this.width; x++) {
                    let tile = $("<div/>").attr("id", `${x}-${y}`)
                        .addClass("tile notstarted")
                        .get(0);
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
//# sourceMappingURL=game.js.map