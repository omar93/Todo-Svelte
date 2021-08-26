<script>
    let lists = [
        {
            'name':'lista1',
            'id':'abc123'
        },
        {
            'name':'lista2',
            'id':'xyz789'
        }
    ]
</script>

<div id="list-containe">
    <ul>
        {#each lists as list}
            <li>{list.name}</li>
        {/each}
    </ul>
</div>

<style>
    ul {
        list-style: none;
        padding: 0;
    }
</style>