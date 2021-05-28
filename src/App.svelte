<script>
	import './service/sw-install'
	import Header from './components/Header.svelte'
	import Menu from './components/Menu.svelte'
	import TodoList from './components/TodoList.svelte'
	import Form from './components/Form.svelte'

	let todoTextLength = 80
	let menuVisable = true

	const toggleMenu = () => menuVisable = !menuVisable
	
</script>


<div id="menuContainer" >
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
		height: 5%;
	}

	#parent {
		grid-area: main;
		display: flex;
		flex-direction: column;
		height: 95%;
		width: 40%;
		margin: auto;
	}
	/*
	
	#menuContainer {
		position: absolute;
		background-color: blueviolet;
		width: 100%;
	}

	*/
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