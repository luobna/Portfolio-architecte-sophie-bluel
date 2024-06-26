let email, motdepasse;
const errorElement = document.getElementById('error'); // obtenir le block d'erreur (par  défaut est none)

//pour disaficher  le msg  d'erreur  à chaque évenement keyup  sur le  formulaire 
document.getElementById('loginForm').addEventListener('focusin', function(event){
    errorElement.style.display = 'none';
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Empêcher le comportement par défaut du formulaire (rechargement du formulaire lors du sbumit)

    email = document.getElementById('email').value;
    motdepasse = document.getElementById('motdepasse').value;

    if (email && motdepasse) { // voir si on a rempli les  deux champs (mail et password)
        fetch('http://localhost:5678/api/users/login', { // l'url de la requête pour accéder au serveur
            method: 'POST', // type de requête
            headers: { 'Content-Type': 'application/json' }, // nature des données envoyés
            body: JSON.stringify({ "email": email, "password": motdepasse }) // envoie du mail et password
        }).then(response => {
                if (!response.ok) { //  si réponse non ok, afficher msg d'erreur
                    errorElement.style.display = 'block';
                    throw new Error(`HTTP error! Status: ${response.status}`); // lever exception pour sortir du then
                }
                return response.json();
            })
            .then(data => {
                //si data reçu => reponnse correcte
                // ....
                // stocker le token d'authentification pour pouvoir réaliser les envois et suppressions de travaux. 
                localStorage.setItem('authToken', data.token);
                //redirectio vers page  d'accuiel
                window.location.href = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/index.html';
            })
            .catch(error => {
                // si exception levée, elle sera catché ici
                console.error('Login failed:', error);
            });
    }
});