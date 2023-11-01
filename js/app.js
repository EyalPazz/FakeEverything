import { Fjax } from "./fjax.js";
import { resetDB } from "./DB.js";

let currentUser = JSON.parse(localStorage.getItem("currentUser"))
let currentPage;

const templates = {
    homeTemplate: document.getElementById('home-temp'),
    loginTemplate: document.getElementById('login-temp'),
    plantTemplate: document.getElementById('plant-temp'),
    profileTemplate: document.getElementById('my-profile-temp')
}

function initApp() {
    document.body.appendChild(templates.loginTemplate.cloneNode(true).content)
    history.pushState({ page: "login" }, "login", "#" + "login")
    defineLoginOnClicks()
    window.onhashchange = () => {
        movePage(history.state.page + "Template")
    }
}

function defineLoginOnClicks() {
    const loginBtn = document.getElementById('login-btn')
    loginBtn.onclick = () => {
        localStorage.setItem("currentUser", JSON.stringify({
            id: 1,
            name: "daksjdlasd",
            plants: [],
        }))
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
        currentPage = 1
        movePage("homeTemplate");
    }
}

function defineNavOnClicks() {
    const homeNav = document.getElementById('home-nav')
    const profileNav = document.getElementById('profile-nav')
    homeNav.onclick = () => {
        movePage("homeTemplate")
    }
    profileNav.onclick = () => {
        profileNav.classList.add("current-page");
        homeNav.classList.remove("current-page");
        movePage("profileTemplate")
    }

}

function movePage(template) {
    document.body.removeChild(document.body.children[9])
    document.body.appendChild(templates[template].cloneNode(true).content)
    if (template === "loginTemplate") {
        defineLoginOnClicks()
    }
    if (template === "homeTemplate") {
        document.getElementById("username").innerText += " " + currentUser.name;
        fetchPlants(1)
        defineNavOnClicks()
        defineHomeOnClicks()
        document.getElementById('home-nav').classList.add("current-page");
        document.getElementById('profile-nav').classList.remove("current-page");
        document.getElementById("search-btn").addEventListener("click", searchPlants);
    }
    if (template === "profileTemplate") {
        fetchUserPlants();
        document.getElementById("username").innerText += " " + currentUser.name;
        document.getElementById("profile-header").innerText =  `${currentUser.name}'s Plants`;
        defineNavOnClicks()
        document.getElementById('home-nav').classList.remove("current-page");
        document.getElementById('profile-nav').classList.add("current-page");
    }
    const name = template.split('T')[0]
    history.pushState({ page: name }, name, "#" + name)
}

function fetchPlants(pageNum) {
    const plantContainer = document.getElementById('item-container')
    plantContainer.innerHTML = ''
    const request = new Fjax()
    request.open("/api/plants", "POST")
    request.send({
        pageNum: pageNum
    })
    request._response._content.forEach((flower, index) => {
        plantContainer.appendChild(templates.plantTemplate.cloneNode(true).content)
        plantContainer.children[index].children[0].firstElementChild.src = flower.src;
        plantContainer.children[index].children[1].textContent = flower.name
        plantContainer.children[index].children[2].onclick = () => {
            const rx = new Fjax()
            rx.open("/api/users/" + currentUser.id, "PUT")
            rx.send({
                attribute: "plants",
                plant_id: flower.id
            })
            currentUser.plants = rx._response._content;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
    })


}

function defineHomeOnClicks() {
    {
        const nextPageBtn = document.getElementById('nextPage')
        const previousPageBtn = document.getElementById('previousPage')
        nextPageBtn.onclick = nextPage
        previousPageBtn.onclick = previousPage
    }
}

function nextPage() {
    if (currentPage) {
        currentPage++;
        fetchPlants(currentPage)
    }
}
function previousPage() {
    if (currentPage && currentPage >= 2 && currentPage < 5) {
        currentPage--;
        fetchPlants(currentPage)
    }
}

function fetchUserPlants() {
    const plantContainer = document.getElementById('item-container')
    const reqUserPlants = new Fjax();
    const userId = JSON.parse(localStorage.getItem("currentUser")).id;
    reqUserPlants.open(`/api/users/${userId}`, "POST");
    reqUserPlants.send({ prop: "plants" });
    const userPlants = reqUserPlants._response._content;
    for (let i = 0; i < userPlants.length; i++) {
        const reqPlant = new Fjax;
        reqPlant.open(userPlants[i], "GET");
        reqPlant.send();
        const plant = reqPlant._response._content;
        plantContainer.appendChild(templates.plantTemplate.cloneNode(true).content);
        const thisPlant =  plantContainer.children[i];
        plantContainer.children[i].children[0].firstElementChild.src = plant.src;
        plantContainer.children[i].children[1].innerText = plant.name;
        plantContainer.children[i].children[2].innerText = "remove";
        plantContainer.children[i].children[2].onclick = () => {
            const rx = new Fjax()
            rx.open("/api/users/" + currentUser.id, "DELETE")
            rx.send({
                plant_id: plant.id
            })
            plantContainer.removeChild(thisPlant);
            currentUser.plants = rx._response._content;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
    }
}

function searchPlants() {
    const searchInput = document.getElementById("search").value;
    document.getElementById("search").value = "";
}

initApp()
resetDB()



