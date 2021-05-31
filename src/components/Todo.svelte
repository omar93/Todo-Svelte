<script>
    import { fly } from 'svelte/transition'
    import { todoColorStore } from '../data/todoColorStore'
    import { textColorStore } from '../data/textColorStore'
    import { createEventDispatcher } from 'svelte'

    import Checkbox from './Checkbox.svelte'

    export let todo, id, isDone
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
</script>

<li in:fly="{{ x: 200, duration: 500 }}" out:fly="{{ x: -200, duration: 500 }}" style="background-color:{todoColor};">
    <span id="status">
        <Checkbox bind:checked={isDone}></Checkbox>
    </span>
    {#if editable}
        <form id="form" on:submit|preventDefault={editTodo}>
            <input id="altText" type="text" bind:value={newTodo} placeholder={todo}>
        </form>
    {:else}
        <span on:click|stopPropagation={updateTodo} id="text" type="text" class=" {isDone ? 'done' : ''} center" style="color:{textColor}">{todo}</span>
    {/if}
    <div id="buttonContainer" >
        <span id="editButton" on:click|stopPropagation={editTodo} class="center">✏️</span>
        <span id="removeButton" on:click|stopPropagation={removeTodo} class="center">X</span>
    </div>
</li>

<style>
    li {
        max-width: 100%;
        height: 50px;
        list-style: none;
        display: grid;
        grid-template-columns: 50px 1fr 100px;
        grid-template-areas: 'status text buttons';
        margin-top: 10px;
        border: 1px solid black;
        border-radius:7px;
    }

    #status {
        grid-area: status;
        justify-content: center;
        align-items: center;
        font-size: 1.7em;
        display: flex;
        width: 50%;
        height: 50%;
        margin: auto;
    }

    #text {
        grid-area: text;
        word-break: break-all;
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

    #buttonContainer{
        grid-area: buttons;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        gap: 5px;
        
    }
    #editButton {
        width: 30%;
        height: 55%;
        font-size: 1.25em;
        cursor: pointer;
        
    }
    #editButton::after {
        content: '';
        background: black;
        position: relative;
        width: 20px;
        height: 50px;
        right: -5px;    
    }
    #removeButton {
        width: 35%;
        height: 60%;
        font-size: 1.2em;
        background-color: crimson;
        border: 2px solid black;
        color: white;
        border-radius: 5px;
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
    @media screen and (max-width: 992px) {
		#text{
			font-size: 0.95em;
		}
    }
</style>