module Test {
    interface IState {
    }
    interface IToken {
        startIndex: number;
    }
    interface ILineTokens {
        tokens: IToken[];
        endState: IState;
    }
    interface IMode {
        tokenize(line:string, state:IState, includeStates:bool):ILineTokens;
    }
    export class Bug implements IMode {
        public tokenize(line:string, tokens:IToken[], includeStates:bool):ILineTokens {
            return null;
        }
    }    
}
