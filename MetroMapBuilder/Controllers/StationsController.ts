import { Geometry } from "../Utility/Geometry";
import { SVG } from "../Utility/SVG";
import { Controller } from "./GridController";
import { LinesController } from "./LinesController";

export class StationsController implements Controller {

    private circles: Array<SVGCircleElement> = [];

    public constructor(private map: HTMLElement) {
        this.initialize(map);
    }

    public next(): Controller {
        this.map.removeEventListener("click", this.handleLeftClick);
        this.map.removeEventListener("contextmenu", this.handleRightClick, false);

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
        }
    }

    private handleRightClick(event: MouseEvent) {
        event.preventDefault();

        var center = Geometry.centrify(event.offsetX, event.offsetY);

        var index = this.circles.findIndex(circle =>
            circle.cx.baseVal.value == center.x &&
            circle.cy.baseVal.value == center.y);

        if (index !== -1) {            
            this.circles[index].remove(); // remove from visual presentation
            this.circles.splice(index, 1); // remove from array
        }
    }

    private initialize(map: HTMLElement) {
        map.addEventListener("click", this.handleLeftClick);
        map.addEventListener("contextmenu", this.handleRightClick, false);
    }
}