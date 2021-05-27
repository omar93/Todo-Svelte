<script>
    import { fly } from 'svelte/transition'
</script>

<div id="menu" in:fly="{{ y: 200, duration: 2000 }}">
    <p>Settings, signin, profile etc etc</p>
</div>

<style>
    #menu {
        position: absolute;
        background-color: forestgreen;
        height: 95%;
        width: 100%;
	}
</style>