<script>
    import { appStore } from '../data/appStore'
    import { todoStore } from '../data/todoStore'
    import GoogleSigninButton from './GoogleSigninButton.svelte'
    import firebase from 'firebase/app'
    import 'firebase/auth'

    let appStatus
    appStore.subscribe(data => appStatus = data)
    const handleSignout = () => {
        console.log('User signed out')
        firebase.auth().signOut().then(() => {
            appStore.set('new')
            todoStore.set([])
        })
        .catch(err => console.error('Sign Out Error', err))   
    }
</script>

{#if appStatus === 'offline'}
    <GoogleSigninButton large={false}></GoogleSigninButton>
{:else if appStatus === 'online'}
    <button class="onlineButton" on:click={handleSignout}>Logout</button>
{/if}

<style>
    .onlineButton {
        width: 100%;
        height: 50px;
    }
</style>
