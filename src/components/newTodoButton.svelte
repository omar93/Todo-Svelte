<script>
    export let todoTextLength

    let visable = false
    let textField = ''
    const addTodo = async e => {
        if(textField.length > todoTextLength) {
            alert('Max 80 characters & needs to be bigger tha 0 character')
            textField = ''
            return
        }
        e.preventDefault()
        let todo = {'todo':textField,'isDone': false}
        textField ? todoStore.update(orignalArray => [...orignalArray, todo]) : ''
        textField = ''
    }
</script>


<span id="new-todo">+</span>

<style>
    span {
        background-color: red;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 1px 1px 1px black;
        color: white;
        font-size: 45px;
        text-align: center;
        width: 65px;
        height: 65px;
    }
</style>