/// <reference path="Core.ts" />
/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

namespace MVC {

    export class GameController {
        private game: Core.Game;
        private stateMachine: StateMachine<GameState, Trigger>;
        private gen0provider: Core.ZeroGenerationProvider = new Core.ZeroGenerationProvider();

        public constructor() {
            this.subscribeOnViewEvents();
            this.stateMachine = this.configureStateMachine();
        }

        private subscribeOnViewEvents(): void {
            EventAggregator.subscribe(new NewGameEvent(), e => this.createNewGame(e));
            EventAggregator.subscribe(new GameStateChangedEvent(), e => this.handleEvent(e));
            EventAggregator.subscribe(new RandomGameEvent(), e => this.createRandomGame(e));
        }

        private configureStateMachine(): StateMachine<GameState, Trigger> {
            let notStarted = new NotStartedState();
            let running = new RunningState();
            let paused = new PausedState();

            return StateMachine.startsFrom<GameState, Trigger>(notStarted)
                        .on(new GameStateChangedEvent()).moveTo(running)
                        .on(new NewGameEvent()).moveTo(notStarted)
                        .on(new RandomGameEvent()).moveTo(notStarted)
                        .after(s => s.dispose())
                    .and()
                    .for(running)
                        .before(g => EventAggregator.publish(new GameStartingEvent()))
                        .on(new GameStateChangedEvent()).moveTo(paused)
                        .on(new NewGameEvent()).moveTo(notStarted)
                        .on(new RandomGameEvent()).moveTo(notStarted)
                        .after(s => s.dispose())
                    .and()
                    .for(paused)
                        .before(g => EventAggregator.publish(new GamePausingEvent()))
                        .on(new GameStateChangedEvent()).moveTo(running)
                        .on(new NewGameEvent()).moveTo(notStarted)
                        .on(new RandomGameEvent()).moveTo(notStarted)
                        .after(s => s.dispose())
                    .done();
        }

        private createNewGame(event: NewGameEvent): void {
            let gen0 = this.gen0provider.getEmptyGeneration(event.width, event.height);
            this.game = new Core.Game(gen0);
            this.handleEvent(event);
        }

        private createRandomGame(event: RandomGameEvent): void {
            let gen0 = this.gen0provider.getRandomGeneration(event.width, event.height);
            this.game = new Core.Game(gen0);
            this.handleEvent(event);
        }

        private handleEvent(trigger: Trigger) {
            this.stateMachine.nextState(trigger).apply(this.game);
        }
    }

    export class View {
        private startButton: Button;
        private newGameButton: Button;
        private randomGameButton: Button;
        private nextButton: Button;
        private previousButton: Button;

        private widthSpin: SpinControl;
        private heightSpin: SpinControl;

        public constructor() {
            this.initializeButtons();
            this.initializeSpins();
            this.subscribeOnEvents();
        }

        public showNotStartedGame() {
            EventAggregator.publish(new NewGameEvent(this.widthSpin.value, this.heightSpin.value));
        }

        /// Initialization
        private subscribeOnEvents() {
            // subscribe on Controller events
            // game state events
            EventAggregator.subscribe(new InitializeGameEvent(), ev => this.renderInitialBoard(ev.generation));

            // game events
            EventAggregator.subscribe(new NewGenerationEvent(), ev => this.updateBoard(ev.generation, ev.generationNumber));
            EventAggregator.subscribe(new UnitUpdatedEvent(), ev => this.updateTileAndPopulation(ev.unit, ev.population));
            EventAggregator.subscribe(new HistoricalGenerationEvent(), ev => this.renderHistoricalGeneration(ev.generation, ev.generationNumber));
            EventAggregator.subscribe(new LeavingNotStartedStateEvent(), ev => this.makeTilesInactive());
            EventAggregator.subscribe(new GameStartingEvent(), ev => this.buttonsToRunningState());
            EventAggregator.subscribe(new GamePausingEvent(), ev => this.buttonsToPausedState());
            EventAggregator.subscribe(new GameOverEvent(), ev => this.showGameOver(ev.reason));

            // subscribe on UI buttons elements
            this.newGameButton.onClick(() => EventAggregator.publish(new NewGameEvent(this.widthSpin.value, this.heightSpin.value)));
            this.randomGameButton.onClick(() => EventAggregator.publish(new RandomGameEvent(this.widthSpin.value, this.heightSpin.value)));
            this.startButton.onClick(() => EventAggregator.publish(new GameStateChangedEvent()));
            this.nextButton.onClick(() => EventAggregator.publish(new NextGenerationEvent()));
            this.previousButton.onClick(() => EventAggregator.publish(new PrevGenerationEvent()));
        }

