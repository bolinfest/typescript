interface I {
    f(s:string):number;  
    f(n:number):string;
    g(n:number):any; 
    g(n:number,m:number):string;
    h(n:number):I;  
    h(b:bool):number;
    i(b:bool):number;
    i(b:bool):any;
}