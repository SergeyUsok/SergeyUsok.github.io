import { SubwayMap } from "../Models/SubwayMap";
import { Route } from "../Models/Route";
import { Station } from "../Models/StationModel";
import { MapView } from "../Utils/MapView";

export class RemovalController {
    public constructor(private subwayMap: SubwayMap, private mapView: MapView) {
        this.initialize(mapView.getCanvas());
    }

    private initialize(canvas: SVGSVGElement) {
        document.addEventListener("click", () => this.hideMenu(), false);
        canvas.addEventListener("contextmenu", event => this.showMenu(event), false);
    }

    private hideMenu(): void {
        let menu = document.getElementById("stationMenu");

        if (menu != null) {
            menu.remove();
        }
    }

    private showMenu(event: MouseEvent): boolean {
        this.hideMenu();

        if (!(event.target instanceof SVGCircleElement)) { // context menu should appear only at circle click
            return;
        }

        event.preventDefault();

        let menu = this.buildMenu(event.target);
        menu.style.display = "block";
        menu.style.top = `${event.pageY}px`;
        menu.style.left = `${event.pageX}px`;
        document.body.appendChild(menu);

        return false;
    }

    private getStation(element: Element) {
        let id = this.mapView.getId(element);
        return this.subwayMap.getStation(id);
    }

    private buildMenu(target: Element): HTMLElement {
        let station = this.getStation(target);
        let route = this.subwayMap.currentRoute;

        let hasConnections = route != null && route.passesThrough(station);
        let disabled = hasConnections ? "" : " disabled";
        let color = hasConnections ? ` style='color: ${route.color}'` : "";

        let menuTemplate = `<div class='dropdown-menu show' id='stationMenu'>` +
            `<button class='dropdown-item' type='button'>Remove station</button>` +
            `<div class='dropdown-divider'></div>` +
            `<button class='dropdown-item${disabled}' type='button'${color}>Remove from current route</button>` +
            "</div>";

        let temp = document.createElement('div');
        temp.innerHTML = menuTemplate;
        let menu = temp.firstElementChild;

        return this.addEventHandlers(menu, station, route);
    }

    private addEventHandlers(menu: Element, targetStation: Station, route: Route): HTMLElement {

        // remove station menu item
        menu.children[0].addEventListener("click", () => {
            this.subwayMap.removeStation(targetStation);
            this.mapView.redrawMap(this.subwayMap);
        });

        // menu.children[1] -- is divider line

        // remove connection - item
        menu.children[2].addEventListener("click", () => {
            if (route != null) {
                this.subwayMap.removeConnection(route, targetStation);
                this.mapView.redrawMap(this.subwayMap);
            }
        });

        return <HTMLElement>menu;
    }
}