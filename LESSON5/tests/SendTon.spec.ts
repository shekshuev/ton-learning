import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { fromNano, toNano } from 'ton-core';
import { SendTon, Withdraw } from '../wrappers/SendTon';
import '@ton-community/test-utils';

describe('SendTon', () => {
    let blockchain: Blockchain;
    let sendTon: SandboxContract<SendTon>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sendTon = blockchain.openContract(await SendTon.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sendTon.send(
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
            to: sendTon.address,
            deploy: true,
            success: true,
        });

        sendTon.send(
            deployer.getSender(),
            {
                value: toNano('500'),
            },
            null
        );
    });

    it('should deploy and receive 500 ton', async () => {
        // the check is done inside beforeEach
        // blockchain and sendTon are ready to use

        const balance = await sendTon.getBalance();
        console.log(`balance - ${balance}`);
    });

    it('should withdraw all', async () => {
        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance();
        await sendTon.send(
            user.getSender(),
            {
                value: toNano('0.2'),
            },
            'withdraw all'
        );
        const balanceAfterUser = await user.getBalance();
        expect(balanceBeforeUser).toBeGreaterThanOrEqual(balanceAfterUser);

        const balanceBefore = await deployer.getBalance();
        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            'withdraw all'
        );
        const balanceAfter = await deployer.getBalance();
        expect(balanceAfter).toBeGreaterThan(balanceBefore);
    });

    it('should withdraw safe', async () => {
        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance();
        await sendTon.send(
            user.getSender(),
            {
                value: toNano('0.2'),
            },
            'withdraw safe'
        );
        const balanceAfterUser = await user.getBalance();
        expect(balanceBeforeUser).toBeGreaterThanOrEqual(balanceAfterUser);

        const balanceBefore = await deployer.getBalance();
        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            'withdraw safe'
        );
        const balanceAfter = await deployer.getBalance();
        expect(balanceAfter).toBeGreaterThan(balanceBefore);

        const contractBalance = await sendTon.getBalance();
        expect(contractBalance).toBeGreaterThan(0n);
    });

    it('should withdraw message', async () => {
        const message: Withdraw = {
            $$type: 'Withdraw',
            amount: toNano('150'),
        };

        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance();
        await sendTon.send(
            user.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );
        const balanceAfterUser = await user.getBalance();
        expect(balanceBeforeUser).toBeGreaterThanOrEqual(balanceAfterUser);

        const balanceBefore = await deployer.getBalance();
        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );
        const balanceAfter = await deployer.getBalance();
        expect(balanceBefore + toNano('150')).toBeGreaterThanOrEqual(balanceAfter);

        const contractBalance = await sendTon.getBalance();
        expect(contractBalance).toBeGreaterThan(0n);
    });
});
