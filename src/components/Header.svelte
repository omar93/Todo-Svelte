<script>
	import firebase from 'firebase/app'
	import 'firebase/auth'
	import dbhandler from '../lib/firebaseDB'
	import MenuButton from './MenuButton.svelte'
	import { idStore } from '../data/idStore'
	import { appStore } from '../data/appStore'
	import { headerColorStore } from '../data/headerColorStore'

	let db = new dbhandler()
	let color,url,app

	headerColorStore.subscribe(col => color = col)
	appStore.subscribe(data => app = data)

	firebase.auth().onAuthStateChanged(async Currentuser => {
		if (Currentuser) {
			idStore.set(Currentuser.uid)
			db.checkUser(firebase.auth().currentUser)
			url = Currentuser.photoURL
			localStorage.setItem('uid', Currentuser.uid)
			if(app === 'online') db.ListenToChanges(Currentuser.uid)
		} else {
			console.log('You are offline, no syncing availabe')
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
		height: 100%;
		display: flex;
		justify-content: flex-end;
	}
	#img {
		border-radius: 100%;
		height: 50px;
		width: 50px;
		margin-top: 3px;
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

	@media screen and (max-width: 992px) {
		#img {
			border-radius: 100%;
			height: 30px;
			width: 30px;
			margin-top: 10px;
			margin-left: 10px;
		}

		.menu {
			margin-right: 10px;
			z-index: 2;
			margin-top: 5px;
		}
	}
</style>