export module myModule {
 
 import foo = module("test2");

 console.log(foo.$);

 var z = foo.Yo.y();

}

export var x = 0;
