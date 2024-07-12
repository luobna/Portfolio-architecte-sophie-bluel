let jsonList, gallery = document.querySelector('#portfolio .gallery'), dialogBoxGallery = document.querySelector('#dialogBox .gallery');
(function () {
    fetch('http://localhost:5678/api/works')
        .then(response => {
            console.log(response)
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Obtenir la réponse en objet javascript JSON
        })
        .then(list => {
            jsonList = list;
            console.log(jsonList); // Utiliser les données reçues
            gallery.innerHTML = getHtmlList(jsonList);
            dialogBoxGallery.innerHTML = getHtmlList(jsonList, true);
            document.querySelectorAll('#page1 .gallery figure i').forEach(icon => {
                icon.addEventListener('click', function () {
                    deleteItem(icon.parentElement, icon.dataset.id);
                });
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
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
})();


function getHtmlList(list, forDialog=null) {
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

window.addEventListener('load', () => {
    if (localStorage.getItem('authToken')) {
        document.getElementById('log').innerHTML = '<a id="logout" href="#">logout</a>';
        document.getElementById('logout').addEventListener('click', logout);
        document.querySelector('#portfolio > div aside').style.display = 'block';
        document.querySelector('body .blackBackground').style.display= 'flex'
    }
    else{
        document.getElementById('log').innerHTML = '<a href="login.html">login</a>';
        document.querySelector('body .blackBackground').style.display= 'none'
    }
        

});

let openModal = function () {
    document.querySelector('#dialogBack').style.display = 'block';
    document.querySelector('#dialogBox').style.display = 'block';
},
    closeModal = function () {
        document.querySelector('#dialogBox').style.display = 'none';
        document.querySelector('#dialogBack').style.display = 'none';
    },
    openPage2 = function () {
        document.querySelector('#page1').style.display = 'none';
        document.querySelector('#page2').style.display = 'block';
    },
    openPage1 = function () {
        document.querySelector('#page2').style.display = 'none';
        document.querySelector('#page1').style.display = 'block';
    },
    logout = function () {
        localStorage.removeItem('authToken'); // supprimer
        location.reload();// recharger
    };

function deleteItem(item, itemId) {
    fetch(`http://localhost:5678/api/works/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    }).then(response => {
        console.log(response);
        if (!response.ok) {
            if(response.status == 401);
            alert("You are unauthorized to delete");
            throw new Error('Network response was not ok');
        } else {
            item.remove(); // remove from DialogBox
            document.getElementById(`${itemId}`).remove(); // remove from gallery
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



// Attach event listeners to the list items
document.getElementById('filter-all').addEventListener('click', () => filter());
document.getElementById('filter-objects').addEventListener('click', () => filter(1));
document.getElementById('filter-apartments').addEventListener('click', () => filter(2));
document.getElementById('filter-hotels').addEventListener('click', () => filter(3));



document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            const preview = document.getElementById('preview');
            preview.innerHTML = '';
            preview.appendChild(img);
        }
       reader.readAsDataURL(file);
    }
});
document.getElementById('addImageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title.value);
        formData.append('category', parseInt(category.value));

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                "Authorization": "Bearer "+localStorage.authToken
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const responseDiv = document.getElementById('response');
            responseDiv.innerHTML = 'Image téléchargée avec succès : ' + data.message;
        })
        .catch(error => {
            const responseDiv = document.getElementById('response');
            responseDiv.innerHTML = 'Erreur lors du téléchargement de l\'image : ' + error.message;
        });
    }
});