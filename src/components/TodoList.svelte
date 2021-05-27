<script>
    import Todo from './Todo.svelte'
    import { todoStore } from '../store/todoStore'
import Todov2 from './Todov2.svelte'

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
        <Todov2></Todov2>
    {/each}
</ul>

<style>
    ul {
        margin: 0;
        padding: 0;
        max-width: 100%;
        list-style: none;
        
    }
</style>