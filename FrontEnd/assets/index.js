let jsonList;

//POUR AFFICHER LES CATEGORIES ET LES TRAVAUX SUR LA PAGE D'ACCUIL
function loadWorks() {
    fetch('http://localhost:5678/api/works')
        .then(response => {
            console.log(response)
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // OBTENIR LA RÉPONSE EN JAVASCRIPT JSON
        })

        //RAJOUTER LES WORKS DANS LA BALISE .gallery
        .then(list => {
            jsonList = list;// on remplit la variable globalejsonlist, pourque la fct filter ait accés à la list des données
            console.log(list); // UTILISER LES DONNÉES REÇUES
            document.querySelector('#portfolio .gallery').innerHTML = getHtmlList(list);
            document.querySelector('#dialogBox .gallery').innerHTML = getHtmlList(list, true);
            document.querySelectorAll('#page1 .gallery figure i').forEach(icon => {
                icon.addEventListener('click', function () {
                    deleteItem(icon.parentElement, icon.dataset.id);
                });
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
};
loadWorks();

function getHtmlList(list, forDialog = null) {
    let htmlList = '';
    if (forDialog) {
        list.forEach(item => {
            htmlList += getDialogHtmlItem(item);
        });
    } else {
        list.forEach(item => {
            htmlList += getHtmlItem(item);
        });
    }
    return htmlList;
}


function getHtmlItem(item) {
    return `
    <figure id="${item.id}">
        <img src="${item.imageUrl}" alt="${item.title}">
        <figcaption>${item.title}</figcaption>
    </figure>
    `;
}

function getDialogHtmlItem(item) {
    return `
    <figure>
        <img src="${item.imageUrl}" alt="${item.title}">
        <i data-id="${item.id}" class="fa fa-trash"></i>
    </figure>
    `;
}


//FILTER PART

function filter(nbrCategory = null) {
    if (nbrCategory) {
        let htmlList = '';
        jsonList.forEach(item => {
            if (item.categoryId == nbrCategory) htmlList += getHtmlItem(item);
        });
        document.querySelector('#portfolio .gallery').innerHTML = htmlList;
    } else {
        document.querySelector('#portfolio .gallery').innerHTML = getHtmlList(jsonList);
    }
}

// ATTACHER event listeners Á LA LISTE DES ARTICLES 
document.getElementById('filter-all').addEventListener('click', () => filter());
document.getElementById('filter-objects').addEventListener('click', () => filter(1));
document.getElementById('filter-apartments').addEventListener('click', () => filter(2));
document.getElementById('filter-hotels').addEventListener('click', () => filter(3));



//LOGOUT PART
// L'AFFICHAGE DU BLOC NOIR ET DES AUTRES ELEMENTS DE LA PAGE SI CLIENT EST DECONNECTE OU PAS
window.addEventListener('load', () => {
    if (localStorage.getItem('authToken')) {
        document.getElementById('log').innerHTML = '<a id="logout" href="#">logout</a>';
        document.getElementById('logout').addEventListener('click', logout);
        document.querySelector('#portfolio > div aside').style.display = 'block';
        document.querySelector('body .blackBackground').style.display = 'flex'
    }
    else {
        document.getElementById('log').innerHTML = '<a href="login.html">login</a>';
        document.querySelector('body .blackBackground').style.display = 'none'
    }


});
//pour deconnecter utilisateur
let logout = function () {
    localStorage.removeItem('authToken'); // SUPPRIMMER token
    location.reload();// RECHARGER la page pour mise à jour
};

//MODAL MANAGEMET PART
let openModal = function () {
    document.querySelector('#dialogBack').style.display = 'block';
    document.querySelector('#dialogBox').style.display = 'block';
},
    closeModal = function () {
        document.querySelector('#dialogBox').style.display = 'none';
        document.querySelector('#dialogBack').style.display = 'none';
        document.querySelector('#page2').style.display = 'none';
        document.querySelector('#page1').style.display = 'block';
        document.getElementById('addedImg').innerHTML = '';
        document.getElementById('addedImg').style.display = 'none';
        document.getElementById('sum').style.backgroundColor = 'gary';
        document.getElementById('addImg').style.display = 'block';
        document.getElementById('title').value = '';
        document.getElementById('category').value = '';
    },
    openPage2 = function () {
        document.querySelector('#page1').style.display = 'none';
        document.querySelector('#page2').style.display = 'block';
    },
    openPage1 = function () {
        document.querySelector('#page2').style.display = 'none';
        document.querySelector('#page1').style.display = 'block';
        document.getElementById('addImg').style.display = 'block';
        document.getElementById('addedImg').innerHTML = '';
        document.getElementById('addedImg').style.display = 'none';
        document.getElementById('sum').style.backgroundColor = 'gray';
        document.getElementById('title').value = '';
        document.getElementById('category').value = '';
    };

function loadCategories() {
    
    //RAJOUTER LE CHOIX DES CATÉGORIES
    fetch('http://localhost:5678/api/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(categories => {
            document.getElementById('category').innerHTML = '<option value="0" selected></option>';
            categories.forEach(category => {
                document.getElementById('category').innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

loadCategories();

function deleteItem(item, itemId) {
    fetch(`http://localhost:5678/api/works/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    }).then(response => {
        console.log(response);
        if (!response.ok) {
            if (response.status == 401);
            alert("You are unauthorized to delete");
            throw new Error('Network response was not ok');
        } else {
            //ICI REPONSE OK VEUT DIRE WORK EST SUPPRIMER DANS LA BASE DE DONNEES
            loadWorks(); //METTRE A JOUR LA PAGE D'ACCUEIL ET LA MODALE POUR NE PAS LAISSER LE WORK SUPPRIMER AFFICHE
            alert("Item deleted successfully");
        }
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
};


document.querySelector('#portfolio > div aside').addEventListener('click', openModal);
document.querySelector('#close i').addEventListener('click', closeModal);
document.querySelector('#dialogBack').addEventListener('click', closeModal);
document.querySelector('#toPage2').addEventListener('click', openPage2);
document.querySelector('#back').addEventListener('click', openPage1);


//POUR RAJOUTER UNE IMAGE
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {

            const img = document.createElement('img');
            img.src = e.target.result;
            document.getElementById('addedImg').prepend(img);

            document.getElementById('addImg').style.display = 'none';
            document.getElementById('addedImg').style.display = 'block';

            document.getElementById('sum').style.backgroundColor = '#1D6154';

        }
        reader.readAsDataURL(file);
    }
});
document.getElementById('addImageForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        console.log("send formdata");
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', document.getElementById('title').value);
        formData.append('category', parseInt(document.getElementById('category').value));

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
        }).then(response => {
            console.log(response);
            if (!response.ok) {
                if (response.status == 401) {
                    alert("You are unauthorized to add new work");
                }
                if (response.status == 400) {
                    alert("Bad Request: you've sent wrong data");
                }
            } else {
                loadWorks();
                alert("work envoyé avec succés");
            }

        });
    }
});