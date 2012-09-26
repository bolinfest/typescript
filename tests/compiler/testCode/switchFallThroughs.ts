function R1(index: number) {
    switch (index) {
        case 0:
        case 1:
        case 2:
            return 'a';
		case 3:
		default:
			return 'b';
    }
}
