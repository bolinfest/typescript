class X{

      name: string;

}

 

class Y{

      name: string;

}

 

function foo(arg: X){

}

 

var a = new Y();

var b = new X();

 

a = b; // should error

foo(a); // should error
