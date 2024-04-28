<script lang="ts">
    let email = "";
    let username = "";
    let password = "";
    let password_confirm = "";

    let isRegister = false;

    function login() {
        alert("Function not implemented yet")
    }
    function register() {
        alert("Function not implemented yet")
    }
</script>

<section>
    <div class="login">
        <h1>Login</h1>
        <label for="email">Masukkan email</label>
        <input bind:value={email} type="text" name="email" id="email">
        {#if isRegister}
            <label for="username">Masukkan username</label>
            <input bind:value={username} type="text" name="username" id="username">
        {/if}
        <label for="password">Masukkan password</label>
        <input bind:value={password} type="text" name="password" id="password">
        {#if isRegister}
            <label for="password_confirm">Konfirmasi password</label>
            <input bind:value={password_confirm} type="text" name="password_confirm" id="password_confirm">
        {/if}
        
        {#if isRegister}
            <button class="primary-button" on:click={register}>Daftar</button>
            <a href="#register" on:click={ () => isRegister = false}>Login</a>
        {:else}
            <button class="primary-button" on:click={login}>Login</button>
            <a href="#login" on:click={ () => isRegister = true}>Daftar</a>
        {/if}
    </div>
</section>