<template>
  <div id="app" class="min-h-screen">
    <div class="content min-h-screen max-w-desktop">
      <div class="min-h-screen wrapper" ref="wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>

  import aeternity from './utils/aeternity.js'

  export default {
    name: 'app',
    methods: {
      async checkAndReloadProvider() {
        if (!aeternity.address) return;
        const changesDetected = await aeternity.verifyAddress();
        if (changesDetected) this.$router.go();
      }
    },
    async created() {
      try {
        // Bypass check if there is already an active wallet
        if (aeternity.hasActiveWallet())
          return

        // Otherwise init the aeternity sdk
        if (!(await aeternity.initClient()))
          throw new Error('Wallet init failed');

        // Constantly check if wallet is changed
        setInterval(this.checkAndReloadProvider, 1000)
      } catch (e) {
        console.error('Initializing Wallet Error', e);
      }
    }
  }
</script>

<style scoped>
  .min-h-screen {
    min-height: 100vh;
    max-height: 100vh;
    padding-bottom: 0;
    overflow-y: auto;
    background-color: #f8f8f8;
  }

  @media (min-width: 700px) {
    #app {
      position: relative;
      display: flex;
      justify-content: center;
    }
    .content {
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.15);
    }
  }
</style>