        private initializeButtons(): void {
            this.newGameButton = new Button("newGameBtn");
            this.randomGameButton = new Button("randomBtn");
            this.startButton = new Button("game-state-controller");
            this.nextButton = new Button("nextBtn");
            this.previousButton = new Button("prevBtn");
        }

        private initializeSpins(): void {
            let maxWidth = this.calculateMaxWidth();
            const height: number = 20; // default height
            this.widthSpin = new SpinControl("widthInput", "widthUp", "widthDown", maxWidth, maxWidth, 1);
            this.heightSpin = new SpinControl("heightInput", "heightUp", "heightDown", height, undefined, 1);

            $(window).on("resize", () => {
                let tempWidth = this.calculateMaxWidth();
                if (tempWidth !== this.widthSpin.value) {
                    this.widthSpin.updateMaximum(tempWidth);
                    EventAggregator.publish(new NewGameEvent(this.widthSpin.value, this.heightSpin.value));
                }
            });
        }

        //////////////////////////////////////////////////////////////////////////////
        private renderHistoricalGeneration(generation: Models.Generation, genNumber: number): void {
            this.updateBoard(generation, genNumber);

            if (genNumber == 0 && !this.previousButton.disabled)
                this.previousButton.disable();

            if (genNumber > 0 && this.previousButton.disabled)
                this.previousButton.enable();
        }

        private renderInitialBoard(board: Models.Generation) {
            $("#board-container").empty();

            for (let y = 0; y < board.height; y++) {
                let row = $("<div/>").addClass("row").get(0);

                for (let x = 0; x < board.width; x++) {

                    let tile = $("<div/>").attr("id", `${x}-${y}`)
                        .addClass("tile notstarted")
                        .get(0);

                    $(tile).click(() => EventAggregator.publish(new TileClickedEvent(x, y)));

                    if (board && board.getUnit(x, y).state instanceof UnitStates.AliveState) {
                        $("<div/>").addClass("alive").appendTo(tile);
                    }
                   
                    row.appendChild(tile);
                }

                $("#board-container").append(row);
            }

            this.updatePopulation(board.population);
            this.updateGenerationNumber(0);
            this.buttonsToNotStartedState();
        }

        private updateBoard(generation: Models.Generation, genNumber: number) {
            this.renderBoard(generation);
            this.updatePopulation(generation.population);
            this.updateGenerationNumber(genNumber);
            //this.updateChart(genNumber, generation.population);
        }        

        //private updateChart(genNumber: number, population: number) {
        //    var svg = <SVGPolylineElement><any>document.getElementById("line");

        //    svg.points.
        //}

