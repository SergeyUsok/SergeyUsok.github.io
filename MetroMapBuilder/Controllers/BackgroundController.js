define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BackgroundController {
        constructor(mapView) {
            this.initialize(mapView.getCanvas());
        }
        initialize(canvas) {
            let backgroundUrl = '';
            let backgroundCheckbox = document.getElementById("background-switch");
            backgroundCheckbox.addEventListener("click", () => {
                if (backgroundCheckbox.checked) {
                    canvas.classList.remove("bgd-color");
                    canvas.classList.add("bgd");
                    canvas.style.backgroundImage = backgroundUrl;
                }
                else {
                    canvas.classList.remove("bgd");
                    canvas.classList.add("bgd-color");
                    canvas.style.backgroundImage = '';
                }
            });
            document.getElementById("url").addEventListener("input", e => {
                if (e.target.value != "") {
                    document.getElementById("load").removeAttribute("disabled");
                    document.getElementById("clear").removeAttribute("disabled");
                }
                else {
                    document.getElementById("load").setAttribute("disabled", "disabled");
                    document.getElementById("clear").setAttribute("disabled", "disabled");
                }
            });
            document.getElementById("load").addEventListener("click", () => {
                let url = document.getElementById("url").value;
                canvas.classList.add("bgd");
                canvas.classList.remove("bgd-color");
                backgroundUrl = `url(${url})`;
                canvas.style.backgroundImage = backgroundUrl;
                canvas.style.backgroundSize = `${canvas.width.baseVal.value}px ${canvas.height.baseVal.value}px`;
                document.getElementById("load").setAttribute("disabled", "disabled");
                document.getElementById("clear").removeAttribute("disabled");
                backgroundCheckbox.removeAttribute("disabled");
                backgroundCheckbox.checked = true;
            });
            document.getElementById("clear").addEventListener("click", () => {
                canvas.classList.remove("bgd");
                canvas.classList.add("bgd-color");
                canvas.style.backgroundImage = '';
                document.getElementById("url").value = '';
                backgroundUrl = '';
                document.getElementById("clear").setAttribute("disabled", "disabled");
                backgroundCheckbox.setAttribute("disabled", "disabled");
                backgroundCheckbox.checked = false;
            });
        }
    }
    exports.BackgroundController = BackgroundController;
});
//# sourceMappingURL=BackgroundController.js.map