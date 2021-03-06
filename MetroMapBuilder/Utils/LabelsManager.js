define(["require", "exports", "./SVG"], function (require, exports, SVG_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LabelsManager {
        constructor(geometry, isCellAvailable) {
            this.geometry = geometry;
            this.isCellAvailable = isCellAvailable;
            this.occupiedCells = new Set();
        }
        clear() {
            this.occupiedCells.clear();
        }
        process(label, station) {
            let position = this.calculateLabelPosition(label, station);
            label.setCoordinates(position.x, position.y);
            let labelStart = this.geometry.baselinePoint(position);
            let labelText = SVG_1.SVG.labelText(labelStart, this.geometry.fontSize, this.geometry.cellSize, label.name, label.id);
            this.saveCellsOccupiedByLabel(label);
            return labelText;
        }
        noLabelSet(cell) {
            let key = `${cell.x}-${cell.y}`;
            return !this.occupiedCells.has(key);
        }
        calculateLabelPosition(label, station) {
            return this.tryPutOnRight(label, station) ||
                this.tryPutOnBottom(label, station) ||
                this.tryPutOnLeft(label, station) ||
                this.tryPutOnTop(label, station) ||
                this.tryPutOnRightOffset(label, station) ||
                this.tryPutOnBottomOffset(label, station) ||
                this.tryPutOnLeftOffset(label, station) ||
                this.tryPutOnTopOffset(label, station) ||
                // default: put on right or left if grid does not allow
                {
                    x: station.maxBorderX < this.geometry.gridSize - this.geometry.labelWidthInCells(label.width)
                        ? station.maxBorderX + 1 : station.minBorderX - this.geometry.labelWidthInCells(label.width),
                    y: Math.floor((station.minBorderY + station.maxBorderY) / 2) // midpoint y
                };
        }
        tryPutOnRight(label, station) {
            let startX = station.maxBorderX + 1; // always the same for right side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by height relative to station
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnRightOffset(label, station) {
            let startX = station.maxBorderX + 1; // always the same for right side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by height relative to station
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            // move label down along right side of station until its first row occupy bottom-right neighboring cell 
            let temp = label.height - labelRowOppositeToStation;
            let offsetByYtimes = label.height % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY + i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            // move label up along right side of station until its last row occupy top-right neighboring cell
            offsetByYtimes = label.height - labelRowOppositeToStation;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY - i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            return null;
        }
        tryPutOnLeft(label, station) {
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let startX = station.minBorderX - labelWidth; // always the same for left side
            // first try set up label symmetrically by height relative to station
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnLeftOffset(label, station) {
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let startX = station.minBorderX - labelWidth; // always the same for left side
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            // move label up along left side of station until its last row occupy top-left neighboring cell
            let offsetByYtimes = label.height - labelRowOppositeToStation;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY - i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            // move label down along left side of station until its first row occupy bottom-left neighboring cell 
            let temp = label.height - labelRowOppositeToStation;
            offsetByYtimes = label.height % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY + i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            return null;
        }
        tryPutOnBottom(label, station) {
            let startY = station.maxBorderY + 1; // always the same for bottom side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by width relative to station
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnBottomOffset(label, station) {
            let startY = station.maxBorderY + 1; // always the same for bottom side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            // move label right along bottom side of station until its first column occupy bottom-right neighboring cell 
            let temp = labelWidth - labelColumnOppositeToStation;
            let offsetByXtimes = labelWidth % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX + i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            // move label left along bottom side of station until its last column occupy bottom-left neighboring cell
            offsetByXtimes = labelWidth - labelColumnOppositeToStation;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX - i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            return null;
        }
        tryPutOnTop(label, station) {
            let startY = station.minBorderY - label.height; // always the same for top side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by width relative to station
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnTopOffset(label, station) {
            let startY = station.minBorderY - label.height; // always the same for top side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            // move label left along top side of station until its last column occupy top-left neighboring cell
            let offsetByXtimes = labelWidth - labelColumnOppositeToStation;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX - i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            // move label right along top side of station until its first column occupy top-right neighboring cell 
            let temp = labelWidth - labelColumnOppositeToStation;
            offsetByXtimes = labelWidth % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX + i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            return null;
        }
        hasFreeSpaceForLabel(startX, startY, labelWidth, labelHeight) {
            for (let dx = 0; dx < labelWidth; dx++) {
                let x = startX + dx;
                for (let dy = 0; dy < labelHeight; dy++) {
                    let y = startY + dy;
                    if (!this.isCellAvailable({ x, y }))
                        return false;
                }
            }
            return true;
        }
        saveCellsOccupiedByLabel(label) {
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            for (let dx = 0; dx < labelWidth; dx++) {
                for (let dy = 0; dy < label.height; dy++) {
                    let x = label.x + dx;
                    let y = label.y + dy;
                    this.occupiedCells.add(`${x}-${y}`);
                }
            }
        }
    }
    exports.LabelsManager = LabelsManager;
});
//# sourceMappingURL=LabelsManager.js.map