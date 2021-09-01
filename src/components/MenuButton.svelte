<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let showClass = ''
	$: innerWidth = 0

  const toggle = () => {
    dispatch('menu')
    if (innerWidth > 992) {
      showClass = ''
    } else if(innerWidth < 992 && showClass === 'change') {
      showClass = ''
    } else if (innerWidth < 992 && showClass === ''){
      showClass = 'change'
    }
  }

  const handleResize = () => {
    if(innerWidth > 992) {
      showClass = ''
    }
  }
</script>
<svelte:window bind:innerWidth on:resize={handleResize}/>
<div on:click={toggle} class="{showClass} container">
  <div class="bar1"></div>
  <div class="bar2"></div>
  <div class="bar3"></div>
</div>

  <style>
    .container {
      display: inline-block;
      cursor: pointer;
    }
    
    .bar1, .bar2, .bar3 {
      width: 35px;
      height: 5px;
      background-color: #333;
      margin: 6px 0;
      transition: 0.4s;
    }
    
    .change .bar1 {
      -webkit-transform: rotate(-45deg) translate(-9px, 6px);
      transform: rotate(-45deg) translate(-9px, 6px);
    }
    
    .change .bar2 {opacity: 0;}
    
    .change .bar3 {
      -webkit-transform: rotate(45deg) translate(-8px, -8px);
      transform: rotate(45deg) translate(-8px, -8px);
    }
    </style>