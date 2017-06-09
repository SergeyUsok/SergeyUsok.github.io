/// <reference path="Models.ts" />
/// <reference path="GameCore.ts" />
/// <reference path="UnitStates.ts" />

namespace MVC {
    export class GameController {

        private readonly game: GameCore.Game = new GameCore.Game();
        private timerToken: number;
        private state: GameState = GameState.NotStarted;


        public constructor(private readonly view: View) {
            this.view.onNewGame(() => this.new());
            this.view.onRandomGame(this.randomGame);
            this.view.onGameStateChanged(() => this.gameStateChanged());
            this.view.onNext(this.next);
            this.view.onPrevoius(this.previous);
        }

        public new() {
            this.resetToNotStartedState();
            let initialGen = this.game.new(this.view.width, this.view.height); 
            this.view.renderInitialBoard((x, y) => {
                let unit = initialGen.getUnit(x, y);
                if (unit.state instanceof UnitStates.AliveState)
                    unit.state = new UnitStates.DeadState();
                else if (unit.state instanceof UnitStates.DeadState)
                    unit.state = new UnitStates.AliveState();
                return unit.state;
            });
        }

        public gameStateChanged() {
            switch (this.state) {
                case GameState.NotStarted:
                case GameState.Paused:
                    this.runGame();
                    break;
                case GameState.Running:
                    this.pauseGame();
                    break;
            }
        }

        private pauseGame() {
            this.state = GameState.Paused;
            this.view.showPausedState();
            clearTimeout(this.timerToken);
        }

        private runGame() {
            this.state = GameState.Running;
            this.view.showRunningState();
            this.timerToken = setInterval(() => {
                let generation = this.game.nextGeneration();
                this.view.renderGeneration(generation);
            }, 1000);
        }

        private resetToNotStartedState() {
            this.state = GameState.NotStarted;
            this.view.showNotStartedState();
            if (this.timerToken !== undefined)
                clearTimeout(this.timerToken);
        }

        private previous() {

        }

        private next() {

        }

        private randomGame() {

        }
    }

    export class View {

        private widthInput: HTMLInputElement;
        private heightInput: HTMLInputElement;

        public constructor(private _width: number, private _height: number) {
            this.widthInput = <HTMLInputElement>document.getElementById("widthInput");
            this.widthInput.oninput = () => this.updateWidth();
            this.widthInput.value = _width.toString();
            this.heightInput = <HTMLInputElement>document.getElementById("heightInput");
            this.heightInput.oninput = () => this.updateHeight();
            this.heightInput.value = _height.toString();

            document.getElementById("widthUp").onclick = () => this.widthUp();
            document.getElementById("widthDown").onclick = () => this.widthDown();
            document.getElementById("heightUp").onclick = () => this.heightUp();
            document.getElementById("heightDown").onclick = () => this.heightDown();
        }

        public get width(): number {
            return this._width;
        }

        public get height(): number {
            return this._height;
        }

        public onGameStateChanged(callback: () => void): void {
            let gameStateBtn = document.getElementById("game-state-controller");
            //document.querySelector("")
            gameStateBtn.onclick = callback;
        }

        public onNext(callback: () => void): void {
            let startBtn = document.getElementById("nextBtn");
            startBtn.onclick = callback;
        }

        public onPrevoius(callback: () => void): void {
            let startBtn = document.getElementById("prevBtn");
            startBtn.onclick = callback;
        }

        public onNewGame(callback: () => void): void {
            let startBtn = document.getElementById("newGameBtn");
            startBtn.onclick = callback;
        }

        public onRandomGame(callback: () => void): void {
            let startBtn = document.getElementById("randomBtn");
            startBtn.onclick = callback;
        }

