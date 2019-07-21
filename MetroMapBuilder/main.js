define(["require", "exports", "./Controllers/GridController", "./Models/SubwayMap", "./Controllers/BackgroundController", "./Controllers/RoutesController", "./Controllers/StationsController", "./Utils/MapDrawer", "./Utils/Geometry", "./Controllers/RemovalController"], function (require, exports, GridController_1, SubwayMap_1, BackgroundController_1, RoutesController_1, StationsController_1, MapDrawer_1, Geometry_1, RemovalController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (document.readyState === 'complete') {
        initApp();
    }
    else {
        document.addEventListener("DOMContentLoaded", initApp);
    }
    function initApp() {
        let sizeSettings = getSizeSettings();
        let mapModel = new SubwayMap_1.SubwayMap(sizeSettings);
        let geometry = new Geometry_1.Geometry(sizeSettings);
        let map = createMapCanvas(mapModel.sizeSettings.canvasSize);
        let drawer = new MapDrawer_1.MapDrawer(map, geometry);
        let gridController = new GridController_1.GridController(mapModel, drawer);
        let backgroundController = new BackgroundController_1.BackgroundController(drawer);
        let routesController = new RoutesController_1.RoutesController(mapModel, drawer);
        let stationsController = new StationsController_1.StationsController(mapModel, drawer, geometry);
        let removalController = new RemovalController_1.RemovalController(mapModel, drawer);
        // add ControlPanelController
        function getSizeSettings() {
            let gridSize = 80;
            let canvasSize = 1000;
            let lineWidthFactor = 0.2;
            return new SubwayMap_1.SizeSettings(gridSize, canvasSize, lineWidthFactor);
        }
        function createMapCanvas(size) {
            let parent = document.getElementById("canvas");
            let map = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            map.setAttribute("width", size);
            map.setAttribute("height", size);
            map.setAttribute("class", "bgd-color");
            map.setAttribute("id", "map");
            parent.appendChild(map);
            return map;
        }
    }
});
//# sourceMappingURL=main.js.map