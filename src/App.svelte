<script>
	import './lib/sw-install'
	import Header from './components/Header.svelte'
	import Menu from './components/Menu.svelte'
	import TodoList from './components/TodoList.svelte'
	import Form from './components/Form.svelte'
	import { backgroundColorStore } from './store/backgroundColorStore'
	let todoTextLength = 80
	let menuVisable = false

	const toggleMenu = () => menuVisable = !menuVisable
	backgroundColorStore.subscribe(col => window.document.body.style.backgroundColor = col)
	
</script>


<div id="menuContainer">
	{#if menuVisable} 
		<Menu></Menu>
	{/if}
</div>
<div id="headerContainer">
	<Header on:menu={toggleMenu}></Header>
</div>
<div id="parent">
	<div id="listContainer">
		<TodoList></TodoList>
	</div>

	<div id="formContainer">
		<Form {todoTextLength}></Form>
	</div>
</div>


<style>
	#headerContainer {
		height: 6%;
	}
	#parent {
		grid-area: main;
		display: flex;
		flex-direction: column;
		height: 94%;
		width: 40%;
		margin: auto;
	}

	#listContainer {
		width: 100%;
		height: 100%;
		overflow: scroll;
		overflow-x: hidden;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	#listContainer::-webkit-scrollbar {
    	display: none;
	}

	#formContainer {
		margin-top: auto;
	}

	@media screen and (max-width: 992px) {
		#parent {
			width: 100%;
			border:0;
			margin: auto;
			position:static;
		}
		#listContainer {
			align-self: center;
			width: 85%;
		}
		#formContainer {
			width: 100%;
		}
	}


</style>