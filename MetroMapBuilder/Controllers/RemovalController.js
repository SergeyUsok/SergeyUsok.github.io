define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RemovalController {
        constructor(subwayMap, drawer) {
            this.subwayMap = subwayMap;
            this.drawer = drawer;
            this.initialize(drawer.getCanvas());
        }
        initialize(canvas) {
            document.addEventListener("click", () => this.hideMenu(), false);
            canvas.addEventListener("contextmenu", event => this.showMenu(event), false);
        }
        hideMenu() {
            let menu = document.getElementById("stationMenu");
            if (menu != null) {
                menu.remove();
            }
        }
        showMenu(event) {
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
        getStation(element) {
            let id = this.drawer.getId(element);
            return this.subwayMap.getStation(id);
        }
        buildMenu(target) {
            let station = this.getStation(target);
            let route = this.subwayMap.currentRoute;
            let hasConnections = route != null && route.passesThrough(station);
            let disabled = hasConnections ? "" : " disabled";
            let color = hasConnections ? ` style='color: ${route.color}'` : "";
            let menuTemplate = `<div class='dropdown-menu show' id='stationMenu'>` +
                `<button class='dropdown-item' type='button'>Remove station</button>` +
                `<div class='dropdown-divider'></div>` +
                `<button class='dropdown-item${disabled}' type='button'${color}>Remove from current route</button>` +
                "</ul>";
            let temp = document.createElement('div');
            temp.innerHTML = menuTemplate;
            let menu = temp.firstElementChild;
            return this.addEventHandlers(menu, station, route);
        }
        addEventHandlers(menu, targetStation, route) {
            // remove station menu item
            menu.children[0].addEventListener("click", () => {
                this.subwayMap.removeStation(targetStation);
                this.drawer.redrawMap(this.subwayMap);
            });
            // menu.children[1] -- is divider line
            // remove connection - item
            menu.children[2].addEventListener("click", () => {
                if (route != null) {
                    this.subwayMap.removeConnection(route, targetStation);
                    this.drawer.redrawMap(this.subwayMap);
                }
            });
            return menu;
        }
    }
    exports.RemovalController = RemovalController;
});
//# sourceMappingURL=RemovalController.js.map