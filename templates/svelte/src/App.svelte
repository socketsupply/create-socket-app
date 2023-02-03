<script>
  import svelteLogo from './assets/svelte.svg'
  import Counter from './lib/Counter.svelte'
  import os from 'socket:os'

  const toProperCase = s => s[0].toUpperCase() + s.slice(1)
</script>

<main>
  <div>
    <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
  </div>
  <h1>Vite + Svelte (on {toProperCase(os.platform())})</h1>

  <div class="card">
    <Counter />
  </div>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
</style>
