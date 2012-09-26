function foof(bar:string, x):string;
function foof(bar:string, y):number;
function foof(bar:any):any{ return bar };
var x = foof("s", null);
