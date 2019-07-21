import { GridController } from "./Controllers/GridController";
import { GridSettings, Metadata } from "./Utils/Metadata";
import { BackgroundController } from "./Controllers/BackgroundController";
import { RoutesController } from "./Controllers/RoutesController";
import { StationsController } from "./Controllers/StationsController";
import { MapDrawer } from "./Utils/MapDrawer";
import { Geometry } from "./Utils/Geometry";
import { RemovalController } from "./Controllers/RemovalController";

if (document.readyState === 'complete') {
    initApp();
} else {
    document.addEventListener("DOMContentLoaded", initApp);
}

function initApp() {

    let gridConfig = getGridSettings();
    let metadata = new Metadata(gridConfig);

    let map = createMapCanvas(metadata.gridConfig.canvasSize);
    let drawer = new MapDrawer(map);

    Geometry.init(gridConfig);

    let gridController = new GridController(metadata, drawer); // ok
    let backgroundController = new BackgroundController(drawer); // ok
    let routesController = new RoutesController(metadata, drawer); // ok
    let stationsController = new StationsController(metadata, drawer);
    let contextMenuController = new RemovalController(metadata, drawer);
    // add ControlPanelController

    function getGridSettings() {
        let gridSize = 80;
        let canvasSize = 1000;
        return new GridSettings(gridSize, canvasSize);
    }

    function createMapCanvas(size: number) {
        let parent = document.getElementById("canvas");
        let map = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        map.setAttribute("width", <any>size);
        map.setAttribute("height", <any>size);
        map.setAttribute("class", "bgd-color");
        map.setAttribute("id", "map");
        parent.appendChild(map);
        return map;
    }
}



