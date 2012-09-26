declare var console;
"use strict";
module Test {
    export interface IState {
    }

    export interface IToken {
    }

    export interface ILineTokens {
        tokens: IToken[];
        endState: IState;
    }

    export class Gar {
        public moo: number = 0;
    }

    /* BUG 13273
    export function bug(): ILineTokens {
      var state:IState= null;
      return {
       tokens: Gar[],//IToken[],  // Missing new. Correct syntax is: tokens: new IToken[]
       endState: state
      };
     }
    }
*/
}