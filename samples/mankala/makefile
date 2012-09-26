ALLSRC = base.ts Features.ts Game.ts Position.ts Driver.ts Geometry.ts
SRC = Driver.ts
game: $(SRC)
	..\..\bin\tsc $(SRC) -out game.js	

local: $(SRC)
	..\..\built\local\tsc $(SRC) -out gameLocal.js

run:
	game.js

debug:
	game.js


