<script>
    export let list = {
            'name':'lista1',
            'id':'abc123',
            'todos':['handla','fiska','äta']
        }
</script>

<div id="list-container">
    <span>{list.name}</span>
</div>

<style>
    #list-container {
        font-size: 40px;
        padding: 1em;
        text-align: center;
        border-bottom: black 1px solid;
    }
</style>