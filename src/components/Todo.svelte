<script>
    import { fly } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'
    export let todo, id, done
    let changable = false

    const dispatch = createEventDispatcher()
    const toggleChange = () => changable = !changable
    const removeTodo = () => dispatch('remove', id)
    const updateTodo = () => {
        done = !done
        dispatch('update', {id,done, todo})
    }
    
</script>

<li on:click|stopPropagation={updateTodo} in:fly="{{ x: 200, duration: 500 }}" out:fly="{{ x: -200, duration: 500 }}">
    <span id="status"  class="{done ? 'done' : 'hidden'} right-border">✅</span>




    <span id="text" type="text" on:dblclick={toggleChange} class="{changable ? 'hidden':''}center right-border">{todo}</span>

    <input id="altText" type="text" on:submit={toggleChange} class="{changable ? '': 'hidden'}" placeholder={todo}>




    <div id="buttonContainer" >
        <span id="button" on:click|stopPropagation={removeTodo} class="center">X</span>
    </div>
</li>

<style>
    li {
        max-width: 100%;
        height: 50px;
        list-style: none;
        display: grid;
        grid-template-columns: 50px 1fr 50px;
        grid-template-areas: 'status text button';
        background-color: rgb(255, 252, 86);
        margin-top: 10px;
        border: 1px solid black;
        border-radius:7px;
    }

    #status {
        grid-area: status;
        justify-content: center;
        align-items: center;
        font-size: 1.7em;
    }

    #text {
        grid-area: text;
        word-break: break-all;
        overflow: hidden;
        color: black;
    }

    #altText {
        grid-area: text;
        background-color: rgb(255, 252, 86);
    }

    #buttonContainer{
        grid-area: button;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #button {
        width: 55%;
        height: 55%;
        font-size: 1em;
        background-color: crimson;
        border: 1px solid black;
        color: white;
    }

    #button:hover {
        cursor: pointer;
        background-color: rgb(248, 58, 96);
        
    }

    #button:active {
        background-color: crimson;
    }

    .center {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .done {display: flex;}
    .hidden {display: none;}
</style>