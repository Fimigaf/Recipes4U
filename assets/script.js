const appEl = document.querySelector('.app');
const searchFieldEl = document.querySelector('.search');
const searchButtonEl = document.getElementById('search-btn');
const mealsEl = document.querySelector('.meals');
const favMealsEl = document.querySelector('.fav-meals-list');
const listWrapperEl = document.querySelector('.list-wrapper');
const leftPaddleEl = document.querySelector('.left-paddle');
const rightPaddleEl = document.querySelector('.right-paddle');


getRandomMeal();
renderFavMeals();

searchButtonEl.addEventListener('click', (e) => {
    
    e.preventDefault(); 
    if (searchFieldEl.value) {
        appEl.scrollTop = 0;
        renderSearchResults(searchFieldEl.value);
        searchFieldEl.value = '';
    }
});

leftPaddleEl.addEventListener('click', () => {

    let currentScrollPos = parseInt(getComputedStyle(favMealsEl).left, 10);

    const scrollAmount = 338;

    if(currentScrollPos === 0) {

        return;
    }

    currentScrollPos += scrollAmount;

    const offTargetDist = currentScrollPos % scrollAmount;

    if(offTargetDist !== 0){

        (currentScrollPos + offTargetDist) % 0 ? currentScrollPos += offTargetDist : currentScrollPos -= offTargetDist; 
    }

    favMealsEl.style.left = currentScrollPos + 'px';
})

rightPaddleEl.addEventListener('click', () => {

    let currentScrollPos = parseInt(getComputedStyle(favMealsEl).left, 10);

    const scrollAmount = 338;

    currentScrollPos -= scrollAmount;

    if(scrollAmount * (favMealsEl.querySelectorAll('.fav-meal').length / 3) <= -currentScrollPos) {

        return;
    }

    const offTargetDist = currentScrollPos % scrollAmount;

    if(offTargetDist !== 0){

        (currentScrollPos + offTargetDist) % 0 ? currentScrollPos += offTargetDist : currentScrollPos -= offTargetDist; 
    }

    favMealsEl.style.left = currentScrollPos + 'px';
});

async function getMealById(id) {

    const data = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
        .then((resp) => resp.json());

    const meal = data.meals[0];
    return meal;
}

async function getMealsBySearch(term) {

    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=` + term);
    const data = await resp.json();
    
    const mealArr = data.meals;

    return mealArr;
}

async function getRandomMeal() {

    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await resp.json();
    
    const meal = data.meals[0];
    renderMeal(meal, true);
}

async function filterMealsByCountry(country) {

    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=` + country);
    const data = await resp.json();
    
    const mealArr = data.meals;
    return mealArr;
}

async function getCountryList() {

    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
    const data = await resp.json();

    const countryList = data.meals;
    return meals;
}

async function getCategoryList() {

    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
    const data = await resp.json();

    const categoryList = data.meals;
    return meals;
}

function renderMeal(meal, random = false) {

    const mealEl = document.createElement('div');

    mealEl.classList.add('meal');

    if (random) {

        mealEl.classList.add('random');
    }
    mealEl.id = 'meal' + meal.idMeal;
    mealEl.innerHTML = `${random ?
        "<span class='title'>Chef's Choice</span>" : ''}
        <img class="meal-img" src="${meal.strMealThumb}">
        <div class="img-cover"></div>
        <div class="meal-description">
            <p class="elipsis">${meal.strMeal}</p>
            <button class="fav-btn">
                <i class="fa-solid fa-heart"></i>
            </button>
        </div>`;

    mealEl.addEventListener('click', () => renderPopUp(meal));

    const favBtnEl = mealEl.querySelector('.meal-description .fav-btn')

    if (LSGetMeals().includes(meal.idMeal)){

     favBtnEl.classList.toggle('active');   
    }

    favBtnEl.addEventListener('click', (e) => {

        e.stopPropagation();
        favBtnEl.classList.toggle('active');
        if(favBtnEl.classList.contains('active')) {

            renderNewFavMeal(meal);
            addMealLS(meal.idMeal)
        } else {

            removeFavMeal(meal);
        } 
    })
    
    mealsEl.appendChild(mealEl);
}

async function renderSearchResults(term) {

    const mealArr = await getMealsBySearch(term);
    mealsEl.innerHTML = '';
    
    if(mealArr === null || mealArr.length === 0){

        const warningEl = document.createElement('div');
        warningEl.classList.add('warning');
        warningEl.innerHTML = '<h2>No results were found ...</h2>';
        mealsEl.appendChild(warningEl);
        return;
    }

    for (let i = 0; i < mealArr.length; i++) {
        renderMeal(mealArr[i]);
    }
}

