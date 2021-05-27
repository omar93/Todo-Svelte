<script>
    import { fly } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'
    export let todo, id, done

    const dispatch = createEventDispatcher()
    const removeTodo = () => dispatch('remove', id)
    const updateTodo = () => {
        done = !done
        dispatch('update', {id,done, todo})
    }
    
</script>

<li on:click|stopPropagation={updateTodo} in:fly="{{ x: 200, duration: 500 }}" out:fly="{{ x: -200, duration: 500 }}">
    <span id="status" class="{done ? 'done' : 'hidden'} right-border">✔️</span>
    <span id="text"   class="center right-border">{todo}</span>
    <div id="buttonContainer" >
        <span id="button" on:click|stopPropagation={removeTodo} class="center">X</span> 
    </div>
</li>

<style>
    li {
        height: 50px;
        list-style: none;
        display: grid;
        grid-template-columns: 50px 1fr 50px;
        grid-template-areas: 'status text button';
        border: 1px solid black;
        background-color: rgb(255, 252, 86);
        margin-top: 10px;
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