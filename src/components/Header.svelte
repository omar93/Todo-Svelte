<script>
    import MenuButton from './MenuButton.svelte'
</script>

<div class="header">
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
	.menu {
		margin-right: 10px;
	}
	.title {
		margin:auto;
		color: white;
	}
</style>