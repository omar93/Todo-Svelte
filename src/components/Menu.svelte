<script>
	import { fly } from 'svelte/transition'
	import List from './List.svelte'
</script>

<div id="menu" in:fly="{{ y: -100, duration: 500 }}" out:fly="{{ x: 0, duration: 500 }}">
	<List/>
	<img src="./img/settings.png" alt="">
</div>

<style>
	#menu {
        background-color: white;
		height: 100%;
		z-index: 2;
		display: flex;
		flex-direction: column;
	}

	img {
		width: 50px;
		margin-right: 30px;
		margin-bottom: 30px;
		justify-self: flex-end;
		align-self: flex-end;
		margin-top: auto;
	}
	@-moz-keyframes spin { 100% { -moz-transform: rotate(90deg); } }
	@-webkit-keyframes spin { 100% { -webkit-transform: rotate(90deg); } }
	@keyframes spin { 100% { -webkit-transform: rotate(90deg); transform:rotate(90deg); } }
	img:hover {
		cursor: pointer;
		animation:spin 0.5s linear ;
		-webkit-animation:spin 0.5s linear ;
    	-moz-animation:spin 0.5s linear ;
	}

	
    @media screen and (max-width: 992px) {
        #menu {
			position: absolute;
			width: 100%;
			margin-left: 0%;
			z-index: 2;
			height: calc(100% - 55px);
			top: 55px;
		}
	}
</style>