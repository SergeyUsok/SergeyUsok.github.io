/// <reference path="Rules.ts" />
var UnitStates;
(function (UnitStates) {
    class AliveState {
        getRule() {
            return new Rules.AliveRule();
        }
    }
    UnitStates.AliveState = AliveState;
    class DeadState {
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
            this.width = width;
            this.height = height;
            this.board = this.initializeBoard(width, height);
        }
        add(unit) {
            this.board[unit.y][unit.x] = unit;
        }
        getUnit(x, y) {
            return this.board[y][x];
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
            this._currentGeneration = newGeneration;
            return newGeneration;
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
                if (unit.state instanceof UnitStates.AliveState)
                    unit.state = new UnitStates.DeadState();
                else if (unit.state instanceof UnitStates.DeadState)
                    unit.state = new UnitStates.AliveState();
                return unit.state;
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
            let generation = this.game.nextGeneration();
            this.generations.push(generation);
            this.cursor = this.generations.length - 1;
            this.view.renderGeneration(generation);
        }
        resetToNotStartedState() {
            this.state = GameState.NotStarted;
            this.pauseRequested = true;
            this.view.showNotStartedState();
            this.generations = [];
            this.cursor = 0;
        }
        previous() {
            this.cursor--;
            this.checkPreviousAvailable();
            this.view.renderGeneration(this.generations[this.cursor]);
        }
        next() {
            this.cursor++;
            this.checkPreviousAvailable();
            if (this.cursor >= this.generations.length)
                this.getNewGeneration();
            else
                this.view.renderGeneration(this.generations[this.cursor]);
        }
        checkPreviousAvailable() {
            this.view.changePrevButtonState(this.cursor == 0);
        }
        randomGame() {
        }
    }
    MVC.GameController = GameController;
    class View {
        constructor(_width, _height) {
            this._width = _width;
            this._height = _height;
            $("#widthInput").on("input", () => this.updateWidth())
                .val(_width.toString());
            $("#heightInput").on("input", () => this.updateHeight())
                .val(_height.toString());
            $("#widthUp").click(() => this.widthUp());
            $("#widthDown").click(() => this.widthDown());
            $("#heightUp").click(() => this.heightUp());
            $("#heightDown").click(() => this.heightDown());
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
        onNext(callback) {
            $("#nextBtn").click(callback);
        }
        onPrevoius(callback) {
            $("#prevBtn").click(callback);
        }
        onNewGame(callback) {
            $("#newGameBtn").click(callback);
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
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
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
                this._width = parseInt($("#widthInput").val());
            }
            else {
                // do not allow to input incorrect value and set up previous one
                $("#widthInput").val(this._width.toString());
            }
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
            $("#widthInput").val((++this._width).toString());
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
    let view = new MVC.View(34, 20);
    let game = new MVC.GameController(view);
    game.new();
});
//# sourceMappingURL=game.js.map