define(["require", "exports", "./SVG"], function (require, exports, SVG_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationBounds {
        constructor(initalMax, initialMin) {
            this.maxBorderX = initalMax;
            this.maxBorderY = initalMax;
            this.minBorderX = initialMin;
            this.minBorderY = initialMin;
            this.isInclined = false;
        }
    }
    exports.StationBounds = StationBounds;
    class StationsManager {
        constructor(geometry) {
            this.geometry = geometry;
            this.stationInfoMap = new Map();
            this.shapeMap = new Map();
            this.occupiedCells = new Map();
        }
        clear() {
            this.stationInfoMap.clear();
            this.shapeMap.clear();
            this.occupiedCells.clear();
        }
        getBounds(id) {
            return this.shapeMap.get(id);
        }
        processConnection(connection) {
            let metadata = this.extractStationInfo(connection);
            // process 'from' station
            let data = this.getStationData(connection.from.id);
            this.pushIfMissing(data, metadata);
            // process 'to' station
            data = this.getStationData(connection.to.id);
            this.pushIfMissing(data, metadata);
        }
        process(station) {
            let metadata = this.stationInfoMap.get(station.id);
            let center = this.geometry.centrify(station);
            // draw station without lines as cicrle
            if (metadata == undefined) {
                let circle = SVG_1.SVG.circleStation(center, this.geometry.radius, `station-${station.id}`, station.id);
                this.saveCellsOccupiedByCircle(station.id, station);
                return circle;
            }
            // order by lines count descending
            metadata.sort((a, b) => {
                if (b.count > a.count)
                    return 1;
                if (b.count < a.count)
                    return -1;
                // if both count equal then check angle and prefer 0 or 90 over other
                if (b.angle == 0 || Math.abs(b.angle) == 90)
                    return 1;
                if (a.angle == 0 || Math.abs(a.angle) == 90)
                    return -1;
                return 0;
            });
            // draw station with single passing line as cicrle as well
            if (metadata[0].count == 1) {
                let circle = SVG_1.SVG.circleStation(center, this.geometry.radius, `station-${station.id}`, station.id);
                this.saveCellsOccupiedByCircle(station.id, station);
                return circle;
            }
            // otherwise draw station as rectangle
            // let maximum lines count passing through station be width of rect
            let metadataWithMaxCount = metadata[0];
            let width = this.calculateWidth(metadataWithMaxCount);
            let secondAfterMaxMetadata = metadata[1];
            let height = this.calculateHeight(secondAfterMaxMetadata);
            // station rect should be ortogonal to the angle of passing connection
            let rotation = 360 + metadataWithMaxCount.angle - 90;
            let corners = this.geometry.rectCorners(center, width, height);
            let rect = SVG_1.SVG.rectStation(corners[0], width, height, rotation, this.geometry.cornerRadius, center, `station-${station.id}`, station.id);
            this.saveCellsOccupiedByRect(station.id, corners, center, rotation);
            return rect;
        }
        // walking through current and neighboring cells and mark them as unavailable for 
        // further station set up - stations must not be placed in neighboring cells
        completeProcessing() {
            for (let id_bounds of this.shapeMap) {
                let id = id_bounds[0];
                let bounds = id_bounds[1];
                if (bounds.isInclined)
                    continue; // do not process surrounding cells for inclined stations
                for (let x = bounds.surroundingMinX; x <= bounds.surroundingMaxX; x++) {
                    for (let y = bounds.surroundingMinY; y <= bounds.surroundingMaxY; y++) {
                        this.occupiedCells.get(id).add(`${x}-${y}`);
                    }
                }
            }
        }
        noStationSet(cell, exceptId) {
            let key = `${cell.x}-${cell.y}`;
            for (let keyValue of this.occupiedCells) {
                let id = keyValue[0];
                let cells = keyValue[1];
                // skip check current if id is equal to provided exceptId
                if (id == exceptId)
                    continue;
                if (cells.has(key))
                    return false;
            }
            return true;
        }
        extractStationInfo(connection) {
            return {
                count: connection.routesCount,
                direction: connection.direction,
                angle: this.geometry.angle(connection.from, connection.to)
            };
        }
        calculateWidth(info) {
            let calculatedWidth = this.geometry.distanceOfParallelLines(info.count) +
                (this.geometry.distanceBetweenLines * 2); // add additional space equal to distanceBetweenLines from both sides of rect
            return calculatedWidth > this.geometry.cellSize ?
                calculatedWidth : this.geometry.cellSize; // minimum rect width shouldn't be less than cell size
        }
        calculateHeight(info) {
            if (info == undefined)
                return this.geometry.cellSize;
            let calculatedHeight = this.geometry.distanceOfParallelLines(info.count) +
                (this.geometry.distanceBetweenLines * 2); // add additional space equal to distanceBetweenLines from both sides of rect
            return calculatedHeight > this.geometry.cellSize ? calculatedHeight : this.geometry.cellSize;
        }
        getStationData(id) {
            if (!this.stationInfoMap.has(id)) {
                this.stationInfoMap.set(id, []);
            }
            return this.stationInfoMap.get(id);
        }
        pushIfMissing(stored, newData) {
            for (let i = 0; i < stored.length; i++) {
                if (stored[i].direction == newData.direction && Math.abs(stored[i].angle - newData.angle) <= 45) {
                    if (stored[i].count < newData.count) {
                        stored[i] = newData;
                    }
                    else {
                        return;
                    }
                }
            }
            stored.push(newData);
        }
        saveCellsOccupiedByCircle(id, center) {
            let bounds = new StationBounds();
            bounds.maxBorderX = center.x;
            bounds.minBorderX = center.x;
            bounds.maxBorderY = center.y;
            bounds.minBorderY = center.y;
            bounds.surroundingMaxX = center.x + 1;
            bounds.surroundingMinX = center.x - 1;
            bounds.surroundingMaxY = center.y + 1;
            bounds.surroundingMinY = center.y - 1;
            this.shapeMap.set(id, bounds);
            this.occupiedCells.set(id, new Set([`${center.x}-${center.y}`]));
        }
        saveCellsOccupiedByRect(id, corners, center, rotationAngle) {
            let bounds = new StationBounds(0, this.geometry.gridSize);
            let rotated = this.geometry.rotate(corners, center, rotationAngle);
            for (let i = 0; i < rotated.length; i++) {
                let gridCell = this.geometry.normalizeToGridCell(Math.abs(rotated[i].x), Math.abs(rotated[i].y));
                // if station occupy cell only PARTIALLY (more than 10% and less than 80%) we treat free space 
                // between station border and next cell as enough to not mark next cell as occupied
                // otherwise we mark one more neighboring cell as occupied
                if (gridCell.x > bounds.maxBorderX) {
                    bounds.maxBorderX = gridCell.x;
                    let fraction = (rotated[i].x % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMaxX = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.x + 1) : gridCell.x;
                }
                if (gridCell.x < bounds.minBorderX) {
                    bounds.minBorderX = gridCell.x;
                    let fraction = (rotated[i].x % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMinX = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.x - 1) : gridCell.x;
                }
                if (gridCell.y > bounds.maxBorderY) {
                    bounds.maxBorderY = gridCell.y;
                    let fraction = (rotated[i].y % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMaxY = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.y + 1) : gridCell.y;
                }
                if (gridCell.y < bounds.minBorderY) {
                    bounds.minBorderY = gridCell.y;
                    let fraction = (rotated[i].y % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMinY = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.y - 1) : gridCell.y;
                }
            }
            bounds.isInclined = rotationAngle % 90 != 0;
            this.shapeMap.set(id, bounds);
            let result = new Set();
            for (let x = bounds.minBorderX; x <= bounds.maxBorderX; x++) {
                for (let y = bounds.minBorderY; y <= bounds.maxBorderY; y++) {
                    result.add(`${x}-${y}`);
                }
            }
            this.occupiedCells.set(id, result);
        }
    }
    exports.StationsManager = StationsManager;
});
//# sourceMappingURL=StationsManager.js.map