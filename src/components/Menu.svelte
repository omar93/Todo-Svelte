<script>
	import { fly } from 'svelte/transition'
	import { todoColorStore } from '../data/todoColorStore'
	import { textColorStore } from '../data/textColorStore'
	import { headerColorStore } from '../data/headerColorStore'
	import { backgroundColorStore } from '../data/backgroundColorStore'
	import SignoutButton from './SignoutButton.svelte'
</script>

<div id="menu" in:fly="{{ y: -100, duration: 500 }}" out:fly="{{ x: 0, duration: 500 }}">
	<div class="colorContainer">
		<input bind:value={$backgroundColorStore} type="color">
		<label for="background-color">Background Color</label>
	</div>
		
	<div class="colorContainer">
		<input bind:value={$headerColorStore} type="color">
		<label for="header-color">Header Background Color</label>
	</div>
		
	<div class="colorContainer">
		<input bind:value={$todoColorStore} type="color">
		<label for="todo-background-color">Todo Background Color</label>
	</div>
		
	<div class="colorContainer">
		<input bind:value={$textColorStore} type="color">
		<label for="todo-text-color">Todo Text Color</label>
	</div>
	<div class="signout">
		<SignoutButton></SignoutButton>
	</div>
</div>

<style>
	#menu {
        position: absolute;
        background-color: white;
		width: 20%;
		height: 100%;
		top: 0;
		margin-left: 80%;
		z-index: 2;
		display: flex;
		flex-direction: column;
	}
	.colorContainer {
		display: flex;
		border: 1px solid black;
		height: 40px;
	}
	label {
		margin-left: 20px;
		margin-top: 8px;
	}
	input {
		height: 100%;
		width: 80px;
		padding: 1px;
	}

	.signout {
		margin-top: auto;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
    @media screen and (max-width: 992px) {
        #menu {
			position: absolute;
			width: 100%;
			height: 100%;
			margin-left: 0%;
			z-index: 2;
		}

		label {
			margin-top: 8px;
		}
	}
</style>