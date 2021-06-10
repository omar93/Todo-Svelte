<script>
	// import './lib/sw-install'

	import Welcome from './components/Welcome.svelte'
	import Header from './components/Header.svelte'
	import Menu from './components/Menu.svelte'
	import TodoList from './components/TodoList.svelte'
	import Form from './components/Form.svelte'
	
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

<div id="mainContainer">

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

	<div id="inputContainer">
		<Form {todoTextLength}></Form>
	</div>

</div>

{/if}

<style>
	#mainContainer {
		display: grid;
		grid-template-rows: 55px 1fr 55px;
		grid-template-columns: 20% 60% 20%;
		height: 100vh;
		grid-template-areas: 
		'header	header	header'
		'.	list	.'
		'.	input	.';
	}
	#headerContainer {
		grid-area: header;
	}

	#listContainer {
		grid-area: list;
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

	#inputContainer {
		grid-area: input;
	}

	@media screen and (max-width: 992px) {
		#mainContainer {
			grid-template-columns: 1fr;
			grid-template-areas: 
			'header'
			'list'
			'input';
		}
	}


</style>