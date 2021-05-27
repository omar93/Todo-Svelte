<script>
	import Header from './components/Header.svelte'
	import Menu from './components/Menu.svelte'
	import TodoList from './components/TodoList.svelte'
	import Form from './components/Form.svelte'
	let todoTextLength = 80
	let isHidden = true
	const toggleMenu = () => {
		isHidden = !isHidden
	}
</script>
<Header on:menu={toggleMenu}></Header>
<div class="{isHidden ? 'hidden' : ''}">
	<Menu></Menu>
</div>

<main>
	<div id="listContainer">
		<TodoList></TodoList>
	</div>

	<div id="formContainer">
		<Form {todoTextLength}></Form>
	</div>
</main>

<style>
	.hidden {
		display: none;
	}
	main {
		display: flex;
		height: 95%;
		width: 40%;
		flex-direction: column;
		position: absolute;
    	bottom:0px;
		left:50%;
		margin-left:-20%;
	}
	#listContainer {
		align-self: center;
		width: 100%;
		overflow: scroll;
		overflow-x: hidden;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	#listContainer::-webkit-scrollbar {
    display: none;
}
	#formContainer {
		margin-bottom: 1px;
		margin-top: auto;
		align-self: center;
		width: 100%;
	}

	@media screen and (max-width: 992px) {
			main {
			width: 85%;
			border:0;
			margin: auto;
			position:static;
		}

		#listContainer {
			align-self: center;
			width: 100%;
		}

		#formContainer {
			margin-bottom: 1px;
			margin-top: auto;
			margin-left: 0;
		}
	}
</style>