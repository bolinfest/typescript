var arr = null;
for (var i:number in arr) { // error
    var x = arr[i];
    var y = arr[i];
}

for (var i in arr) { // ok
    var x = arr[i];
    var y = arr[i];
}

var arr2 = [];
for (i in arr2) { // ok
    var x = arr2[i];
    var y = arr2[i];
}