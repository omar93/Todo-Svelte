<script>
    import { todoStore } from '../store/todoStore'
    import uuid from 'uuid-v4'
    
    export let todoTextLength

    let textField
    let height
    let width

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
    /*
    så
    */
    
</script>

<div id="parent">
    <button class="clear" bind:clientWidth={width} on:click={removeAll} style="height:{height}px;">CLEAR</button>
    <form on:submit|self={addTodo}>
        <input class="input" type="text"  bind:value={textField} placeholder="Todo" style="height:{height}px;">
    </form>
    <button bind:clientHeight={height} class="add" on:click={addTodo} style="width:{width}px;">➕</button>
</div>


<style>
    #parent {
        width: 100%;
        display: grid;
        grid-template-columns: 70px 1fr 70px;
        gap: 10px;
        grid-template-areas:
        'clear input add';
    }
    .clear {
        grid-area: clear;
        background-color: rgb(255, 0, 0);
        color: white;
        font-size: 1em;
    }
    .input {
        width: 100%;
        grid-area: input;
        border:2px solid #dadada;
        border-radius:7px;
    }
    .input:focus {
        outline:rgb(5, 168, 5);
        border-color: rgb(5, 168, 5);
    }
    .add {
        grid-area: add;
    }
    button {
        border-radius:7px;
    }

</style>