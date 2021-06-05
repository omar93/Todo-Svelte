<script>
    import { appStore } from '../data/appStore'
    import { todoStore } from '../data/todoStore'
    import uuid from 'uuid-v4'
    import dbHandler  from '../lib/firebaseDB'

    let db = new dbHandler()

    let textField
    const addTodo = async e => {
        e.preventDefault()

        let todo = {'todo':textField|'tja', 'id':uuid(),'isDone': false}
        textField ? todoStore.update(orignalArray => [...orignalArray, todo]) : ''
        if($appStore === 'online') db.addTodo(todo, localStorage.getItem('uid'))
        textField = ''
    }

</script>

<div id="parent">
    <form on:submit|self={addTodo}>
        <input class="input" type="text" bind:value={textField} placeholder="Todo">
    </form>
    <button class="add" on:click={addTodo}>➕</button>
</div>


<style>
    #parent {
        width: 100%;
        display: grid;
        grid-template-columns: 70px 1fr 70px;
        gap: 10px;
        grid-template-areas:
        'input add';
    }
    .input {
        width: 100%;
        grid-area: input;
        border:2px solid #dadada;
        border-radius:7px;
        margin-left: 1px;
    }
    .input:focus {
        outline:rgb(5, 168, 5);
        border-color: rgb(5, 168, 5);
    }
    .add {
        grid-area: add;
        background-color: white;
        border: 1px solid black;
        margin-left: 1.5px;
    }
    button {
        border-radius:7px;
    }

</style>