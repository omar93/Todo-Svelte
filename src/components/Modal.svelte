<script>
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    let list = ''
    const handleSubmit = () => {
        dispatch('new-list',list)
    }
</script>

<div id="modal-container">
    <form on:submit|preventDefault={handleSubmit}>
        <input type="text" placeholder="new list name" bind:value={list}>
        <input type="submit" value="submit">
    </form>
</div>

<style>
    #modal-container {
        position: absolute;
        width: 60%;
        height: calc(100% - 55px);
        background-color: black;
        opacity: .95;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3;
    }
</style>