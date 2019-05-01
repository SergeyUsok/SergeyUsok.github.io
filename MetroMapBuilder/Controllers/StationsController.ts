import { Geometry } from "../Utility/Geometry";
import { SVG } from "../Utility/SVG";
import { Controller } from "./GridController";
import { LinesController } from "./LinesController";

export class StationsController implements Controller {

    private circles: Array<SVGCircleElement> = [];
    private addStation = (e) => this.handleLeftClick(e);
    private removeStation = (e) => this.handleRightClick(e);

    public constructor(private map: HTMLElement) {
        this.initialize(map);
    }

    public next(): Controller {
        var stations = [];

        for (var i = 0; i < this.circles.length; i++) {
            var circle = this.circles[i];
            var gridPoint = Geometry.normalizeToGridCell(circle.cx.baseVal.value, circle.cy.baseVal.value);
            var station = { id: i, name: "", x: gridPoint.x, y: gridPoint.y, circle: circle };
            stations.push(station);
        }

        return new LinesController(this.map, stations);
    }

    public dispose(): void {
        this.map.removeEventListener("click", this.addStation);

        for (var i = 0; i < this.circles.length; i++) {
            this.circles[i].removeEventListener("contextmenu", this.removeStation, false);
        }
    }

    private handleLeftClick(event: MouseEvent) {
        var center = Geometry.centrify(event.offsetX, event.offsetY);

        var index = this.circles.findIndex(circle =>
            circle.cx.baseVal.value == center.x &&
            circle.cy.baseVal.value == center.y);

        if (index === -1) {
            var circle = SVG.circle(center.x, center.y, Geometry.radius);
            this.circles.push(circle); // add to internal array
            this.map.appendChild(circle); // add to visual presentation
            circle.addEventListener("contextmenu", this.removeStation, false);
        }
    }

    private handleRightClick(event: MouseEvent) {
        event.preventDefault();
        var target = <SVGCircleElement>event.target;

        var index = this.circles.findIndex(circle =>
            circle.cx.baseVal.value == target.cx.baseVal.value &&
            circle.cy.baseVal.value == target.cy.baseVal.value);

        this.circles[index].remove(); // remove from visual presentation
        this.circles.splice(index, 1); // remove from array
    }

    private initialize(map: HTMLElement) {
        map.addEventListener("click", this.addStation);
    }
}