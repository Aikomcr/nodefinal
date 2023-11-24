const btnSignIn = document.getElementById("sign-in"),
     btnSignUp= document.getElementById("sign-up"),
     formRegister = document.querySelector(".register"),
     formLogin = document.querySelector(".login");
     
     btnSignUp.addEventListener("click" , e => {
        formLogin.classList.add("hide");
        formRegister.classList.remove("hide");
       })

     btnSignIn.addEventListener("click" , e => {
      formRegister.classList.add("hide");
      formLogin.classList.remove("hide");
     })
     
    