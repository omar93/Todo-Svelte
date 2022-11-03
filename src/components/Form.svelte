<script>
    import { appStore } from '../data/appStore'
    import { todoStore } from '../data/todoStore'
    import { todoListStore } from '../data/todoListStore'
    import uuid from 'uuid-v4'
    import dbHandler  from '../lib/firebaseDB'
    import Modal from './Modal.svelte'

    export let todoTextLength

    let db = new dbHandler()

    let textField
    let visable = false
    let modal = false

    const removeAll = () => {todoStore.set([])}
    const addTodo = async e => {
        if(textField.length > todoTextLength) {
            alert('Max 80 characters & needs to be bigger tha 0 character')
            textField = ''
            return
        }
        e.preventDefault()
        let todo = {'todo':textField, 'id':uuid(),'isDone': false}
        textField ? todoStore.update(orignalArray => [...orignalArray, todo]) : ''
        if($appStore === 'online') db.addTodo(todo, localStorage.getItem('uid'))
        textField = ''
    }

    const createNewList = () => {
        modal = true
    }

    const handleNewList = e => {
        let newList = e.detail
        modal = false
        todoListStore.update(orignalList => [...orignalList, {'name':newList, 'id':uuid(), todos:[]}])
    }

</script>
{#if modal}
    <Modal on:new-list={handleNewList}></Modal>
{/if}
{#if visable}
    <div id="parent">
        <form on:submit|self={addTodo}>
            <input class="input" type="text" bind:value={textField} placeholder="Todo">
        </form>
    </div>
{:else}
    <div id="button-container">
        <div><span id="new-todo" on:click={() => visable = true}>➕</span></div>
        <div><img src="./img/new-list.png" alt="new list icon" on:click={createNewList}></div>
    </div>
{/if}

<style>
    form {
        width: 100%;
    }
    .input {
        border:2px solid #dadada;
        border-radius:7px;
        margin-left: 1px;
    }
    input[type="text"] 
      {
        width: 100%;
        border: 1px solid #CCC;
      }
    .input:focus {
        outline:rgb(5, 168, 5);
        border-color: rgb(5, 168, 5);
    }

    #button-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    #new-todo {
        border-radius:50%;
        width: 50px;
        height: 50px;
        font-size: 30px;
        background-color: greenyellow;
        border: 5px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img:hover { cursor: pointer; }
    img {
        object-fit: contain;
        height: 40px;
    }

</style>