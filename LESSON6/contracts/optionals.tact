import "@stdlib/deploy";

struct StrcOpts {
    num: Int?;
    bool: Bool?;
    addr: Address?;
}

message MsgOpts {
    num: Int?;
    bool: Bool?;
    addr: Address?;
    opts: StrcOpts?;
}

contract Optionals with Deployable {

    num: Int?;
    bool: Bool?;
    addr: Address?;

    init(a: Int?, b: Bool?, c: Address?) {
        self.num = a;
        self.bool = b;
        self.addr = c;
    }

    receive(msg: MsgOpts) {
        if (msg.num != null) {
            self.num = msg.num!!;
        }
    }

    get fun optInt(): Int? {
        return self.num;
    }

    get fun optIntVal(): Int {
        if (self.num != null) {
            return self.num!!;
        } else {
            return -1;
        }
    }
}
