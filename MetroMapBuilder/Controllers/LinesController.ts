import { Controller } from "./GridController";
import { SingleLineController } from "./SingleLineController";
import { Color, StationKeeper, Line, Connection, Station } from "../Types";
import { DrawingController } from "./DrawingController";

export class LinesController implements Controller {    
    private addLine = e => this.handleLineAddition();

    private changeLine = (ctrl: SingleLineController) => this.handleLineChange(ctrl);
    private changeColor = (ctrl: SingleLineController, c: Color) => this.handleColorChange(ctrl, c);
    private removeLine = (ctrl: SingleLineController) => this.handleLineRemoval(ctrl);

    private colors: Color[] = [Color.green, Color.red, Color.yellow, Color.blue, Color.orange, Color.black, Color.brown];

    private lineControllers: SingleLineController[] = [];
    private currentController: SingleLineController;
           
    public constructor(private stations: StationKeeper[]) {
        this.initialize();
    }

    public next(): Controller {
        // prepare stations
        let stations: Station[] = [];
        for (let stId = 0; stId < this.stations.length; stId++) {
            this.stations[stId].id = stId;
            let station = {
                id: stId, label: {x: 0, y: 0, name: []},
                x: this.stations[stId].x,
                y: this.stations[stId].y,
                connections: []
            };
            stations.push(station);
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
                    stations[a].connections.push(connectionId);
                    stations[b].connections.push(connectionId);
                    ++connectionId;
                }
                else {
                    connection.lines.push(lineId);
                }

                a = b;
            }
        }

        return new DrawingController(stations, lines, connections);
    }

    public dispose(): void {
        document.getElementById("addLine").removeEventListener("click", this.addLine);

        for (let i = 0; i < this.lineControllers.length; i++) {
            this.lineControllers[i].dispose();
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

    private initialize() {
        document.getElementById("addLine").addEventListener("click", this.addLine);
    }
}