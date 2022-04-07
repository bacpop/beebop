<template>
  <div class=social>
    <ul>
      <li><a href=http://localhost:4000/login/google class="btn btn-block btn-social btn-google"><i class='fa-brands fa-google'></i> Login with Google</a></li>
      <li><a href=http://localhost:4000/login/github class="btn btn-block btn-social btn-github"><i class='fa-brands fa-github'></i> Login with Github</a></li>
    </ul>
  </div>
</template>

<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css';
  @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css';
  @import '../CSS/bootstrap-social.css';

  .social ul {
    margin: 0;
    padding: 5px;
    text-align:center;
    display: inline-block;
  }

  .social ul li {
    margin: 10px;
    list-style: none outside none;
    width:8cm;
  }
</style>
