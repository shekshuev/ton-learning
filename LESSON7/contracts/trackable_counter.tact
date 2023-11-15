import "@stdlib/deploy";
import "@stdlib/ownable";

message Add {
    queryId: Int as uint64;
    amount: Int as uint32;
}

trait Trackable with Ownable {
    numMessagesReceived: Int;
    owner: Address;

    virtual const ENABLE_RESET: Bool = true;

    fun receiveNewMessage() {
        if (self.filterMessage()) {
            self.numMessagesReceived = self.numMessagesReceived + 1;
        }
    }

    get fun stats(): Int {
        return self.numMessagesReceived;
    }

    receive("reset stats") {
        if (self.ENABLE_RESET) {
            self.requireOwner();
            self.numMessagesReceived = 0;
            self.reply("reset done".asComment());
        }
    }

    virtual fun filterMessage(): Bool {
        if (sender() == self.owner) {
            return false; 
        } else {
            return true;
        }
    }
}

contract TrackableCounter with Deployable, Trackable {
    id: Int as uint32;
    counter: Int as uint32;
    numMessagesReceived: Int as uint32;
    owner: Address;
    override const ENABLE_RESET: Bool = false;

    init(id: Int) {
        self.id = id;
        self.counter = 0;
        self.numMessagesReceived = 0;
        self.owner = sender();
    }

    receive(msg: Add) {
        self.receiveNewMessage();
        self.counter = (self.counter + msg.amount);
    }

    get fun counter(): Int {
        return self.counter;
    }

    get fun id(): Int {
        return self.id;
    }

    override fun filterMessage(): Bool {
        return true;
    }
}
