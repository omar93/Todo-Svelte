<script>
	import TodoList from './components/TodoList.svelte'
	import Form from './components/Form.svelte'
	let todoTextLength = 80
</script>

<main>
	<Form {todoTextLength}></Form>
	<TodoList></TodoList>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
	}
</style>