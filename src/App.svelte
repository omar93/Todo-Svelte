<script>
	// import './lib/sw-install'
	import { onMount } from 'svelte'
	import MenuButton from './components/MenuButton.svelte'
	import TodoList from './components/TodoList.svelte'
	import Welcome from './components/Welcome.svelte'
	import Form from './components/Form.svelte'
	import Menu from './components/Menu.svelte'
	
	import { backgroundColorStore } from './data/backgroundColorStore'
	import { appStore } from './data/appStore'
	
	$: innerWidth = 0

	onMount(() => {if(innerWidth > 992) menuVisable = true})

	let todoTextLength = 80
	let menuVisable = false
	let choice

	appStore.subscribe(data => choice = data)
	const toggleMenu = () => menuVisable = !menuVisable
	backgroundColorStore.subscribe(col => window.document.body.style.background = col)

	const handleResize = () => {
		if (innerWidth > 992) {
			menuVisable = true
		} else {
			menuVisable = false
		}
	}
	
</script>
<svelte:window bind:innerWidth on:resize={handleResize}/>

{#if choice === 'new'}
	<Welcome></Welcome>
{:else}

<div id="mainContainer">
	<div id="headerContainer">
		<MenuButton on:menu={toggleMenu}/>
	</div>

	<div id="menuContainer">
		{#if menuVisable}
			<Menu></Menu>
		{/if}
		
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
		grid-template-rows: 1fr 60px;
		grid-template-columns: 19% 1fr 79% 1fr;
		height: 100vh;
		grid-template-areas:
		'menu	.	list'
		'menu	.	input';
	}


	#headerContainer {
		display: none;
	}

	#menuContainer {
		grid-area: menu;
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
			grid-template-rows: 55px 1fr 60px;
			grid-template-areas: 
			'header'
			'list'
			'input';
		}

		#headerContainer {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			margin-right: 10px;
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

		#menuContainer {
			grid-area: list;
			z-index: 1;
		}
	}


</style>