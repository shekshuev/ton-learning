import "@stdlib/deploy";

message Withdraw {
    amount: Int as coins;
}

contract SendTon with Deployable {

    const minTonForStorage: Int = ton("0.01");

    owner: Address;

    init() {
        self.owner = sender();
    }

    fun onlyOwner() {
        require(sender() == self.owner, "Only owner is allowed to withdraw");
    }

    receive() {

    }

    receive("withdraw safe") {
        self.onlyOwner();
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - context().value - self.minTonForStorage,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    receive("withdraw all") {
        self.onlyOwner();
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    receive(msg: Withdraw) {
        self.onlyOwner();
        let amount: Int = min(msg.amount, myBalance() - context().value - self.minTonForStorage);
        require(amount > 0, "Insufficient balance");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: amount,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    get fun balance(): Int {
        return myBalance();
    }
}
