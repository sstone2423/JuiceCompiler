/* --------
   semantic.ts

   -------- */
var JuiceC;
(function (JuiceC) {
    var Semantic = /** @class */ (function () {
        function Semantic() {
        }
        Semantic.prototype.analyze = function (cst) {
            this.cst = cst;
        };
        return Semantic;
    }());
    JuiceC.Semantic = Semantic;
})(JuiceC || (JuiceC = {}));
