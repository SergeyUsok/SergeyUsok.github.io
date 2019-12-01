define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RemovalController {
        constructor(subwayMap, mapView) {
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.initialize(mapView.getCanvas());
        }
        initialize(canvas) {
            document.addEventListener("click", () => this.hideMenu(), false);
            canvas.addEventListener("contextmenu", event => this.showMenu(event), false);
            document.getElementById("clearAll").addEventListener("click", () => {
                this.subwayMap.clear(true);
                this.mapView.redrawMap(this.subwayMap);
            });
        }
        hideMenu() {
            let menu = document.getElementById("stationMenu");
            if (menu != null) {
                menu.remove();
            }
        }
        showMenu(event) {
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
        getStation(element) {
            let id = this.mapView.getId(element);
            return this.subwayMap.getStation(id);
        }
        buildMenu(target) {
            let station = this.getStation(target);
            let menuTemplate = `<div class='dropdown-menu show' id='stationMenu'>` +
                `<button class='dropdown-item' type='button'>Remove station</button>` +
                `<div class='dropdown-divider'></div>`;
            for (let route of Array.from(this.subwayMap.routes).filter(r => r.passesThrough(station))) {
                menuTemplate += `<button class='dropdown-item' type='button' data-id='${route.id}' ` +
                    `style='color: ${route.color[0]}'>Remove from route ${route.id}</button>`;
            }
            menuTemplate += "</div>";
            let temp = document.createElement('div');
            temp.innerHTML = menuTemplate;
            let menu = temp.firstElementChild;
            return this.addEventHandlers(menu, station);
        }
        addEventHandlers(menu, targetStation) {
            // remove station menu item
            menu.children[0].addEventListener("click", () => {
                this.subwayMap.removeStation(targetStation);
                this.mapView.redrawMap(this.subwayMap);
            });
            // menu.children[1] -- is divider line
            if (menu.children.length > 2) {
                for (let i = 2; i < menu.children.length; i++) {
                    menu.children[i].addEventListener("click", e => {
                        let route = this.subwayMap.getRoute(this.mapView.getId(e.target));
                        this.subwayMap.removeConnection(route, targetStation);
                        this.mapView.redrawMap(this.subwayMap);
                    });
                }
            }
            return menu;
        }
    }
    exports.RemovalController = RemovalController;
});
//# sourceMappingURL=RemovalController.js.map