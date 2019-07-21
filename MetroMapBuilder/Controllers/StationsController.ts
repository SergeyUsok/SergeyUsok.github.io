import { Geometry } from "../Utils/Geometry";
import { SVG } from "../Utils/SVG";
import { MapDrawer } from "../Utils/MapDrawer";
import { Metadata } from "../Utils/Metadata";

export class StationsController {
    private stationsCounter: number = 0;

    public constructor(private metadata: Metadata, private drawer: MapDrawer) {
        this.initialize(drawer.getCanvas());
    }    

    private initialize(canvas: SVGSVGElement) {
        canvas.addEventListener("click", event => this.addStation(event));        
    }

    private addStation(event: MouseEvent): void {
        if (event.target instanceof SVGCircleElement) {
            return;
        }

        let cell = null;
        if (event.target instanceof SVGLineElement) {
            // get coords relative to of svg canvas rather than just line ones
            let rect = (<any>(event.currentTarget)).getBoundingClientRect();
            cell = Geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
        }
        else {
            cell = Geometry.normalizeToGridCell(event.offsetX, event.offsetY);
        }

        let id = this.stationsCounter++;        
        let station = this.metadata.newStation(id, cell.x, cell.y);
        this.drawer.drawStation(station);
    }
}