var Event = (function () {
    function Event() {
        this._listeners = [];
        this._listeners = [];
    }
    Event.prototype.add = function (listener) {
        this._listeners.push(listener);
    };
    return Event;
})();
var ItemSetEvent = (function (_super) {
    __extends(ItemSetEvent, _super);
    function ItemSetEvent() {
        _super.apply(this, arguments);

    }
    ItemSetEvent.prototype.add = function (listener) {
        _super.prototype.add.call(this, listener);
    };
    return ItemSetEvent;
})(Event);