import { Controller } from "./GridController";
import { SingleLineController } from "./SingleLineController";
import { Color, Station, Line, Connection } from "../Types";
import { DrawingController } from "./DrawingController";

export class LinesController implements Controller {    
    private addLine = e => this.handleLineAddition();

    private changeLine = ctrl => this.handleLineChange(ctrl);
    private changeColor = (ctrl, c) => this.handleColorChange(ctrl, c);
    private removeLine = ctrl => this.handleLineRemoval(ctrl);
    private background = (e) => this.handleBackground(e);

    private colors: Color[] = [Color.green, Color.red, Color.yellow, Color.blue, Color.orange, Color.black, Color.brown];

    private lineControllers: SingleLineController[] = [];
    private currentController: SingleLineController;
           
    public constructor(private stations: Station[], private backgroundUrl) {
        this.initialize(this.backgroundUrl);
    }

    public next(): Controller {
        // prepare stations
        for (let stId = 0; stId < this.stations.length; stId++) {
            this.stations[stId].id = stId;
        }
        // prepare lines
        let lines: Line[] = [];
        for (let lineId = 0; lineId < this.lineControllers.length; lineId++) {
            let line = this.lineControllers[lineId].toLine(lineId);
            lines.push(line);
        }
        // prepare connections
        let connections: Connection[] = [];
        let connectionId = 0;
        for (let lineId = 0; lineId < lines.length; lineId++) {
            let a = lines[lineId].stations[0];
            for (let stId = 1; stId < lines[lineId].stations.length; stId++) {
                let b = lines[lineId].stations[stId];

                let connection = connections.find(c => (c.a == a && c.b == b) || (c.a == b && c.b == a));

                if (connection == undefined) {                    
                    connection = { id: connectionId, a: a, b: b, lines: [] };
                    connection.lines.push(lineId);
                    connections.push(connection);
                    // add connection info to stations
                    this.stations[a].connections.push(connectionId);
                    this.stations[b].connections.push(connectionId);
                    ++connectionId;
                }
                else {
                    connection.lines.push(lineId);
                }

                a = b;
            }
        }

        return new DrawingController(this.stations, lines, connections);
    }

    public dispose(): void {
        document.getElementById("addLine").removeEventListener("click", this.addLine);
        document.getElementById("background-switch2").removeEventListener("click", this.background);
        document.getElementById("background-switch2").setAttribute("disabled", "disabled");

        document.getElementById("map").style.backgroundImage = "";
        document.getElementById("map").classList.remove("bgd");
        document.getElementById("map").classList.add("bgd-color");

        for (let i = 0; i < this.lineControllers.length; i++) {
            this.lineControllers[i].dispose();
        }
    }

    private handleBackground(e: MouseEvent) {
        let checkbox = <any>e.target;
        let map = document.getElementById("map");

        if (checkbox.checked) {
            map.classList.remove("bgd-color");
            map.classList.add("bgd");
            map.style.backgroundImage = this.backgroundUrl;
        }
        else {
            map.classList.remove("bgd");
            map.classList.add("bgd-color");
            map.style.backgroundImage = "";
        }
    }

    private handleLineAddition(): void {
        let lineController = new SingleLineController(this.stations, this.changeLine, this.changeColor, this.removeLine, this.colors);
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

        this.lineControllers = newArr;
    }

    private handleColorChange(lineCtrl: SingleLineController, color: Color): void {
        if (this.currentController == lineCtrl)
            this.currentController.redraw(); // redraw lines since color changed

        // may be add complex logic to handle occupied colors
        // and notify about them other single line controllers
    }

    private handleLineChange(selectedController: SingleLineController): void {
        if (this.currentController != null) {
            this.currentController.deselect();
        }

        if (selectedController != null)
            selectedController.select();

        this.currentController = selectedController;
    }

    private initialize(background: string) {
        document.getElementById("addLine").addEventListener("click", this.addLine);

        let backgroundCheckbox = <HTMLInputElement>document.getElementById("background-switch2");
        let map = document.getElementById("map");

        if (background != null) {
            backgroundCheckbox.addEventListener("click", this.background);            
        }
        else {
            backgroundCheckbox.setAttribute("disabled", "disabled");
        }

        if (map.style.backgroundImage == background) {
            backgroundCheckbox.checked = true;
        }
        else {
            backgroundCheckbox.checked = false;
        }
    }
}