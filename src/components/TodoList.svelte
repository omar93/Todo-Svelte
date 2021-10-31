<script>
    import Todo from './Todo.svelte'
    import { idStore } from '../data/idStore'
    import { todoStore } from '../data/todoStore'

    let userID

    idStore.subscribe(data => userID = data)

    const removeChild = ({detail: id}) => {
        $todoStore = $todoStore.filter(todo => todo.id != id)
    }

    const updateChild = ({detail})=> {
        console.log('The one that was clicked:')
        console.log(detail)
        const index = $todoStore.findIndex(item => item.id === detail.id)
        $todoStore[index] = detail
    }

    $: todos = $todoStore.filter(todo => !todo.isDone)
    $: finishedTodos = $todoStore.filter(todo => todo.isDone)


</script>

{#if todos.length != 0}
    <div class="span-container">
        <span>Needs to be done</span>
    </div>
    <hr>
    <ul>
        {#each todos as todo}
            <Todo {...todo} on:remove={removeChild} on:update={updateChild}></Todo>
        {/each}
    </ul>
{/if}
<br>
{#if finishedTodos.length != 0}
    <div class="span-container">
        <span>Finished</span>
    </div>

    <hr>
    <ul>
        {#each finishedTodos as finished}
            <Todo {...finished} on:remove={removeChild} on:update={updateChild}></Todo>
        {/each}
    </ul>
{/if}

<style>
    ul {
        margin: 0;
        padding: 0;
        max-width: 100%;
        list-style: none;
    }

    .span-container {
        text-align: center;
    }
</style>