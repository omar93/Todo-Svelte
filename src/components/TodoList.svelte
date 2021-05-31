<script>
    import Todo from './Todo.svelte'
    import dbhandler from '../lib/firebaseDB'
    import { appStore } from '../data/appStore'
    import { todoStore } from '../data/todoStore'
    import { idStore } from '../data/idStore'
    
    let db = new dbhandler()
    let id
    idStore.subscribe(data => id = data)
    const removeChild = ({detail: id}) => {
        $todoStore = $todoStore.filter(todo => todo.id != id)
    }

    const updateChild = ({detail})=> {
        const index = $todoStore.findIndex(item => item.id === detail.id)
        $todoStore[index] = detail
        if($appStore === 'online'){
            console.log(detail)
            db.updateTodo(detail,id)
        }
        
    }
</script>

<ul>
    {#each $todoStore as todo}
        <Todo {...todo} on:remove={removeChild} on:update={updateChild}></Todo>
    {/each}
</ul>

<style>
    ul {
        margin: 0;
        padding: 0;
        max-width: 100%;
        list-style: none;
        
    }
</style>