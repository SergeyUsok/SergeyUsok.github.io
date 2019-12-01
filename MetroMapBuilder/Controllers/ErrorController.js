define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ErrorController {
        constructor() {
            this.timerId = -1;
            document.getElementById("close-alert").addEventListener("click", () => {
                document.getElementById("error").classList.remove("visible");
                document.getElementById("error").classList.add("invisible");
                clearTimeout(this.timerId);
            });
        }
        showError(errorMsg) {
            let alert = document.getElementById("error");
            document.getElementById("error").classList.remove("invisible");
            document.getElementById("error").classList.add("visible");
            alert.firstElementChild.textContent = errorMsg;
            this.timerId = setTimeout(() => {
                document.getElementById("error").classList.remove("visible");
                document.getElementById("error").classList.add("invisible");
            }, 5000);
        }
    }
    exports.ErrorController = ErrorController;
});
//# sourceMappingURL=ErrorController.js.map