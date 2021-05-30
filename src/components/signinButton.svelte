<script>
    import firebase from 'firebase/app'
    import 'firebase/auth'

    const handleGoogleSignin = () => {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch(error => console.error(error))
    }

    const handleSignout = () => {
        console.log('User signed out')
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