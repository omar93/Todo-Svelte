<script>
  export let checked = false  
</script>

<div class="container">
  {#if checked}
    <div class="checkedContainer"><p>✔️</p></div>
  {:else}
    <div class="unCheckedContainer"></div>
  {/if}
</div>

<style>
  .container {
    border: 2px solid black;
    display: flex;
    border-radius: 5px;
  }

  .checkedContainer {
    color: transparent;  
    text-shadow: 0 0 0 white;
    background: rgb(0, 255, 0);
    font-size: 0.5em;
    border-radius: 4px;
  }

  .unCheckedContainer {
    background-color: white;
    border-radius: 4px;
  }

  p {
    margin-left: 3px;
    margin-top: 3px;
  }

  div {
    min-width: 100%;
    height: 100%;
  }
</style>