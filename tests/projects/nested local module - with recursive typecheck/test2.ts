export var $;


export module Yo {
    import test = module("test1");
    test.x;

    export function y() { return 0; }
}