import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, WalletContractV4, fromNano, internal } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";

async function main() {
    const mnemonic =
        "upon volcano food found fruit evidence tongue always note actor illegal lounge snake elegant material power prevent name rigid mistake busy mandate apple program";
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });

    if (!(await client.isContractDeployed(wallet.address))) {
        console.log("wallet is not deployed");
    } else {
        console.log("wallet is deployed");
    }

    const balance = await client.getBalance(wallet.address);

    console.log(fromNano(balance));

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno,
        messages: [
            internal({
                to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
                value: "0.05",
                body: "Hello",
                bounce: false,
            }),
        ],
    });

    let currentSeqno = seqno;
    while (currentSeqno === seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed");
}

main();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