        public renderInitialBoard(changeState: (x: number, y: number) => UnitStates.State): void {
            let boardContainer = document.getElementById("board-container");
            this.clearChildren(boardContainer);
            for (let y = 0; y < this.height; y++)
            {
                let row = document.createElement("div");
                row.className = "row";
                for (let x = 0; x < this.width; x++)
                {
                    let tile = document.createElement("div");
                    tile.id = `${x}-${y}`;
                    tile.className = "tile-notstarted";
                    this.attachOnClickHandler(tile, changeState);
                    row.appendChild(tile);
                }

                boardContainer.appendChild(row);
            }
        }

        public renderGeneration(generation: Models.Generation): void {
            let boardContainer = document.getElementById("board-container");
            this.clearChildren(boardContainer);

            for (let y = 0; y < this.height; y++) {
                let row = document.createElement("div");
                row.className = "row";
                for (let x = 0; x < this.width; x++) {
                    let tile = document.createElement("div");
                    tile.className = "tile";
                    row.appendChild(tile);
                    if (generation.getUnit(x, y).state instanceof UnitStates.AliveState)
                    {
                        let aliveUnit = document.createElement("div");
                        aliveUnit.className = "alive";
                        tile.appendChild(aliveUnit);
                    }
                }

                boardContainer.appendChild(row);
            }
        }

        public showRunningState(): void {
            let gameStateBtn = document.getElementById("game-state-controller");
            gameStateBtn.textContent = "Pause";
            (<HTMLInputElement>document.getElementById("prevBtn")).disabled = true;
            (<HTMLInputElement>document.getElementById("nextBtn")).disabled = true;
        }

        public showNotStartedState(): void {
            let gameStateBtn = document.getElementById("game-state-controller");
            gameStateBtn.textContent = "Start";
            (<HTMLInputElement>document.getElementById("prevBtn")).disabled = true;
            (<HTMLInputElement>document.getElementById("nextBtn")).disabled = true;
        }

        public showPausedState(): void {
            let gameStateBtn = document.getElementById("game-state-controller");
            gameStateBtn.textContent = "Continue";
            (<HTMLInputElement>document.getElementById("prevBtn")).disabled = false;
            (<HTMLInputElement>document.getElementById("nextBtn")).disabled = false;
        }

        private clearChildren(node: HTMLElement) {
            while (node.lastChild) {
                node.removeChild(node.lastChild);
            }
        }

        private attachOnClickHandler(tile: HTMLDivElement, changeState: (x: number, y: number) => UnitStates.State): void {
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
                // remove child Alive element if state is Dead
                else if (newState instanceof UnitStates.DeadState) {
                    tile.firstElementChild.remove();
                }
            };
        }

        private updateWidth(): void {
            if (this.isValid(this.widthInput.value))
            {
                this._width = parseInt(this.widthInput.value);
            }
            else
            {
                // do not allow to input incorrect value 
                this.widthInput.value = this.width.toString();
            }
        }

        private updateHeight(): void {
            if (this.isValid(this.heightInput.value)) {
                this._height = parseInt(this.heightInput.value);
            }
            else {
                // do not allow to input incorrect value 
                this.heightInput.value = this.height.toString();
            }
        }

        private widthUp(): void {
            this.widthInput.value = (++this._width).toString();
        }

        private widthDown(): void {
            let temp = this._width - 1;
            if (temp > 0)
            {
                this._width = temp;
                this.widthInput.value = temp.toString();
            }
        }

        private heightUp(): void {
            this.heightInput.value = (++this._height).toString();
        }

        private heightDown(): void {
            let temp = this._height - 1;
            if (temp > 0)
            {
                this._height = temp;
                this.heightInput.value = temp.toString();
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

window.onload = () => {

    let view = new MVC.View(20, 10);
    let game = new MVC.GameController(view);
    game.new();
};

// add checks for x and y in add method of universe
// probably remove iterator from Universe and add setter to board
// add Height and Width properties to Universe
// add Game class
// declare
// unit tests
// add control for increment/decrement text box
// do not allow row to move on next line