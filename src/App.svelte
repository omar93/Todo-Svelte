<script>
	import TodoList from './components/TodoList.svelte'
	import Form from './components/Form.svelte'
	let todoTextLength = 80
</script>

<main>

	<div id="listContainer">
		<TodoList></TodoList>
	</div>

	<div id="formContainer">
		<Form {todoTextLength}></Form>
	</div>

</main>

<style>
	main {
		display: flex;
		height: 100%;
		width: 600px;
		flex-direction: column;
		position: absolute;
    	bottom:0px;
		left:50%;
		margin-left:-300px;
	}
	#listContainer {
		align-self: center;
	}
	#formContainer {
		margin-bottom: 30px;
		margin-top: auto;
		align-self: center;
	}

	@media screen and (max-width: 992px) {
		main {
			height: 70%;
			margin-top: auto;
		}
	}
</style>