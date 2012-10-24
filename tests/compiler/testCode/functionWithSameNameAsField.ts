// Regression test for bug 16345
class TestProgressBar {
    public total: number;
    public total(total: number) {
        this.total = total;
        return this;
    }
}
