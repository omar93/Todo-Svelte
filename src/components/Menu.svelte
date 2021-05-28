<script>
	import { fly } from 'svelte/transition'
	import { colorStore } from '../store/colorStore'
	let input

</script>
<div id="menu" in:fly="{{ x: 200, duration: 500 }}" out:fly="{{ x: 200, duration: 500 }}">
	<div>
		<input bind:this={input} bind:value={$colorStore} on:change={() => colorStore.set(input.value)} type="color">
		<label for="head">Todo Background Color</label>
	</div>
</div>



<style>
    #menu {
        position: absolute;
        background-color: white;
		position: absolute;
		width: 30%;
        height: 100%;
		margin-left: 70%;
		z-index: 2;
	}

    @media screen and (max-width: 992px) {
        #menu {
        position: absolute;
		position: absolute;
		width: 100%;
        height: 100%;
		margin-left: 0%;
		z-index: 2;
	}
	}
</style>