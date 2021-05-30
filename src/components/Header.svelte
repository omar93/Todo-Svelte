<script>
	import firebase from 'firebase/app'
	import 'firebase/auth'
	import dbhandler from '../lib/firebaseDB'
	import MenuButton from './MenuButton.svelte'
	import { headerColorStore } from '../store/headerColorStore'

	let db = new dbhandler()
	let color,url
	headerColorStore.subscribe(col => color = col)

	firebase.auth().onAuthStateChanged(async Currentuser => {
    if (Currentuser) {
        db.checkUser(firebase.auth().currentUser)
        url = Currentuser.photoURL
        localStorage.setItem('uid', Currentuser.uid)
    } else {
		console.log('no user in')
		url = './profile.jpg'
	}
})

</script>

<div class="header" style="background-color:{color};">
    <img id="img" src="{url}" alt="profile">
	<p class="title">Svelte-Todo-App</p>
	<div class="menu">
		<MenuButton on:menu></MenuButton>
	</div>
</div>

<style>
	.header {
		/*background-color: #ff69b4; the original color*/
		width: 100%;
		height: 60px;
		display: flex;
		justify-content: flex-end;
	}
	#img {
		border-radius: 100%;
		height: 50px;
		width: 50px;
		margin-top: 5px;
		margin-left: 3px;
	}
	.menu {
		margin-right: 10px;
		z-index: 2;
		margin-top: 7px;
	}
	.title {
		margin:auto;
		color: white;
	}
</style>