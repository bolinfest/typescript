// bug 520891:  Compiler allows AMD module import from relative path without . or .. 

import a = module('A/A');

a.A();