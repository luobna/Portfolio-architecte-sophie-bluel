let jsonList;

async function loadWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        console.log(response);
        if (!response.ok) {
            alert('Network response was not ok, try later');
        } else {
            const list = await response.json(); // OBTENIR LA RÉPONSE EN JAVASCRIPT JSON

            // RAJOUTER LES WORKS DANS LA BALISE .gallery
            jsonList = list; // on remplit la variable globale jsonList, pour que la fct filter ait accès à la liste des données
            console.log(list); // UTILISER LES DONNÉES REÇUES
            document.querySelector('#portfolio .gallery').innerHTML = getHtmlList(list);
            document.querySelector('#dialogBox .gallery').innerHTML = getHtmlList(list, true);
            document.querySelectorAll('#page1 .gallery figure i').forEach(icon => {
                icon.addEventListener('click', function () {
                    deleteWork(icon.dataset.id);
                });
            });
        }
    } catch (error) {
        alert("An error has occored, Works haven't been loaded, please try later");
    }
}

// Appel de la fonction
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


// loading categories part (for filter and model)

async function loadCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');

        if (!response.ok) {
            // Handle HTTP errors by throwing an error to jump to the catch block
            alert("Categories unloaded, try later");
            throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        const categories = await response.json();
        fillInDomCategories(categories); // remplir les categories de filter et du model
    } catch (error) {
        alert("An error has occored, Categories haven't been loaded, please try later");
    }
}



function fillInDomCategories(categories) {

    // give first values
    document.getElementById('modelCategory').innerHTML = '<option value="0" selected></option>'; // first value for model
    addFilterCategory('Tous', null); // first value for filter

    // give other values
    categories.forEach(category => {
        // fill in Model categories list
        document.getElementById('modelCategory').innerHTML += `<option value="${category.id}">${category.name}</option>`;
        // fill in filter categories list
        addFilterCategory(category.name, category.id);
    });
}

function addFilterCategory(categoryName, categoryId) {
    // create filter and its name
    const filterItem = document.createElement('li'); filterItem.textContent = categoryName;
    // add filter to the filter list "<ul></ul>"
    document.getElementById('filterCategories').appendChild(filterItem);
    // create an event on each filter category
    filterItem.addEventListener('click', () => filter(categoryId));
}

loadCategories();


// FILTER fonction that makes the filtering
// it's executed when we click on a "category filter"
function filter(nbrCategory = null) {
    if (nbrCategory != null) {
        let htmlList = '';
        jsonList.forEach(item => {
            if (item.categoryId == nbrCategory) htmlList += getHtmlItem(item);
        });
        document.querySelector('#portfolio .gallery').innerHTML = htmlList;
    } else {
        document.querySelector('#portfolio .gallery').innerHTML = getHtmlList(jsonList);
    }
}


//LOGOUT PART
// L'AFFICHAGE DU BLOC NOIR ET DES AUTRES ELEMENTS DE LA PAGE SI CLIENT EST DECONNECTE OU PAS
window.addEventListener('load', () => {
    if (localStorage.getItem('authToken')) {
        document.getElementById('log').innerHTML = '<a id="logout" href="#">logout</a>';
        document.getElementById('logout').addEventListener('click', logout);
        document.querySelector('#portfolio > div aside').style.display = 'block';
        document.querySelector('#filterCategories').style.display = 'none';
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
        document.getElementById('modelCategory').value = '';
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
        document.getElementById('modelCategory').value = '';
    };


async function deleteWork(itemId) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        console.log(response);
        if (!response.ok) {
            if (response.status == 401) {
                alert("You are unauthorized to delete");
            }
            throw new Error('Network response was not ok');
        } else {
            //ICI REPONSE OK VEUT DIRE WORK EST SUPPRIMER DANS LA BASE DE DONNEES
            loadWorks(); //METTRE A JOUR LA PAGE D'ACCUEIL ET LA MODALE POUR NE PAS LAISSER LE WORK SUPPRIMER AFFICHE
            alert("Item deleted successfully");
        }
    } catch (error) { }
}



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
        formData.append('category', parseInt(document.getElementById('modelCategory').value));
        // submit des donnes (envoie vers backend)
        sendWork(formData);
    }
});


async function sendWork(formData) {
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
        });
        console.log(response);
        if (!response.ok) {
            if (response.status == 401) {
                alert("You are unauthorized to add new work");
            }
            if (response.status == 400) {
                alert("Bad Request: you've sent wrong data");
            }
            throw new Error('Network response was not ok');
        } else {
            loadWorks();
            alert("Work sent successfully");
        }
    } catch (error) {
        alert("An error has occured, please try later");
     }
}
