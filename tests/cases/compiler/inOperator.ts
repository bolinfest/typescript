var a=[];
for (var x in a) {
    
}
if (3 in a) {
    
}

// Bug 17073: 'in' operator type rules don't match spec
var b = '' in 0;