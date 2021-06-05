<script>
    import { appStore } from '../data/appStore'
    import { todoStore } from '../data/todoStore'
    import uuid from 'uuid-v4'
    import dbHandler  from '../lib/firebaseDB'

    export let todoTextLength

    let db = new dbHandler()

    let textField
    const addTodo = async e => {
        if(textField.length > todoTextLength) {
            alert('Max 80 characters & needs to be bigger tha 0 character')
            textField = ''
            return
        }
        e.preventDefault()
        let todo = {'todo':textField, 'id':uuid(),'isDone': false}
        textField ? todoStore.update(orignalArray => [...orignalArray, todo]) : ''
        if($appStore === 'online') db.addTodo(todo, localStorage.getItem('uid'))
        textField = ''
    }

</script>

<div id="parent">
    <button class="add" on:click={addTodo}>➕</button>
</div>


<style>
    #parent {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        grid-template-areas:
        'add';
    }

    .add {
        grid-area: add;
        background-color: white;
        border: 1px solid black;
    }
    button {
        border-radius:7px;
    }

</style>