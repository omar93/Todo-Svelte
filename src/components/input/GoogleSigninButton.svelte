<script>
    import { appStore } from '../../data/appStore'
    import firebase from 'firebase/app'
    import 'firebase/auth'

    export let large = true
    const handleGoogleSignin = () => {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(() => appStore.set('online'))
        .catch(error => console.error(error))
    }
</script>

<button class="{ large ? 'large' : 'small' }" on:click={handleGoogleSignin}></button>

<style>
.large {
    background: url('../img/google/large/google_normal.png');
    width: 382px;
    height: 92px;
    border: none;
}
.large:hover{background: url('../img/google/large/google_focused.png');}
.large:focus{background: url('../img/google/large/google_pressed.png');}

.small {
    background: url('../img/google/small/google_normal.png');
    width: 191px;
    height: 46px;
    border: none;
}
.small:hover{background: url('../img/google/small/google_focused.png');}
.small:focus{background: url('../img/google/small/google_pressed.png');}

@media screen and (max-width: 992px) {
    .small {
        background: url('../img/google/large/google_normal.png');
        width: 382px;
        height: 92px;
        border: none;
    }
    .small:hover{background: url('../img/google/large/google_focused.png');}
    .small:focus{background: url('../img/google/large/google_pressed.png');}

}
</style>