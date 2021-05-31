<script>
    import { appStore } from '../data/appStore'
    import firebase from 'firebase/app'
    import 'firebase/auth'

    const handleGoogleSignin = () => {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(() => appStore.set('online'))
        .catch(error => console.error(error))
    }
</script>

<button class="onlineButton" on:click={handleGoogleSignin}></button>

<style>
.onlineButton {
    background: url('../img/google/google_normal.png');
    width: 382px;
    height: 92px;
    border: none;
}
.onlineButton:hover{background: url('../img/google/google_focused.png');}
.onlineButton:focus{background: url('../img/google/google_pressed.png');}
</style>