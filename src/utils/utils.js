Number.prototype.toRadians = function () {
    return this * Math.PI / 180;
};

Number.prototype.fitToRange = function (min, max) {
    let result = this;
    if(this < min) result = min;
    if (this > max) result = max;
    return result;
};