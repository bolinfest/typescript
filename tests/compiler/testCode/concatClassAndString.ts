// test case for #17127
// Shouldn't compile (the long form f = f + ""; doesn't):
class f { }

f += '';
