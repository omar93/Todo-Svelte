<script>
	import Header from './components/Header.svelte'
	import Menu from './components/Menu.svelte'
	import TodoList from './components/TodoList.svelte'
	import Form from './components/Form.svelte'

	let todoTextLength = 80
	let isHidden = true

	const toggleMenu = () => isHidden = !isHidden
	
</script>
<!--

		<div id="menuContainer" class="{isHidden ? 'hidden' : ''}">
		<Menu></Menu>
	</div>

-->

<div id="parent">
	<Header on:menu={toggleMenu}></Header>

		<div id="listContainer">
			<TodoList></TodoList>
		</div>
	
		<div id="formContainer">
			<Form {todoTextLength}></Form>
		</div>

</div>


<style>
	#parent {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 40%;
		margin: auto;
	}
	/*
	
	#menuContainer {
		position: absolute;
		background-color: blueviolet;
		width: 100%;
	}
	.hidden {display: none;}
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