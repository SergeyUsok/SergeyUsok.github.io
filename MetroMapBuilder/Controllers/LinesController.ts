import { Controller } from "./GridController";
import { SingleLineController } from "./SingleLineController";
import { Color, Station } from "../Types";

export class LinesController implements Controller {    
    private addLine = e => this.handleLineAddition();

    private changeLine = ctrl => this.handleLineChange(ctrl);
    private changeColor = (ctrl, c) => this.handleColorChange(ctrl, c);
    private removeLine = ctrl => this.handleLineRemoval(ctrl);

    private colors: Color[] = [Color.green, Color.red, Color.yellow, Color.blue, Color.orange, Color.black, Color.brown];

    private lineControllers: SingleLineController[] = [];
    private currentController: SingleLineController;
           
    public constructor(private map: HTMLElement, private stations: Station[]) {
        document.getElementById("addLine").addEventListener("click", this.addLine);
    }

    public next(): Controller {
        throw new Error("Method not implemented.");
    }

    public dispose(): void {
        document.getElementById("addLine").removeEventListener("click", this.addLine);
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

        toRemove.dispose();
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
}