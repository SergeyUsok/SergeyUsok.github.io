define(["require", "exports", "./Controllers/GridController", "./Models/SubwayMap", "./Controllers/BackgroundController", "./Controllers/RoutesController", "./Controllers/StationsController", "./Utils/MapView", "./Utils/Geometry", "./Controllers/RemovalController", "./Controllers/IOController"], function (require, exports, GridController_1, SubwayMap_1, BackgroundController_1, RoutesController_1, StationsController_1, MapView_1, Geometry_1, RemovalController_1, IOController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (document.readyState !== 'loading') {
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
        let view = new MapView_1.MapView(map, geometry);
        let gridController = new GridController_1.GridController(mapModel, view);
        let backgroundController = new BackgroundController_1.BackgroundController(view);
        let routesController = new RoutesController_1.RoutesController(mapModel, view);
        let stationsController = new StationsController_1.StationsController(mapModel, view, geometry);
        let removalController = new RemovalController_1.RemovalController(mapModel, view);
        let ioController = new IOController_1.IOController(mapModel, view);
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