/// <reference path="Models.ts" />
/// <reference path="Core.ts" />
/// <reference path="UnitStates.ts" />

namespace MVC {
    export class GameController {

        private game: Core.Game;
        private pauseRequested: boolean = false;
        private state: GameState = GameState.NotStarted;
        private generations: Models.Generation[];
        private cursor: number;

        public constructor(private readonly view: View) {
            this.view.onNewGame(() => this.new());
            this.view.onRandomGame(this.randomGame);
            this.view.onGameStateChanged(() => this.gameStateChanged());
            this.view.onNext(() => this.next());
            this.view.onPrevoius(() => this.previous());
        }

        public new() {
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

        private gameStateChanged() {
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
            this.getNewGeneration();
        }

        private checkPreviousAvailable(): void {
            this.view.changePrevButtonState(this.cursor == 0);
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
            (<HTMLInputElement>document.getElementById("nextBtn")).disabled = false;
        }

        public changePrevButtonState(disable: boolean) {
            (<HTMLInputElement>document.getElementById("prevBtn")).disabled = disable;
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
