declare module M {
	interface iBar { t: any; }
	interface iFoo extends iBar {
		s:any;
	}

	class cFoo {
		t:any;
	}

	var foo: { [index: any]; }; // expect an error here
}
