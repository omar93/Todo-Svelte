<script>
    import NewTodoButton from './newTodoButton.svelte';
</script>

<style>
    form {
        width: 100%;
    }

    .input {
        border:2px solid #dadada;
        border-radius:7px;
        margin-left: 1px;
    }

    input[type="text"] {
        width: 100%;
        border: 1px solid #CCC;
    }

    .input:focus {
        outline:rgb(5, 168, 5);
        border-color: rgb(5, 168, 5);
    }

    #button-container {
        display: flex;
        justify-content: center;
        margin-bottom: -10px;
    }
</style>