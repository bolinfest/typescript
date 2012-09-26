this.foo = 3;
function log(n) {
    return n;
}
log(this.foo).toString();