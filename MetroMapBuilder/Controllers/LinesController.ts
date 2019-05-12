import { Controller } from "./GridController";
import { SingleLineController } from "./SingleLineController";

export class LinesController implements Controller {    
    private currentFrom: Station = null;
    private currentTo: Station = null;

    private selectStation = e => this.handleSelectStation(e);
    private deselectStation = e => this.handleDeselectStation(e);

    private colors: Color[] = [Color.red, Color.yellow, Color.green, Color.blue, Color.brown, Color.orange, Color.black];

    private lineControllers: SingleLineController[] = [];
           
    public constructor(private map: HTMLElement, private stations: Station[]) {
        this.initialize(stations);
    }

    public next(): Controller {
        throw new Error("Method not implemented.");
    }

    public dispose(): void {
        throw new Error("Method not implemented.");
    }

    private initialize(stations: Station[]): void {
        for (var i = 0; i < stations.length; i++) {
            stations[i].circle.addEventListener("click", this.selectStation);
            stations[i].circle.addEventListener("contextmenu", this.deselectStation);
        }

        document.getElementById("addLine").addEventListener("click", this.addLine);
    }

    private handleSelectStation(event: MouseEvent): void {
        var selected = this.stations.find((s, index, st) => event.target == s.circle);

        if (this.currentFrom == null) {
            this.currentFrom = selected;
            return;
        }

        this.currentTo = selected;
        this.addConnection();
    }

    private handleDeselectStation(event: MouseEvent): void {
        
    }

    private addConnection(): void {

    }

    private addLine(): void {
        let lineController = new SingleLineController(this.changeLine, this.changeColor, this.removeLine, this.colors);
        this.lineControllers.push(lineController);
    }

    private removeLine(id: number): void {

    }

    private changeColor(id: number, color: string): void {

    }

    private changeLine(id: number): void {

    }    
}