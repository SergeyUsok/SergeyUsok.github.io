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

        // context menu should appear only at circle or rect click
        if (!(event.target instanceof SVGCircleElement) && !(event.target instanceof SVGRectElement)) {
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
        
        let menuTemplate = `<div class='dropdown-menu show' id='stationMenu'>` +
            `<button class='dropdown-item' type='button'>Remove station</button>` +
            `<div class='dropdown-divider'></div>`;

        for (let route of this.subwayMap.routes.filter(r => r.passesThrough(station))) {
            menuTemplate += `<button class='dropdown-item' type='button' data-id='${route.id}' ` +
                            `style='color: ${route.color[0]}'>Remove from route ${route.id}</button>`;
        }

        menuTemplate += "</div>";

        let temp = document.createElement('div');
        temp.innerHTML = menuTemplate;
        let menu = temp.firstElementChild;

        return this.addEventHandlers(menu, station);
    }

    private addEventHandlers(menu: Element, targetStation: Station): HTMLElement {

        // remove station menu item
        menu.children[0].addEventListener("click", () => {
            this.subwayMap.removeStation(targetStation);
            this.mapView.redrawMap(this.subwayMap);
        });

        // menu.children[1] -- is divider line

        if (menu.children.length > 2) {            
            for (let i = 2; i < menu.children.length; i++) {
                menu.children[i].addEventListener("click", e => {
                    let route = this.subwayMap.getRoute(this.mapView.getId(e.target as Element));
                    this.subwayMap.removeConnection(route, targetStation);
                    this.mapView.redrawMap(this.subwayMap);
                });
            }
        }       

        return <HTMLElement>menu;
    }
}