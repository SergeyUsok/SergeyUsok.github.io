import { Controller } from "./GridController";
import { SingleLineController } from "./SingleLineController";
import { Color, Station } from "../Types";

export class LinesController implements Controller {    
    private from: Station = null;
    private to: Station = null;

    private selectStation = e => this.handleSelectStation(e);
    private deselectStation = e => this.handleDeselectStation(e);
    private addLine = e => this.handleLineAddition();

    private changeLine = ctrl => this.handleLineChange(ctrl);
    private changeColor = (ctrl, c) => this.handleColorChange(ctrl, c);
    private removeLine = ctrl => this.handleLineRemoval(ctrl);

    private colors: Color[] = [Color.green, Color.red, Color.yellow, Color.blue, Color.orange, Color.black, Color.brown];

    private lineControllers: SingleLineController[] = [];
    private currentController: SingleLineController;
           
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

        if (this.from == null) {
            this.from = selected;
            // this.from.circle - highlight
            return;
        }

        this.to = selected;
        // this.to.circle - highlight
        this.currentController.connect(this.from, this.to);
    }

    private handleDeselectStation(event: MouseEvent): void {
        this.from == null;
        // this.from.circle - remove highlight
    }

    private handleLineAddition(): void {
        let lineController = new SingleLineController(this.changeLine, this.changeColor, this.removeLine, this.colors);
        this.lineControllers.push(lineController);        
        this.handleLineChange(lineController);
    }

    private handleLineRemoval(toRemove: SingleLineController): void {
        let newArr = [];

        for (let i = 0; i < this.lineControllers.length; i++) {
            let ctrl = this.lineControllers[i];

            if (ctrl != toRemove)
                newArr.push(ctrl);
        }

        if (this.currentController == toRemove)
            this.handleLineChange(newArr.length > 0 ? newArr[0] : null);

        toRemove.dispose();
        this.lineControllers = newArr;
    }

    private handleColorChange(lineCtrl: SingleLineController, color: Color): void {
        // may be add complex logic to handle occupied colors
        // and notify about them other single line controllers
    }

    private handleLineChange(selectedController: SingleLineController): void {
        if (this.currentController != null) {
            this.currentController.deselect();
            this.currentController.hideConnections();
        }

        if (selectedController != null)
            selectedController.showConnnections();

        this.currentController = selectedController;
    }    
}