        private renderBoard(generation: Models.Generation) {
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

        private updateTileAndPopulation(unit: Models.Unit, population: number) {
            let id = `${unit.x}-${unit.y}`;
            let tile = document.getElementById(id);

            // draw alive element if state is Alive
            if (unit.state instanceof UnitStates.AliveState) {
                $("<div/>").addClass("alive").appendTo(tile);
            }
            // remove child Alive element if state is Dead
            else if (unit.state instanceof UnitStates.DeadState) {
                tile.firstElementChild.remove();
            }

            this.updatePopulation(population);
        }

        private updatePopulation(population: number) {
            $("#pop-count").html(population.toString());

            if (population > 0)
                this.startButton.enable();
            else
                this.startButton.disable();
        }

        private updateGenerationNumber(genNumber: number) {
            $("#gen-count").html(genNumber.toString());
        }

        /// Handling game states ///////////////////////////////
        private buttonsToNotStartedState(): void {
            this.previousButton.disable();
            this.nextButton.disable();
            this.startButton.content = "Start";
            $(".game-over-block").hide();
        }
        
        private buttonsToRunningState(): void {
            this.previousButton.disable();
            this.nextButton.disable();
            this.startButton.content = "Pause";
        }

        private buttonsToPausedState(): void {
            this.previousButton.enable();
            this.nextButton.enable();
            this.startButton.content = "Continue";
        }

        private makeTilesInactive(): void {
            $("#board-container").find(".tile")
                .off("click")
                .removeClass("notstarted");
        }

        private showGameOver(reason: string): void {
            $(".game-over-block").show("slow");
            $(".reason").html(reason);
            this.previousButton.disable();
            this.nextButton.disable();
            this.startButton.disable();
        }
        //////////////////////////////////////////////////

        private calculateMaxWidth(): number {
            let availableWidth = $("#board-container").width();
            const tileWidth = 30; // div width
            return Math.floor(availableWidth / tileWidth);
        }
    }

    class Button implements Control {
        private readonly button: HTMLButtonElement;
        public constructor(id: string) {
            this.button = <HTMLButtonElement>document.getElementById(id);
        }

        public disable() {
            this.button.disabled = true;
        }

        public enable() {
            this.button.disabled = false;
        }

        public onClick(callback: () => void) {
            this.button.onclick = callback;
        }

        public get content(): string {
            return this.button.textContent;
        }

        public set content(content: string) {
            this.button.textContent = content;
        }

        public get disabled(): boolean {
            return this.button.disabled;
        }
    }

    class SpinControl implements Control {
        private _value: number;
        private input: HTMLInputElement;
        private upBtn: HTMLButtonElement;
        private downBtn: HTMLButtonElement;

        public constructor(textId: string, upId: string, downId: string, initial: number, private max?: number, private min?: number) {
            this.input = <HTMLInputElement>document.getElementById(textId);
            this.upBtn = <HTMLButtonElement>document.getElementById(upId);
            this.downBtn = <HTMLButtonElement>document.getElementById(downId);

            $(this.input).on("input", () => this.checkAndUpdate());
            $(this.upBtn).click(() => this.up());
            $(this.downBtn).click(() => this.down());

            this.setNewValue(initial);
        }

        private checkAndUpdate(): void {
            if (this.isValid(this.input.value)) {
                let value = parseInt(this.input.value);
                if (this.withinBounds(value)) {
                    this.setNewValue(value);
                    return;
                }   
            }

            this.input.value = this._value.toString(); // if value is invalid then leave old one
        }

        private withinBounds(value: number): boolean {
            return (this.max === undefined || value <= this.max) &&
                   (this.min === undefined || value >= this.min);
        }

        private setNewValue(value: number) {
            this._value = value;
            this.input.value = value.toString();

            if (this.max !== undefined && this.max === this._value)
                this.upBtn.disabled = true;
            else
                this.upBtn.disabled = false;

            if (this.min !== undefined && this.min === this._value)
                this.downBtn.disabled = true;
            else
                this.downBtn.disabled = false;
        }

        private up(): void {
            let potentialValue = this._value + 1;

            if (this.withinBounds(potentialValue))
                this.setNewValue(potentialValue);
        }

        private down(): void {
            let potentialValue = this._value - 1;

            if (this.withinBounds(potentialValue))
                this.setNewValue(potentialValue);
        }

        private isValid(maybeNumber: string): boolean {
            let regex = new RegExp('^[0-9]+$');
            return regex.test(maybeNumber);
        }

        public enable() {
        }

        public disable() {
        }

        public get value() {
            return this._value;
        }

        public updateMaximum(maximum: number): void {
            this.max = maximum;

            if (this._value > maximum)
                this._value = maximum;
        }
    }

    interface Control {
        disable();
        enable();
    }
}