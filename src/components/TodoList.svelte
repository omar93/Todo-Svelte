<script>
    import Todo from './Todo.svelte'
    import { todoStore } from '../store/todoStore'

</script>

<ul>
    {#each $todoStore as todo}
        <Todo {todo}></Todo>
    {/each}
</ul>

<style>
    ul {
        width: 400px;
        border: 1px solid black;
        list-style: none;
        padding-left: 0;
        margin-left: 300px;
        margin: auto;
    }
</style>