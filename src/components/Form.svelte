<script>
    import { todoStore } from '../store/todoStore'
    import uuid from 'uuid-v4'
    
    export let todoTextLength

    let textField
    let height

    const addTodo = e => {
        if(textField.length > todoTextLength) {
            alert('Max 80 characters & needs to be bigger tha 0 character')
            textField = ''
            return
        }
        e.preventDefault()
        textField ? todoStore.update(orignalArray => [...orignalArray, {'todo':textField, 'id':new uuid(),'done': false}]) : ''
        textField = ''
    }

    const removeAll = () => {
        todoStore.set([])
    }
</script>

<div>
<button class="clear" on:click={removeAll} style="height:{height}px">CLEAR</button>
<form on:submit|self={addTodo}>
    <input  class="input" type="text"  bind:value={textField} placeholder="Todo">
    <button bind:clientHeight={height} class="add" on:click={addTodo}>➕</button>
</form>
</div>


<style>
    div {
        display: grid;
        grid-template-columns: 60px 1fr;
        gap: 10px;
        grid-template-areas: 'clear input';
        margin-top: 10px;
    }
    form {
        grid-area: input;
        display: grid;
        grid-template-columns: 1fr 50px;
        gap: 10px;
        grid-template-areas: 'input add';
        margin-top: 10px;
    }
    .input {
        border:2px solid #dadada;
        border-radius:7px;
        grid-area: input;
    }
    .input:focus {
        outline:rgb(5, 168, 5);
        border-color: rgb(5, 168, 5);
    }
    button {
        border-radius:7px;
    }

    .add {
        grid-area: add;
    }
    .clear {
        grid-area: clear;
        background-color: rgb(255, 0, 0);
        color: white;
        font-size: 1em;
        margin-top: 10px;
        text-align: center;
    }
</style>