<script>
    import Todo from './Todo.svelte'
    import dbhandler from '../lib/firebaseDB'
    import { idStore } from '../data/idStore'
    import { appStore } from '../data/appStore'
    import { todoStore } from '../data/todoStore'
    import Modal from './Modal.svelte'
    
    let db = new dbhandler()
    let userID
    let modal = false
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

    const createNewList = () => {
        modal = true
    }

    const handleNewList = e => {
        console.log('list name: ',e.detail)
        modal = false
    }
</script>
{#if modal}
    <Modal on:new-list={handleNewList}></Modal>
{/if}
<div class="list-name-container">
    <h2>Handla</h2>
    <img src="./img/new-list.png" alt="new list icon" on:click={createNewList}>
</div>
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

    .list-name-container {
        display: flex;
        justify-content: space-between;
        position: relative;
    }
    ul {
        margin: 0;
        padding: 0;
        max-width: 100%;
        list-style: none;
    }

    .span-container {
        text-align: center;
    }

    img:hover { cursor: pointer; }
    img {
        object-fit: contain;
        height: 40px;
        margin-top: 2%;
        margin-right: 10px;
    }

</style>