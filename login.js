fetch("api/login.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: email.value,
    password: password.value
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    alert("Bienvenido " + data.name);
  } else {
    alert("Credenciales incorrectas");
  }
});
