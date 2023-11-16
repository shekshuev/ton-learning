import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { CompleteTodo, NewTodo, TodoParent } from '../wrappers/TodoParent';
import '@ton-community/test-utils';
import { TodoChild } from '../wrappers/TodoChild';

describe('TodoParent', () => {
    let blockchain: Blockchain;
    let todoParent: SandboxContract<TodoParent>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        todoParent = blockchain.openContract(await TodoParent.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await todoParent.send(
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
            to: todoParent.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and todoParent are ready to use
    });

    it('should create todo', async () => {
        const deployer = await blockchain.treasury('deployer');

        const message: NewTodo = {
            $$type: 'NewTodo',
            task: 'todo1',
        };
        await todoParent.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            message
        );

        const todoChildAddress = await todoParent.getTodoAddress(1n);

        const todoChild = blockchain.openContract(TodoChild.fromAddress(todoChildAddress));

        let details = await todoChild.getDetails();

        expect(details.task).toBe('todo1');

        const messageComplete: CompleteTodo = {
            $$type: 'CompleteTodo',
            seqno: 1n,
        };

        await todoParent.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            messageComplete
        );

        details = await todoChild.getDetails();

        expect(details.completed).toBeTruthy();
    });
});
