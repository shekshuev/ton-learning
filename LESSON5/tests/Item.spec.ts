import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { Item } from '../wrappers/Item';
import '@ton-community/test-utils';
import { Item2 } from '../build/Item/tact_Item2';
import { Item3 } from '../build/Item/tact_Item3';

describe('Item', () => {
    let blockchain: Blockchain;
    let item: SandboxContract<Item>;
    let item2: SandboxContract<Item2>;
    let item3: SandboxContract<Item3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        item = blockchain.openContract(await Item.fromInit());
        item2 = blockchain.openContract(await Item2.fromInit());
        item3 = blockchain.openContract(await Item3.fromInit(1n));

        const deployer = await blockchain.treasury('deployer');

        let deployResult = await item.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: item.address,
            deploy: true,
            success: true,
        });

        deployResult = await item2.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: item2.address,
            deploy: true,
            success: true,
        });

        deployResult = await item3.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: item3.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and item are ready to use
    });

    it('should return addresses', async () => {
        const firstAddress = await item.getMyAddress();
        const secondAddress = await item2.getMyAddress();

        const otherAddress1 = await item2.getOtherAddress();
        const otherAddress2 = await item.getOtherAddress();

        expect(firstAddress).toEqualAddress(otherAddress1);
        expect(secondAddress).toEqualAddress(otherAddress2);
    });

    it('should deploy new contract', async () => {
        const contractId = 14n;

        const deployer = await blockchain.treasury('deployer');
        const nonExistsAddress = await item3.getOtherAddress(contractId);

        await item3.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'DeployContract',
                id: contractId,
            }
        );

        const newItem = blockchain.openContract(await Item3.fromInit(contractId));
        const newItemAddress = await newItem.getMyAddress();
        const newId = await newItem.getId();

        expect(newItemAddress).toEqualAddress(nonExistsAddress);
        expect(newId).toEqual(contractId);
    });
});
