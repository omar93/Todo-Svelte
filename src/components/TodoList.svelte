<script>
    import Todo from './Todo.svelte'
    import dbhandler from '../lib/firebaseDB'
    import { idStore } from '../data/idStore'
    import { appStore } from '../data/appStore'
    import { todoStore } from '../data/todoStore'

    
    let db = new dbhandler()
    let userID

    idStore.subscribe(data => userID = data)
    const removeChild = ({detail: id}) => {
        $todoStore = $todoStore.filter(todo => todo.id != id)
        if($appStore === 'online') db.removeTodo(id,userID)
    }

    const updateChild = ({detail})=> {
        console.log('The one that was clicked:')
        console.log(detail)
        const index = $todoStore.findIndex(item => item.id === detail.id)
        $todoStore[index] = detail
        if($appStore === 'online') db.updateTodo(detail,userID)
    }


</script>


<div class="span-container">
    <span>Needs to be done</span>
</div>
<hr>
<ul>
    {#each $todoStore.filter(todo => !todo.isDone) as todo}
        <Todo {...todo} on:remove={removeChild} on:update={updateChild}></Todo>
    {/each}
</ul>

<br>
<div class="span-container">
    <span>Finished</span>
</div>

<hr>
<ul>
    {#each $todoStore.filter(todo => todo.isDone) as todo}
        <Todo {...todo} on:remove={removeChild} on:update={updateChild}></Todo>
    {/each}
</ul>

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