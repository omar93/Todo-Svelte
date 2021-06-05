<script>
    import { fly } from 'svelte/transition'
    import { todoColorStore } from '../../data/todoColorStore'
    import { textColorStore } from '../../data/textColorStore'
    import { createEventDispatcher } from 'svelte'

    export let todo = 'Todo', id = '123', isDone = false
    let isCurrent = false 
    const dispatch = createEventDispatcher()
    let todoColor, textColor

    let editable = false
    let newTodo = todo
    
    todoColorStore.subscribe(col => todoColor = col)
    textColorStore.subscribe(col => textColor = col)

    const removeTodo = () => dispatch('remove', id)
    const editTodo = () => {
        editable = !editable
        if(todo != newTodo) {
            todo = newTodo
            dispatch('update', {id,isDone, todo})
        }
    }
    const updateTodo = () => {
        isDone = !isDone
        dispatch('update', {id,isDone, todo})
    }

    const handleOver = () => {
        isCurrent = true
        console.log(isCurrent)
    }

    const handleOut = () => {
        isCurrent = false
        console.log(isCurrent)
    }
</script>

<li
in:fly="{{ x: 200, duration: 500 }}" 
out:fly="{{ x: -200}}"
on:mouseenter={handleOver}
on:mouseleave={handleOut}
on:
style="background-color:{todoColor};"
>

    <div class="statusContainer center">
        <!-- <Checkbox bind:checked={isDone}></Checkbox> -->
        {#if isDone}
            <span>✔️</span>
        {/if}
    </div>

    {#if editable}
        <form id="form" on:submit|preventDefault={editTodo}>
            <input id="altText" type="text" bind:value={newTodo} placeholder={todo}>
        </form>
    {:else}
        <span on:click|stopPropagation={updateTodo} id="text" type="text" class=" {isDone ? 'done' : ''} center" style="color:{textColor}">{todo}</span>
    {/if}
    
    {#if isCurrent}
    <div id="buttonContainer">

        <div class="editParent center">
            <span id="editButton" on:click|stopPropagation={editTodo} class="center">✏️</span>
        </div>
        
        <div id="removeParent">
            <span id="removeButton" on:click|stopPropagation={removeTodo} class="center">X</span>
        </div>

    </div>
    {/if}

</li>

<style>
    li {
        max-width: 100%;
        height: 70px;
        list-style: none;
        display: grid;
        grid-template-columns: 50px 1fr 100px;
        grid-template-areas: 'status text buttons';
        border-bottom: 1px solid #0000007e;
        border-left: 1px solid #0000007e;
        border-right: 1px solid #0000007e;
    }

    .statusContainer {
        grid-area: status;
    }
    
    #text {
        grid-area: text;
        word-break: break-word;
        overflow: hidden;
        font-size: 1.2em;
    }
    #form {
        grid-area: text;
    }

    input[type=text] {
        background-color: white;
        width: 100%;
        margin-top: 6px;
        text-align: center;
    }

    #buttonContainer {
        width: 100px;
        height: 70px;
        grid-area: buttons;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-areas: 
        'edit remove';
    }

    .editParent {
        grid-area: edit;
    }
    #editButton {
        font-size: 1.5em;
        cursor: pointer;
    }
    #removeParent{
        grid-area: remove;
        display:flex;
    }
    #removeButton {
        font-size: 1em;
        background-color: crimson;
        color: white;
        width: 100%;
    }
    #removeButton:hover {
        cursor: pointer;
        background-color: rgb(248, 58, 96);
    }

    #removeButton:active {
        background-color: crimson;
    }

    .center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .done {text-decoration: line-through;}
    .hidden {display: none;}
    @media screen and (max-width: 992px) {
        .hidden {display: none;}
    }
</style>