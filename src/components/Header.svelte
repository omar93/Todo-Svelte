<script>
    import MenuButton from './MenuButton.svelte'
</script>

<div class="header">
    <img id="img" src="./profile.jpg" alt="profile">
	<p class="title">Svelte-Todo-App</p>
	<div class="menu">
		<MenuButton on:menu></MenuButton>
	</div>
</div>

<style>
	.header {
		background-color: hotpink;
		width: 100%;
		height: 5%;
		display: flex;
		justify-content: flex-end;
	}
	#img {
		border-radius: 100%;
		border: white 1px solid;
	}
	.menu {
		margin-right: 10px;
	}
	.title {
		margin:auto;
		color: white;
	}
</style>