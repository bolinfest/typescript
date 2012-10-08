var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EventBase = (function () {
    function EventBase() {
        this._listeners = [];
    }
    EventBase.prototype.add = function (listener) {
        this._listeners.push(listener);
    };
    return EventBase;
})();
var StringEvent = (function (_super) {
    __extends(StringEvent, _super);
    function StringEvent() {
        _super.apply(this, arguments);

    }
    StringEvent.prototype.add = function (listener) {
        _super.prototype.add.call(this, listener);
    };
    return StringEvent;
})(EventBase);