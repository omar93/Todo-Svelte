<script>
	// import './lib/sw-install'

	import Welcome from './components/Welcome.svelte'
	import Header from './components/Header/Header.svelte'
	import Menu from './components/Header/Menu.svelte'
	import TodoList from './components/Todo/TodoList.svelte'
	
	import { appStore } from './data/appStore'
	import { backgroundColorStore } from './data/backgroundColorStore'
	

	let todoTextLength = 80
	let menuVisable = false
	let choice

	appStore.subscribe(data => choice = data)
	const toggleMenu = () => menuVisable = !menuVisable
	backgroundColorStore.subscribe(col => window.document.body.style.backgroundColor = col)
	
</script>

{#if choice === 'new'}
	<Welcome></Welcome>
{:else}



<div class="grandParent">

	<div id="menuContainer">
		{#if menuVisable} 
			<Menu></Menu>
		{/if}
	</div>
	
	<div id="headerContainer">
		<Header on:menu={toggleMenu}></Header>
	</div>

	<div id="listContainer">
		<TodoList></TodoList>
	</div>



</div>


{/if}

<style>

	.grandParent {
		margin: auto;
		display: grid;
		height: 100%;
		grid-template-rows: 50px 1fr;
		grid-template-columns: 25% 1fr 25%;
		grid-template-areas: 
		'header		header		header'
		'.			main		menu'
	}
	#headerContainer {
		border: 1px solid black;
		grid-area: header;
	}
	#menuContainer {
		grid-area: menu;
	}
	#listContainer {
		grid-area: main;
		overflow: scroll;
		overflow-x: hidden;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	#listContainer::-webkit-scrollbar {
    	display: none;
	}

	@media screen and (max-width: 992px) {
		.grandParent {
			display: grid;
			height: 100%;
			width: 100%;
			grid-template-rows: 50px 1fr;
			grid-template-columns: 100%;
			grid-template-areas: 
			'header'
			'main'
		}

		#menuContainer {
			position: absolute;
			width: 100%;
			height: 100%;
			margin-left: 0%;
			display: none;
		}

	}


</style>