import "@stdlib/deploy";

message Add {
    amount: Int as uint32;
}

message Subtract {
    amount: Int as uint32;
}

message MultiMath {
    ops: Operations;
}

struct Operations {
    add: Int as uint32;
    subtract: Int as uint32;
    multiply: Int as uint32;
}


contract Messages with Deployable {
    val: Int as uint64;

    init() {
        self.val = 0;
    }

    receive() {

    }

    receive(msg: Add) {
        self.val = self.val + msg.amount;
    }

    receive(msg: Subtract) {
        self.val = self.val - msg.amount;
    }

    receive(msg: MultiMath) {
        self.val = self.val + msg.add;
        self.val = self.val - msg.subtract;
        self.val = self.val * msg.multiply;
    }

    receive("increment") {
        self.val = self.val + 1;
    }

    receive("decrement") {
        self.val = self.val - 1;
    }

    receive(msg: String) {
        //
    }

    receive(msg: Slice) {
        //
    }

    get fun value(): Int {
        return self.val;
    }
}
