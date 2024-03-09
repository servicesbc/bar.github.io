const API_URL = 'https://www.thecocktaildb.com/api/json/v1/1/';

async function fetchAllCocktails() {
    try {
        const response = await fetch(API_URL + 'search.php?f=a');
        const data = await response.json();
        return data.drinks.filter(cocktail => cocktail.strDrinkThumb && cocktail.strDrinkThumb.trim() !== '');
    } catch (error) {
        console.error('Error fetching cocktails:', error);
    }
}

async function displayAllCocktails() {
    const cocktails = await fetchAllCocktails();
    displayCocktails(cocktails);
}

function displayCocktails(cocktails) {
    const cocktailList = document.getElementById('cocktail-list');
    cocktailList.innerHTML = '';

    cocktails.forEach(cocktail => {
        const listItem = document.createElement('li');
        listItem.classList.add('cocktail');
        listItem.innerHTML = `
            <h2>${cocktail.strDrink}</h2>
            <img src="${cocktail.strDrinkThumb + '/preview'}" alt="${cocktail.strDrink} Image">
            <button class="view-recipe-btn" onclick="openModal('${cocktail.idDrink}')">View Recipe</button>
        `;
        cocktailList.appendChild(listItem);
    });
}

async function searchCocktails() {
    const searchInput = document.getElementById('search-input').value;
    if (searchInput.trim() === '') {
        alert('Please enter a search query.');
        return;
    }
    try {
        const response = await fetch(API_URL + 'search.php?s=' + searchInput);
        const data = await response.json();
        if (data.drinks) {
            const filteredCocktails = data.drinks.filter(cocktail => cocktail.strDrink && cocktail.strInstructions);
            displayCocktails(filteredCocktails);
        } else {
            console.error('No drinks found for search query:', searchInput);
        }
    } catch (error) {
        console.error('Error searching cocktails:', error);
    }
}

async function filterByLetter(letter) {
    try {
        const response = await fetch(API_URL + 'search.php?f=' + letter);
        const data = await response.json();
        if (data.drinks) {
            const filteredCocktails = data.drinks.filter(cocktail => cocktail.strDrink && cocktail.strInstructions);
            displayCocktails(filteredCocktails);
        } else {
            console.error('No drinks found for letter:', letter);
            const cocktailList = document.getElementById('cocktail-list');
            cocktailList.innerHTML = ''; // Limpiar la lista si no hay cócteles
            const notFoundItem = document.createElement('li');
            notFoundItem.classList.add('not-found');
            notFoundItem.textContent = 'Not Found';
            cocktailList.appendChild(notFoundItem);
        }
    } catch (error) {
        console.error('Error filtering cocktails by letter:', error);
    }
}

async function openModal(cocktailId) {
    const modal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('recipe-content');
    try {
        const response = await fetch(API_URL + 'lookup.php?i=' + cocktailId);
        const data = await response.json();
        if (data.drinks && data.drinks.length > 0) {
            const cocktail = data.drinks[0];
            modalContent.innerHTML = `
                <h2>${cocktail.strDrink}</h2>
                <img src="${cocktail.strDrinkThumb + '/preview'}" alt="${cocktail.strDrink} Image">
                <p><strong>Ingredients:</strong></p>
                <ul>
                    ${getIngredients(cocktail).join('')}
                </ul>
                <p><strong>Instructions:</strong></p>
                <ol>
                    ${formatInstructions(cocktail.strInstructions)}
                </ol>
            `;
            modal.style.display = 'block';
        } else {
            console.error('No drink found with ID:', cocktailId);
        }
    } catch (error) {
        console.error('Error fetching cocktail details:', error);
    }
}

function getIngredients(cocktail) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail['strIngredient' + i];
        const measure = cocktail['strMeasure' + i];
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push(`<li>${measure} ${ingredient}</li>`);
        }
    }
    return ingredients;
}

function formatInstructions(instructions) {
    const steps = instructions.split('\n').filter(step => step.trim() !== '');
    return steps.map((step, index) => `<li>${step}</li>`).join('');
}

function closeModal() {
    const modal = document.getElementById('recipe-modal');
    modal.style.display = 'none';
}

window.onload = async function() {
    displayAllCocktails();
    updateTime();
};

function updateTime() {
    const currentTimeElement = document.getElementById('current-time');
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}`;
    }, 1000);
}

document.getElementById('search-google').addEventListener('click', function() {
    const searchQuery = document.getElementById('google-search-query').value;
    if (searchQuery.trim() !== '') {
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        window.open(googleSearchUrl, '_blank');
    } else {
        alert('Please enter a search query.');
    }
});

