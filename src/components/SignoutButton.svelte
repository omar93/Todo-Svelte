<script>
    import firebase from 'firebase/app'
    import 'firebase/auth'

    const handleSignout = () => {
        console.log('User signed out')
        firebase.auth().signOut().then(() => {
        }, err => {
            console.error('Sign Out Error', err)
        })
    }
</script>
<button class="onlineButton" on:click={handleSignout}>Logout</button>