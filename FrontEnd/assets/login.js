// Si utisateur déjà connecté, ne pas afficher la page, lui rediriger vers index.html
if (localStorage.getItem('authToken')) {
    window.location.href = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/index.html';
}

let email, motdepasse;
// obtenir le block d'erreur (par  défaut est none)
const errorElement = document.getElementById('error');

//pour désafficher  le msg  d'erreur  à chaque évenement keyup  sur le  formulaire 
document.getElementById('loginForm').addEventListener('focusin', function (event) {
    errorElement.style.display = 'none';
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Empêcher le comportement par défaut du formulaire (rechargement du formulaire lors du sbumit)

    email = document.getElementById('email').value;
    motdepasse = document.getElementById('motdepasse').value;

    if (email && motdepasse) { // voir si on a rempli les  deux champs (mail et password)
        // Appel de la fonction avec les paramètres email et motdepasse
        login(email, motdepasse);
    } else {
        alert('Email et de passe obliagtoire');
    }
});


async function login(email, motdepasse) {
    try {
        // l'url de la requête pour accéder au serveur
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST', // type de requête
            headers: { 'Content-Type': 'application/json' }, // nature des données envoyés
            body: JSON.stringify({ email: email, password: motdepasse }) // envoie du mail et password
        });

        if (!response.ok) { // si réponse non ok, afficher msg d'erreur
            errorElement.style.display = 'block';
            if (response.status == 404)
                alert(`email ou mot de passe incorrecte`);
            else
                alert(`Erreur serveur : ${response.status}`);
        } else {
            const data = await response.json();
            // si data reçu => réponse correcte
            // stocker le token d'authentification pour pouvoir réaliser les envois et suppressions de travaux.
            localStorage.setItem('authToken', data.token);
            // redirection vers page d'accueil
            window.location.href = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/index.html';
        }
    } catch (error) {
        // si exception levée, elle sera catchée ici
        alert('An error has occured, please try later');
    }
}


