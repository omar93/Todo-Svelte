<script>
	import { fly } from 'svelte/transition'
	import { backgroundColorStore } from '../store/backgroundColorStore'
	import { headerColorStore } from '../store/headerColorStore'
	import { todoColorStore } from '../store/todoColorStore'
	import { textColorStore } from '../store/textColorStore'
	import SigninButton from './signinButton.svelte'
</script>

<div id="menu" in:fly="{{ x: -100, duration: 500 }}" out:fly="{{ x: 0, duration: 500 }}">
	<input bind:value={$backgroundColorStore} type="color">
	<label for="head">Background Color</label>

	<input bind:value={$headerColorStore} type="color">
	<label for="head">Header Background Color</label>

	<input bind:value={$todoColorStore} type="color">
	<label for="head">Todo Background Color</label>

	<input bind:value={$textColorStore} type="color">
	<label for="head">Todo Text Color</label>

	<SigninButton></SigninButton>
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
		display: flex;
		flex-direction: column;
	}

    @media screen and (max-width: 992px) {
        #menu {
			position: absolute;
			width: 30%;
			height: 100%;
			margin-left: 70%;
			z-index: 2;
		}
	}
</style>