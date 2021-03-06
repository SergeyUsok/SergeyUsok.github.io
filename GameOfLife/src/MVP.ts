﻿/// <reference path="Models.ts" />
/// <reference path="Core.ts" />
/// <reference path="UnitStates.ts" />

namespace MVP {
    export class GamePresenter {

        private game: Core.Game;
        private pauseRequested: boolean = true;
        private state: GameState = GameState.NotStarted;
        private cursor: number;
        private gen0Provider: Core.ZeroGenerationProvider = new Core.ZeroGenerationProvider();

        public constructor(private readonly view: View) {
            this.view.onNewGame(() => this.new());
            this.view.onRandomGame(() => this.randomGame());
            this.view.onGameStateChanged(() => this.gameStateChanged());
            this.view.onNext(() => this.next());
            this.view.onPrevoius(() => this.previous());
        }

        public new() {
            this.resetToNotStartedState();
            let initialGen = this.gen0Provider.getEmptyGeneration(this.view.width, this.view.height);
            this.game = new Core.Game(initialGen);
            // render empty board with callback that allows on/off alive cells
            this.view.renderInitialBoard((x, y) => this.updateUnitState(x, y));
        }

        private gameStateChanged() {
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

        private pauseGame() {
            this.state = GameState.Paused;
            this.pauseRequested = true;
            this.view.showPausedState();
            this.checkPreviousAvailable();
        }

        private runGame() {
            if (this.pauseRequested)
                return;

            this.state = GameState.Running;
            this.view.showRunningState();
            this.getNewGeneration();
            setTimeout(() => this.runGame(), 1000);
        }

        private getNewGeneration() {
            let result = this.game.nextGeneration();
            this.cursor = this.game.history.length - 1;
            this.view.renderGeneration(result.generation);
            this.view.updateGenNumber(this.cursor);
            this.view.updatePopulation(result.generation.population);

            if (result.isGameOver) {
                this.gameOver(result.reason);
            }
        }

        private gameOver(reason: string): void {
            this.pauseRequested = true;
            this.view.showGameOver(reason);
        }

        private resetToNotStartedState() {
            this.state = GameState.NotStarted;
            this.pauseRequested = true;
            this.view.showNotStartedState();
            this.cursor = 0;
            this.view.updateGenNumber(0);
            this.view.updatePopulation(0);
        }

        private previous(): void {
            this.cursor--;
            this.checkPreviousAvailable();
            this.view.renderGeneration(this.game.history[this.cursor]);
            this.view.updateGenNumber(this.cursor);
            this.view.updatePopulation(this.game.history[this.cursor].population);
        }

        private next(): void {
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

        private checkPreviousAvailable(): void {
            this.view.changePrevButtonState(this.cursor === 0);
        }

        private randomGame() {
            this.resetToNotStartedState();
            let initialGen = this.gen0Provider.getRandomGeneration(this.view.width, this.view.height);
            this.game = new Core.Game(initialGen);
            // render empty board with callback that allows on/off alive cells
            this.view.renderInitialBoard((x, y) => this.updateUnitState(x, y), initialGen);
            this.view.updatePopulation(initialGen.population);
        }

        private updateUnitState(x: number, y: number): UnitStates.State {
            let initialGen = this.game.history[0];
            let unit = initialGen.getUnit(x, y);
            let newUnit: Models.Unit;
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

    export class View {

        private maxWidth: number;
        private _height: number = 20; // default height
        private _width: number;

        public constructor() {
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

        private calculateMaxWidth(): number {
            let availableWidth = $("#board-container").width();
            const tileWidth = 30; // div width
            return Math.floor(availableWidth / tileWidth);
        }

        public get width(): number {
            return this._width;
        }

        public get height(): number {
            return this._height;
        }

        public onGameStateChanged(callback: () => void): void {
            $("#game-state-controller").click(callback);
        }

        public updatePopulation(population: number): void {
            $("#pop-count").html(population.toString());

            if (population > 0 && $("#game-state-controller").prop("disabled"))
                $("#game-state-controller").prop("disabled", false);

            else if (population === 0 && !$("#game-state-controller").prop("disabled"))
                $("#game-state-controller").prop("disabled", true);

        }

        public updateGenNumber(genNumber: number): void {
            $("#gen-count").html(genNumber.toString());
        }

        public showGameOver(reason: string): void {
            $(".game-over-block").show("slow");
            $(".reason").html(reason);
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
            $("#game-state-controller").prop("disabled", true);
        }

        public onNext(callback: () => void): void {
            $("#nextBtn").click(callback);
        }

        public onPrevoius(callback: () => void): void {
            $("#prevBtn").click(callback);
        }

        public onNewGame(callback: () => void): void {
            $("#newGameBtn").click(callback);

            $(window).on("resize", () => {
                let tempWidth = this.calculateMaxWidth();
                if (tempWidth !== this.maxWidth) {
                    this.maxWidth = tempWidth;
                    this._width = this.maxWidth;
                    callback();
                }
            });
        }

        public onRandomGame(callback: () => void): void {
            $("#randomBtn").click(callback);
        }

        public renderInitialBoard(changeState: (x: number, y: number) => UnitStates.State, board?: Models.Generation): void {

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

        public renderGeneration(generation: Models.Generation): void {
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

        public makeTilesInactive(): void {
            $("#board-container").find(".tile")
                .off("click")
                .removeClass("notstarted");
        }

        public showRunningState(): void {
            $("#game-state-controller").html("Pause");
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
        }

        public showNotStartedState(): void {
            $("#game-state-controller").html("Start");
            $("#game-state-controller").prop("disabled", false);
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
            $(".game-over-block").hide();
        }

        public showPausedState(): void {
            $("#game-state-controller").html("Continue");
            $("#nextBtn").prop("disabled", false);
        }

        public changePrevButtonState(disable: boolean) {
            $("#prevBtn").prop("disabled", disable);
        }

        private attachOnClickHandler(tile: HTMLElement, changeState: (x: number, y: number) => UnitStates.State): void {
            // onclick event processing
            $(tile).click(() => {
                // get coordinates of clicked node 
                let [x, y] = tile.id.split("-"); // Array Destructuring
                // get state after click was processed
                let newState = changeState(parseInt(x), parseInt(y));
                // draw alive element if state is Alive
                if (newState instanceof UnitStates.AliveState) {
                    $("<div/>").addClass("alive").appendTo(tile);
                }
                // remove child Alive element if state is Dead
                else if (newState instanceof UnitStates.DeadState) {
                    tile.firstElementChild.remove();
                }
            });
        }

        private updateWidth(): void {
            if (this.isValid($("#widthInput").val())) {
                let width = parseInt($("#widthInput").val());
                if (width <= this.maxWidth)
                    this._width = width;
            }

            // if new value is correct it will be set. If not set onld value
            $("#widthInput").val(this._width.toString());
        }

        private updateHeight(): void {
            if (this.isValid($("#heightInput").val())) {
                this._height = parseInt($("#heightInput").val());
            }
            else {
                // do not allow to input incorrect value and set up previous one
                $("#heightInput").val(this._height.toString());
            }
        }

        private widthUp(): void {
            let width = this._width + 1;

            if (width <= this.maxWidth)
                this._width = width;

            $("#widthInput").val(this._width.toString());
        }

        private widthDown(): void {
            let temp = this._width - 1;
            if (temp > 0) {
                this._width = temp;
                $("#widthInput").val(temp.toString());
            }
        }

        private heightUp(): void {
            $("#heightInput").val((++this._height).toString());
        }

        private heightDown(): void {
            let temp = this._height - 1;
            if (temp > 0) {
                this._height = temp;
                $("#heightInput").val(temp.toString());
            }
        }

        private isValid(maybeNumber: string): boolean {
            let regex = new RegExp('^[0-9]+$');

            if (regex.test(maybeNumber))
                return parseInt(maybeNumber) > 0;

            return false;
        }
    }

    enum GameState {
        NotStarted,
        Running,
        Paused
    }
}
