<script>
    import { todoStore } from '../store/todoStore'
    import { v4 as uuidv4 } from 'uuid'
    
    export let todoTextLength

    let textField

    const addTodo = e => {
        if(textField.length > todoTextLength) {
            alert('Max 80 characters & needs to be bigger tha 0 character')
            textField = ''
            return
        }
        e.preventDefault()
        textField ? todoStore.update(orignalArray => [...orignalArray, {'todo':textField, 'id': uuidv4(),'done': false}]) : ''
        textField = ''
    }
</script>

<form on:submit={addTodo}>
    <input id="input" type="text"  bind:value={textField} placeholder="Todo">
    <button on:click={addTodo}>➕</button>
</form>

<style>
    form {
        margin: auto;
    }
    #input {
        border:2px solid #dadada;
        border-radius:7px;
    }
    #input:focus {
        outline:rgb(5, 168, 5);
        border-color: rgb(5, 168, 5);
    }
    button {
        border-radius:7px;
    }
</style>