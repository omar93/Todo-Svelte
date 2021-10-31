<script>
    import Modal from './Modal.svelte'
    let modal = false

    const createNewList = () => {
        modal = true
    }

    const handleNewList = e => {
        console.log('list name: ',e.detail)
        modal = false
    }
</script>

<div>
    <img src="./img/new-list.png" alt="new list icon" on:click={createNewList}>wefewf
</div>
{#if modal}
    <Modal on:new-list={handleNewList}></Modal>
{/if}

<style>
</style>