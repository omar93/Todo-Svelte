<script>
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    let list = ''
    const handleSubmit = () => {
        dispatch('new-list',list)
    }
</script>

<div id="modal-container">
    <div id="black" on:click|self={handleSubmit}></div>
    <form on:submit|preventDefault={handleSubmit}>
        <h3>Name for the new list:</h3>
        <input type="text" placeholder="new list name" bind:value={list}>
    </form>
</div>

<style>
    #black {
        background-color: black;
        width: 100%;
        height: 100%;
        opacity: 0.5;
        position: absolute;
    }

    #modal-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3;
    }

    form {
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 4;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 3em;
        border-radius: 25px;
        opacity: 1;
    }

    @media screen and (max-width: 992px) {
        #modal-container {
            width: 100%;
        }
	}
</style>