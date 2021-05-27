<script>
    import Todo from './Todo.svelte'
    import { todoStore } from '../store/todoStore'

    const removeChild = ({detail: id}) => {
        $todoStore = $todoStore.filter(todo => todo.id != id)
    }

    const updateChild = ({detail})=> {
        const index = $todoStore.findIndex(item => item.id === detail.id)
        $todoStore[index] = detail
    }
</script>

<ul>
    {#each $todoStore as todo}
        <Todo {...todo} on:remove={removeChild} on:update={updateChild}></Todo>
    {/each}
</ul>

<style>
    ul {
        width: 400px;
        list-style: none;
        flex-direction: column-reverse;
    }
</style>