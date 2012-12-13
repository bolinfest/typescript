// Scenario 1: Test reqursive function call with "this" parameter
// Scenario 2: Test recursive function call with cast and "this" parameter

declare module {
	export class Element {}

	export interface IArguments {}
}


declare module Sample.Thing {

	export interface IWidget {
		getDomNode(): any;
		destroy();
		gar(runner:(widget:Sample.Thing.IWidget)=>any):any;
	}

	export interface ICodeThing {
  
  		getDomNode(): Element;
		
		addWidget(widgetId:string, widget:IWidget);

		
		focus(); 
		
		//addWidget(widget: Sample.Thing.Widgets.IWidget);
	}

	export interface IAction {
		run(Thing:ICodeThing):bool;
		getId():string;
	}	
}

module Sample.Actions.Thing.Find {
	export class StartFindAction implements Sample.Thing.IAction {
		
		public getId() => "yo";
		
		public run(Thing:Sample.Thing.ICodeThing):bool {

			return true;
		}
	}
}

module Sample.Thing.Widgets {
	export class FindWidget implements Sample.Thing.IWidget {

		public gar(runner:(widget:Sample.Thing.IWidget)=>any) { if (true) {return runner(this);}}
			
		private domNode:any = null;
		constructor(private codeThing: Sample.Thing.ICodeThing) {
		    // scenario 1
		    codeThing.addWidget("addWidget", this);
		}
		
		public getDomNode() {
			return domNode;
		}
		
		public destroy() {

		}

	}
}

interface IMode { getInitialState(): IState;} 
class AbstractMode implements IMode { public getInitialState(): IState => null;}

interface IState {}


module Sample.Thing.Languages.PlainText {
	
	export class State implements IState {		
        constructor(private mode: IMode) { }
		public clone():IState {
			return this;
		}

		public equals(other:IState):bool {
			return this === other;
		}
		
		public getMode(): IMode => mode;
	}
	
	export class Mode extends AbstractMode {

		// scenario 2
		public getInitialState(): IState {
			return new State(self);
		}


	}
}

