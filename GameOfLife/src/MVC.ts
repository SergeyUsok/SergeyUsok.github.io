/// <reference path="Models.ts" />
/// <reference path="Core.ts" />
/// <reference path="UnitStates.ts" />

namespace MVC {
    export class GameController {

        private game: Core.Game;
        private pauseRequested: boolean = true;
        private state: GameState = GameState.NotStarted;
        private generations: Models.Generation[];
        private cursor: number;

        public constructor(private readonly view: View) {
            this.view.onNewGame(() => this.new());
            this.view.onRandomGame(() => this.randomGame());
            this.view.onGameStateChanged(() => this.gameStateChanged());
            this.view.onNext(() => this.next());
            this.view.onPrevoius(() => this.previous());
        }

        public new() {
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
            let generation = this.game.nextGeneration();
            this.generations.push(generation);
            this.cursor = this.generations.length - 1;
            this.view.renderGeneration(generation);
        }

        private resetToNotStartedState() {
            this.state = GameState.NotStarted;
            this.pauseRequested = true;
            this.view.showNotStartedState();
            this.generations = [];
            this.cursor = 0;
        }

        private previous(): void {
            this.cursor--;
            this.checkPreviousAvailable();
            this.view.renderGeneration(this.generations[this.cursor]);
        }

        private next(): void {
            this.cursor++;
            this.checkPreviousAvailable();

            if (this.cursor >= this.generations.length)
                this.getNewGeneration();
            else
                this.view.renderGeneration(this.generations[this.cursor]);
        }

        private checkPreviousAvailable(): void {
            this.view.changePrevButtonState(this.cursor == 0);
        }

        private randomGame() {

        }
    }

    export class View {

        public constructor(private _width: number, private _height: number) {

            $("#widthInput").on("input", () => this.updateWidth())
                .val(_width.toString());

            $("#heightInput").on("input", () => this.updateHeight())
                .val(_height.toString());

            $("#widthUp").click(() => this.widthUp());
            $("#widthDown").click(() => this.widthDown());
            $("#heightUp").click(() => this.heightUp());
            $("#heightDown").click(() => this.heightDown());
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

        public onNext(callback: () => void): void {
            $("#nextBtn").click(callback);
        }

        public onPrevoius(callback: () => void): void {
            $("#prevBtn").click(callback);
        }

        public onNewGame(callback: () => void): void {
            $("#newGameBtn").click(callback);
        }

        public onRandomGame(callback: () => void): void {
            $("#randomBtn").click(callback);
        }

        public renderInitialBoard(changeState: (x: number, y: number) => UnitStates.State): void {

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
            $("#prevBtn").prop("disabled", true);
            $("#nextBtn").prop("disabled", true);
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
                let [x, y] = tile.id.split('-'); // Array Destructuring
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
                this._width = parseInt($("#widthInput").val());
            }
            else {
                // do not allow to input incorrect value and set up previous one
                $("#widthInput").val(this._width.toString());
            }
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
            $("#widthInput").val((++this._width).toString());
        }

        private widthDown(): void {
            let temp = this._width - 1;
            if (temp > 0)
            {
                this._width = temp;
                $("#widthInput").val(temp.toString());
            }
        }

        private heightUp(): void {
            $("#heightInput").val((++this._height).toString());
        }

        private heightDown(): void {
            let temp = this._height - 1;
            if (temp > 0)
            {
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

$(document).ready(() => {
    let view = new MVC.View(34, 20);
    let game = new MVC.GameController(view);
    game.new();
});