async function renderFavMeals() {

    const favMeals = LSGetMeals();

    if (favMeals.length === 0) {

       renderDefault();
    }
   
    for(let i = 0; i < favMeals.length; i++){

        const meal = await getMealById(favMeals[i]);
        renderNewFavMeal(meal);
    }
}

function renderDefault() {

    const defaultEl = document.createElement('li');
    defaultEl.classList.add('default');
    defaultEl.innerHTML = `
    <div class="frame">
        <i class="fa-solid fa-plus"></i>
    </div>
    <p class="default-desc">Add your favourite meals here</p>`;

    defaultEl.addEventListener('click', () => searchFieldEl.focus());

    favMealsEl.appendChild(defaultEl);
}

function renderNewFavMeal(meal) {

    const favMealEl = document.createElement('li');
    favMealEl.classList.add('fav-meal');
    favMealEl.id = meal.idMeal;
    favMealEl.innerHTML = `
    <button class="rem-btn"><i class="fa-solid fa-xmark"></i></button>
    <img class="fav-meal-img" src="${meal.strMealThumb}">
    <p class="fav-meal-desc elipsis">${meal.strMeal}</p>`;

    if(LSGetMeals().length === 0) {

        favMealsEl.innerHTML = '';
    }

    favMealsEl.appendChild(favMealEl);

    favMealEl.addEventListener('click', (e) => renderPopUp(meal));

    remBtnEl = favMealEl.querySelector('.rem-btn');

    remBtnEl.addEventListener('click', (e) => {
        
        e.stopPropagation();
        removeFavMeal(meal);
        const mealEl = document.getElementById('meal' + meal.idMeal);

        if(mealEl){

            mealEl.querySelector('.fav-btn').classList.toggle('active');
        }
    });
}

function removeFavMeal(meal) {

    
    let currentScrollPos = parseInt(getComputedStyle(favMealsEl).left, 10);
    const scrollAmount = 338;
    currentScrollPos -= scrollAmount;

    removeMealLS(meal.idMeal)
    const favMealEl = document.getElementById(meal.idMeal);

    if(LSGetMeals().length === 0) {

        renderDefault();
    }

    if(scrollAmount * (favMealsEl.querySelectorAll('.fav-meal').length / 3) <= -currentScrollPos) {
        if(favMealsEl.children.length % 3 === 1) {

            leftPaddleEl.click();
        }
    }
    favMealsEl.removeChild(favMealEl);
}

function renderPopUp(meal) {

    const popUpEl = document.createElement('div');
        popUpEl.classList.add('pop-up-wrapper');
        popUpEl.innerHTML = `
        <div class="pop-up">
            <button class="quit-btn "><i class="fa-solid fa-xmark"></i></button>
            <h2 class="title">${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}">
            <div class="description">
                <h3 class="title">Ingredients</h3>
                <ul class="ing-list"></ul>
                <h3 class="title">Instructions</h3>
                <p class="text">${meal.strInstructions}</p>
            </div>
        </div>`;

        popUpEl.style.top = appEl.scrollTop + 'px';

        popUpEl.IsHitTestVisible = false;

        appEl.classList.toggle('no-scroll');

        const ingList = popUpEl.querySelector('.ing-list');

        for(let i = 1; i <= 20; i++) {

            let strIngredient = 'strIngredient';
            let strMeasure = 'strMeasure';

            strIngredient += i;
            strMeasure += i;
         
            if(meal[strIngredient]){
    
                const ingEl = document.createElement('li');
                ingEl.innerHTML = `<p class="text">${meal[strIngredient]} - ${meal[strMeasure]}</p>`
                ingList.appendChild(ingEl);
            }
        }

        const quitBtnEl = popUpEl.querySelector('.quit-btn');

        quitBtnEl.addEventListener('click', () => {
            
            appEl.removeChild(popUpEl);
            appEl.classList.toggle('no-scroll');
        });
        
        appEl.appendChild(popUpEl);
}

function addMealLS(mealId) {

    const mealIds = LSGetMeals();

    if(!mealIds.includes(mealId)){

        localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
    }
}

function removeMealLS(mealId) {

    const mealIds = LSGetMeals();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((el) => el !== mealId)));
}

function LSGetMeals() {

    mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}