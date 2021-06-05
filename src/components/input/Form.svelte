<script>
    import { appStore } from '../../data/appStore'
    import { todoStore } from '../../data/todoStore'
    import uuid from 'uuid-v4'
    import dbHandler  from '../../lib/firebaseDB'

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
</div>


<style>
    .input {
        width: 100%;
        grid-area: input;
        border:2px solid #dadada;
    }
    input[type=text] {
        width: 100%;
        padding: 12px 20px;
        margin: 8px 0;
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }
    .input:focus {
        outline:rgb(5, 168, 5);
        border-color: rgb(5, 168, 5);
    }

</style>