interface IPropertySet {

  [index: string]: any;

}


var ps: IPropertySet = null;
var index: any = "hello";
ps[index] = 12;