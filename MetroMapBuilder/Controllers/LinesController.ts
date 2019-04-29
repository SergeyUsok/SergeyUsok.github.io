import { Controller } from "./GridController";

export class LinesController implements Controller {    
    private currentFrom: Station;
    private currentTo: Station;
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
            stations[i].circle.addEventListener("click", this.handleClick);
        }

        document.getElementById("addLine").addEventListener("click", this.addLine);
        document.getElementById("removeLine").addEventListener("click", this.removeLine);
        document.getElementById("changeColor").addEventListener("click", this.changeColor);
        document.getElementById("chooseLine").addEventListener("click", this.chooseLine);
    }

    private handleClick(event: MouseEvent): void {

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