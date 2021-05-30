<script>
	import { headerColorStore } from '../store/headerColorStore'
    import MenuButton from './MenuButton.svelte'
	let color
	headerColorStore.subscribe(col => color = col)
</script>

<div class="header" style="background-color:{color};">
    <img id="img" src="./profile.jpg" alt="profile">
	<p class="title">Svelte-Todo-App</p>
	<div class="menu">
		<MenuButton on:menu></MenuButton>
	</div>
</div>

<style>
	.header {
		/*background-color: #ff69b4; the original color*/
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: flex-end;
	}
	#img {
		border-radius: 100%;
		height: 85%;
		margin-top: 3px;
		margin-left: 3px;
		border: white 1px solid;
	}
	.menu {
		margin-right: 10px;
		z-index: 2;
		margin-top: 7px;
	}
	.title {
		margin:auto;
		color: white;
	}
</style>