function point(x, y) {
    return {
        x: x,
        y: y
    };
}

(function (point) {
    point.point = function point() {
        return {
            x: 0,
            y: 0
        };
    }
    point.origin = point();
})(point);