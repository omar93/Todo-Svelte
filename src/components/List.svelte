<script>
    import ListItem from './ListItem.svelte'
    let lists = [
        {
            'name':'lista1',
            'id':'abc123',
            'todos':['handla','fiska','äta']
        },
        {
            'name':'lista2',
            'id':'xyz789',
            'todos':['handla','fiska','äta','tvätta kläder']
        }
    ]
</script>

<div id="list-container">
    <ul>
        {#each lists as list}
            <li>
                <ListItem {list}/>
            </li>
        {/each}
    </ul>
</div>

<style>
    #list-container {
        width: 100%;
        height: 100%;
        margin: auto;
    }
    
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
</style>