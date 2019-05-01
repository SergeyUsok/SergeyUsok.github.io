import { Controller } from "./GridController";

export class LinesController implements Controller {    
    private currentFrom: Station = null;
    private currentTo: Station = null;
    private selectStation = e => this.handleClick(e);
    private deselectStation = e => this.handleRightClick(e);

    private currentLine: number = -1;
    private lineColors: string[] = [];
    private connections: Connection[] = [];
       
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
        document.getElementById("removeLine").addEventListener("click", this.removeLine);
        document.getElementById("changeColor").addEventListener("click", this.changeColor);
        document.getElementById("chooseLine").addEventListener("click", this.chooseLine);
    }

    private handleClick(event: MouseEvent): void {
        var selected = this.stations.find((s, index, st) => event.target == s.circle);

        if (this.currentFrom == null) {
            this.currentFrom = selected;
            return;
        }

        this.currentTo = selected;
        this.addConnection();
    }

    private handleRightClick(event: MouseEvent): void {
        
    }

    private addConnection(): void {

    }

    private addLine(): void {

    }

    private removeLine(): void {

    }

    private changeColor(): void {

    }

    private chooseLine(): void {

    }
}