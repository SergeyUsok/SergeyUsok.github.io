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
        let stations = [];

        for (let i = 0; i < this.circles.length; i++) {
            let circle = this.circles[i];
            let gridPoint = Geometry.normalizeToGridCell(circle.cx.baseVal.value, circle.cy.baseVal.value);
            let station = { id: i, name: "", x: gridPoint.x, y: gridPoint.y, circle: circle };
            stations.push(station);
        }

        return new LinesController(this.map, stations);
    }

    public dispose(): void {
        this.map.removeEventListener("click", this.addStation);
        this.map.removeEventListener("contextmenu", this.removeStation, false);
    }

    private handleLeftClick(event: MouseEvent) {
        if (event.target instanceof SVGCircleElement) // nothing to process if existing circle was clicked
            return;
        
        let center = Geometry.centrify(event.offsetX, event.offsetY);
        let circle = SVG.circle(center.x, center.y, Geometry.radius);
        this.circles.push(circle); // add to internal array
        this.map.appendChild(circle); // add to visual presentation
    }

    private handleRightClick(event: MouseEvent) {
        event.preventDefault();
        let target = event.target as SVGCircleElement;

        if (target == null) // nothing to remove if empty cell was clicked
            return;

        let index = this.circles.findIndex(circle =>
            circle.cx.baseVal.value == target.cx.baseVal.value &&
            circle.cy.baseVal.value == target.cy.baseVal.value);

        this.circles[index].remove(); // remove from visual presentation
        this.circles.splice(index, 1); // remove from array
    }

    private initialize(map: HTMLElement) {
        map.addEventListener("click", this.addStation);
        map.addEventListener("contextmenu", this.removeStation, false);
    }
}