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
var states = UnitStates;
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
            this.pauseRequested = false;
            this.state = GameState.NotStarted;
            this.view.onNewGame(() => this.new());
            this.view.onRandomGame(this.randomGame);
            this.view.onGameStateChanged(() => this.gameStateChanged());
            this.view.onNext(() => this.next());
            this.view.onPrevoius(() => this.previous());
        }
        new() {
            this.resetToNotStartedState();
            this.game = Core.Game.createNew(this.view.width, this.view.height);
            let initialGen = this.game.currentGeneration;
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
            this.getNewGeneration();
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
            this.widthInput = document.getElementById("widthInput");
            this.widthInput.oninput = () => this.updateWidth();
            this.widthInput.value = _width.toString();
            this.heightInput = document.getElementById("heightInput");
            this.heightInput.oninput = () => this.updateHeight();
            this.heightInput.value = _height.toString();
            document.getElementById("widthUp").onclick = () => this.widthUp();
            document.getElementById("widthDown").onclick = () => this.widthDown();
            document.getElementById("heightUp").onclick = () => this.heightUp();
            document.getElementById("heightDown").onclick = () => this.heightDown();
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        onGameStateChanged(callback) {
            let gameStateBtn = document.getElementById("game-state-controller");
            //document.querySelector("")
            gameStateBtn.onclick = callback;
        }
        onNext(callback) {
            let startBtn = document.getElementById("nextBtn");
            startBtn.onclick = callback;
        }
        onPrevoius(callback) {
            let startBtn = document.getElementById("prevBtn");
            startBtn.onclick = callback;
        }
        onNewGame(callback) {
            let startBtn = document.getElementById("newGameBtn");
            startBtn.onclick = callback;
        }
        onRandomGame(callback) {
            let startBtn = document.getElementById("randomBtn");
            startBtn.onclick = callback;
        }
        renderInitialBoard(changeState) {
            let boardContainer = document.getElementById("board-container");
            this.clearChildren(boardContainer);
            for (let y = 0; y < this.height; y++) {
                let row = document.createElement("div");
                row.className = "row";
                for (let x = 0; x < this.width; x++) {
                    let tile = document.createElement("div");
                    tile.id = `${x}-${y}`;
                    tile.className = "tile-notstarted";
                    this.attachOnClickHandler(tile, changeState);
                    row.appendChild(tile);
                }
                boardContainer.appendChild(row);
            }
        }
        renderGeneration(generation) {
            let boardContainer = document.getElementById("board-container");
            this.clearChildren(boardContainer);
            for (let y = 0; y < this.height; y++) {
                let row = document.createElement("div");
                row.className = "row";
                for (let x = 0; x < this.width; x++) {
                    let tile = document.createElement("div");
                    tile.className = "tile";
                    row.appendChild(tile);
                    if (generation.getUnit(x, y).state instanceof UnitStates.AliveState) {
                        let aliveUnit = document.createElement("div");
                        aliveUnit.className = "alive";
                        tile.appendChild(aliveUnit);
                    }
                }
                boardContainer.appendChild(row);
            }
        }
        showRunningState() {
            let gameStateBtn = document.getElementById("game-state-controller");
            gameStateBtn.textContent = "Pause";
            document.getElementById("prevBtn").disabled = true;
            document.getElementById("nextBtn").disabled = true;
        }
        showNotStartedState() {
            let gameStateBtn = document.getElementById("game-state-controller");
            gameStateBtn.textContent = "Start";
            document.getElementById("prevBtn").disabled = true;
            document.getElementById("nextBtn").disabled = true;
        }
        showPausedState() {
            let gameStateBtn = document.getElementById("game-state-controller");
            gameStateBtn.textContent = "Continue";
            document.getElementById("nextBtn").disabled = false;
        }
        changePrevButtonState(disable) {
            document.getElementById("prevBtn").disabled = disable;
        }
        clearChildren(node) {
            while (node.lastChild) {
                node.removeChild(node.lastChild);
            }
        }
        attachOnClickHandler(tile, changeState) {
            // onclick event processing
            tile.onclick = () => {
                // get coordinates of clicked node 
                let [x, y] = tile.id.split('-'); // Array Destructuring
                // get state after click was processed
                let newState = changeState(parseInt(x), parseInt(y));
                // draw alive element if state is Alive
                if (newState instanceof UnitStates.AliveState) {
                    let aliveUnit = document.createElement("div");
                    aliveUnit.className = "alive";
                    tile.appendChild(aliveUnit);
                }
                else if (newState instanceof UnitStates.DeadState) {
                    tile.firstElementChild.remove();
                }
            };
        }
        updateWidth() {
            if (this.isValid(this.widthInput.value)) {
                this._width = parseInt(this.widthInput.value);
            }
            else {
                // do not allow to input incorrect value 
                this.widthInput.value = this.width.toString();
            }
        }
        updateHeight() {
            if (this.isValid(this.heightInput.value)) {
                this._height = parseInt(this.heightInput.value);
            }
            else {
                // do not allow to input incorrect value 
                this.heightInput.value = this.height.toString();
            }
        }
        widthUp() {
            this.widthInput.value = (++this._width).toString();
        }
        widthDown() {
            let temp = this._width - 1;
            if (temp > 0) {
                this._width = temp;
                this.widthInput.value = temp.toString();
            }
        }
        heightUp() {
            this.heightInput.value = (++this._height).toString();
        }
        heightDown() {
            let temp = this._height - 1;
            if (temp > 0) {
                this._height = temp;
                this.heightInput.value = temp.toString();
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
window.onload = () => {
    let view = new MVC.View(20, 10);
    let game = new MVC.GameController(view);
    game.new();
};
//# sourceMappingURL=game.js.map