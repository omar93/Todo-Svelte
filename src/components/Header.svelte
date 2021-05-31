<script>
	import firebase from 'firebase/app'
	import 'firebase/auth'
	import dbhandler from '../lib/firebaseDB'
	import MenuButton from './MenuButton.svelte'
	import { idStore } from '../data/idStore'
	import { appStore } from '../data/appStore'
	import { todoStore } from '../data/todoStore'
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
			if(app === 'online') {
				let todosRef = firebase.firestore().collection('users').doc(Currentuser.uid).collection('todos')
				todosRef.onSnapshot(querySnapshot => {
					let todoArr = []
					querySnapshot.forEach(doc => {
						todoArr = [...todoArr, doc.data()]
					})
					todoStore.set(todoArr)
				})
			}
		} else {
			console.log('You are offline, no syncing availabe')
			url = './profile.jpg'
		}
	})

	function printLocal (firebaseTodos) {
		console.log(firebaseTodos)
		let localTodos = localStorage.getItem('Todos')
		let todoArr = JSON.parse(localTodos)
		todoArr.forEach(todo => {
			
		})
	}

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