<script>
    import firebase from 'firebase/app'
    import 'firebase/auth'
    import dbhandler from '../lib/firebaseDB'
    import { userStore } from '../store/userStore'

    let db = new dbhandler()

    firebase.auth().onAuthStateChanged(async Currentuser => {
        if (Currentuser) {
            console.log('we in boys')
            db.checkUser(firebase.auth().currentUser)
            let obj = {
                username: Currentuser.displayName,
                email: Currentuser.email,
                photoUrl: Currentuser.photoURL,
                uid: Currentuser
            }
            userStore.set(obj)
        }
    })

    const handleGoogleSignin = () => {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch(error => console.error(error))
    }

    const handleSignout = () => {
        firebase.auth().signOut().then(() => {
        }, err => {
            console.error('Sign Out Error', err)
        })
    }
</script>

<button on:click={handleGoogleSignin}>
    Google signin
</button>

<button on:click={handleSignout}>
    Google signout
</button>
<style>

</style>