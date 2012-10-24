// Spec:
// The instanceof operator requires the left operand to be of type Any or an object type, and the right 
// operand to be of type Any or a subtype of the ‘Function’ interface type. The result is always of the 
// Boolean primitive type.

class Object { }
var obj: Object;

// Should be error but isn't (Bug 17075: instanceof operator type restrictions don't match spec/error description)
4 instanceof null; 

// Error and should be error
obj instanceof 4;
Object instanceof obj;

// OK
null instanceof null;
obj instanceof Object;
