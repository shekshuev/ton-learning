import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import '@ton-community/test-utils';
import { NftItem } from '../wrappers/NftItem';

describe('NftCollection', () => {
    let blockchain: Blockchain;
    let nftCollection: SandboxContract<NftCollection>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        nftCollection = blockchain.openContract(await NftCollection.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await nftCollection.send(
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
            to: nftCollection.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nftCollection are ready to use
    });

    it('should mint nft', async () => {
        await nftCollection.send(
            deployer.getSender(),
            {
                value: toNano('0.3'),
            },
            'Mint'
        );

        const nftItemAddress = await nftCollection.getGetNftAddressByIndex(0n);
        const nftItem = blockchain.openContract(NftItem.fromAddress(nftItemAddress));

        const nftItemData = await nftItem.getGetItemData();

        console.log(nftItemData.individual_content.beginParse().loadStringTail());

        const nftCollectionData = await nftCollection.getGetCollectionData();

        console.log(nftCollectionData.collection_content.beginParse().loadStringTail());

        const user = await blockchain.treasury('user');

        console.log(`old owner - ${await nftItem.getOwner()}`);

        await nftItem.send(
            deployer.getSender(),
            {
                value: toNano('0.3'),
            },
            {
                $$type: 'Transfer',
                new_owner: user.address,
                query_id: 0n,
            }
        );

        console.log(`new owner - ${await nftItem.getOwner()}`);
    });
});
