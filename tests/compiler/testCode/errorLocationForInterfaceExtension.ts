// bug 17616: Error reported in wrong location when attempting "interface x extends string { ... }"
// the error should be reported on ln 6 col 11

var n = '';

interface x extends string { }
