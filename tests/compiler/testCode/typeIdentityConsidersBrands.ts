class X{

      name: string;

}

 

class Y{

      name: string;

}

 

function foo(arg: X){

      console.log("called");

}

 

var a = new Y();

var b = new X();

 

a = b; // should error

foo(a); // should error
