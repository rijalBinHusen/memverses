<script lang="ts">
    import { PUBLIC_APP_URL, PUBLIC_HOST_URL } from "$env/static/public";
</script>

<section>
    <div class="form">
  
        <!-- <img src="http://www.androidpolice.com/wp-content/themes/ap2/ap_resize/ap_resize.php?src=http%3A%2F%2Fwww.androidpolice.com%2Fwp-content%2Fuploads%2F2015%2F10%2Fnexus2cee_Search-Thumb-150x150.png&w=150&h=150&zc=3" alt="google-icon">  -->
        <a href={`${PUBLIC_HOST_URL}google/auth_url?url_app=${PUBLIC_APP_URL}`}>
            <button>Masuk dengan google</button>
        </a>
      
      </div>
</section>

<style lang="scss">
    * {
  box-sizing: border-box;
}

img {
  display: block;
  width: 80px;
  margin: 5px auto;
  box-shadow: 0 5px 10px -7px #333333;
  border-radius: 50%;
}

.form {
  background-color: #ffffff;
  // width: 500px;
  // margin: 50px auto 10px auto;
  // padding: 30px;
  border-radius: 8px;
  overflow: hidden;
  // box-shadow: 0 2px 10px -3px #333;
  text-align: center;
}

button {
  border-radius: 100px;
  border: none;
  background: #719BE6;
  width: 50%;
  padding: 10px;
  color: #FFFFFF;
  // margin-top: 25px;
  box-shadow: 0 2px 10px -3px #719BE6;
  display: block;
  margin: 15px auto 10px auto;
  cursor: pointer;
}

a {
  text-decoration: none;
}

</style>