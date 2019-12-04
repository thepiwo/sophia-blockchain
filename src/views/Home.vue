<template>
  <div style="padding: 10px">
    <div class="overlay-loader" v-show="showLoading">
      <BiggerLoader/>
    </div>

    <h2 class="h2">Account:</h2>
    {{address}}
    <br/>
    <br/>

    <div v-if="state">
      <h2 class="h2">Balances:</h2>
      <div v-for="acc in state.chainstate" style="padding-left: 20px">
        {{acc[0].substring(0, 10)}}...: {{acc[1]}}
      </div>
      <br/>

      <button @click="mine()" style="border: solid gray 1px; padding: 2px;">Mine Block</button>
      <button @click="tx()" style="border: solid gray 1px; padding: 2px;">Random Tx</button>
      <br/>
      <br/>

      <h2 class="h2">Pool: {{state.pool.length}}</h2>
      <br/>

      <h2 class="h2">Chain:</h2>
      <div v-for="[hash, data] in state.chain.sort((a, b) => b[1].header.height - a[1].header.height)">
        {{data.header.height}} ({{hash.substring(0, 20)}}...)
        <div v-if="data.txs.length">
          <div v-for="tx in data.txs" style="padding-left: 20px">
            <span v-if="tx['Coinbase']">CB: {{tx['Coinbase'][0].substring(0, 10)}}... {{tx['Coinbase'][1]}}</span>
            <span v-if="tx['Transaction']">TX: {{tx["Transaction"][0].substring(0, 10)}}... --> {{tx["Transaction"][1].substring(0, 10)}}...: {{tx["Transaction"][2]}} ({{tx["Transaction"][3]}})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import aeternity from "../utils/aeternity";
    import axios from "axios";
    import {Crypto} from "@aeternity/aepp-sdk";
    import contractSource from '../../contracts/Blockchain.aes';
    import BiggerLoader from "../components/BiggerLoader";
    import {AeButton} from "@aeternity/aepp-components";

    export default {
        name: 'Home',
        components: {BiggerLoader, AeButton},
        data() {
            return {
                address: null,
                state: null,
                showLoading: true,
                contract: null
            };
        },

        methods: {
            async mine() {
                this.showLoading = true;
                this.state = (await this.contract.methods.get_state()).decodedResult;

                await this.contract.methods.mine(this.state.top_block_hash);
                this.state = (await this.contract.methods.get_state()).decodedResult;
                this.showLoading = false;
            },
            async tx() {
                this.showLoading = true;

                await this.contract.methods.add_transaction(Crypto.generateKeyPair().publicKey, Math.ceil(Math.random() * 5000));
                this.state = (await this.contract.methods.get_state()).decodedResult;
                this.showLoading = false;
            }
        },
        async mounted() {
            await aeternity.initClient();
            this.address = aeternity.address;

            if (aeternity.isTestnet() && aeternity.balance <= 5) {
                await axios.post(`https://testnet.faucet.aepps.com/account/${aeternity.address}`, {}, {headers: {'content-type': 'application/x-www-form-urlencoded'}}).catch(console.error);
            }

            this.contract = await aeternity.client.getContractInstance(contractSource, {contractAddress: 'ct_2JFGrL7ZhsqMRcX5mewpgWdq5gnc7CUGr3N5xhPnR63dCHZsZP'});
            this.state = (await this.contract.methods.get_state()).decodedResult;
            this.showLoading = false;
        },
    };
</script>

<style scoped>

</style>
