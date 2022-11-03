<script>
    import { appStore } from '../data/appStore'
    import GoogleSignin from './GoogleSigninButton.svelte'

    const handleOffline = () => {
        if (confirm('Are you want to continue offline?')) {
            appStore.set('offline')
        }
    }

</script>

<div class="welcome">
    <p>Welcome</p>
    <div class="online">
        <p>Sigin to google to sync your todos across your devices</p>
        <GoogleSignin></GoogleSignin>
    </div>
    <div class="offline">
        <p>contine offline, todos will only be saved locally!</p>
        <button class="offlineButton" on:click={handleOffline}>Continue offline</button>
    </div>
</div>

<style>
    .welcome {
        position:absolute;
        width: 1000px;
        height: 600px;
        border: 1px solid black;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        margin-top: 10%;
        max-width: 100%;
        max-height: 100%;
        overflow: auto;
        border-radius: 25px;
        text-align: center;
    }
    p {
        font-size: 2em;
    }
    .online {
        margin-top: 30px;
    }
    .offline {
        margin-top: 100px;
    }
</style>