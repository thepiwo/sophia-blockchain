/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

const fs = require('fs');
const {Universal} = require("@aeternity/aepp-sdk");
const SOPHIA_BLOCKCHAIN_SOURCE = fs.readFileSync("./contracts/Blockchain.aes", "utf-8");

const config = {
    host: 'http://localhost:3001/',
    internalHost: 'http://localhost:3001/internal/',
    compilerUrl: 'http://localhost:3080'
};

describe('Sophia Blockchain', () => {
    let client, contract, lastBlock;

    before(async () => {
        client = await Universal({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: wallets[0],
            nativeMode: true,
            networkId: 'ae_devnet',
            compilerUrl: config.compilerUrl
        });
    });

    it('Deploying and Mine Genesis Block', async () => {
        contract = await client.getContractInstance(SOPHIA_BLOCKCHAIN_SOURCE);
        const init = await contract.methods.init();
        assert.equal(init.result.returnType, 'ok');

        const state = (await contract.methods.get_state()).decodedResult;
        assert.equal(state.chain.length, 1);
        lastBlock = state.chain[0][0]
    });

    it('Mine Block', async () => {
        const mine = await contract.methods.mine(lastBlock);
        assert.equal(mine.result.returnType, 'ok');
        lastBlock = mine.decodedResult;

        const state = (await contract.methods.get_state()).decodedResult;
        assert.equal(state.chainstate.find(x => x[0] === wallets[0], 1000));
    });

    it('Add Transaction', async () => {
        const add = await contract.methods.add_transaction(wallets[1].publicKey, 1111);
        assert.equal(add.result.returnType, 'ok');

        var mine = await contract.methods.mine(lastBlock);
        lastBlock = mine.decodedResult;
        mine = await contract.methods.mine(lastBlock);
        lastBlock = mine.decodedResult;

        const state = (await contract.methods.get_state()).decodedResult;
        assert.equal(state.chainstate.find(x => x[0] === wallets[1], 1111));
    });
});
