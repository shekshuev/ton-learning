import "@stdlib/deploy";

fun sum(a: Int, b: Int): Int {
    return a + b;
}

extends fun mul(self: Int, b: Int): Int {
    return self * b;
}

extends mutates fun add(self: Int, b: Int) {
    self = self + b;
}

message Test {
    value: Int as uint32;
}

contract Functions with Deployable {

    num: Int as uint32;

    init() {
        self.num = 0;
    }

    receive() {}

    receive("add") {
        self.num.add(1);
    }

    bounced(src: Test) {}

    get fun balance(): Int {
        return myBalance();
    }

    fun f1() {
        sum(2, 5);
    }

    get fun mulResult(): Int {
        return self.num.mul(5);
    }
}
