import { Fjax } from "./fjax.js";
import { resetDB } from "./DB.js";

const currentUser = JSON.parse(localStorage.getItem("currentUser"))
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
        currentPage = 1
        movePage("homeTemplate")
    }
}

function defineNavOnClicks() {
    const homeNav = document.getElementById('home-nav')
    const profileNav = document.getElementById('profile-nav')
    homeNav.onclick = () => {
        homeNav.classList.add("current-page");
        profileNav.classList.remove("current-page");
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
        fetchPlants(1)
        defineNavOnClicks()
        defineHomeOnClicks()

    }
    if (template === "profileTemplate") {
        fetchUserPlants();
        defineNavOnClicks()
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
        pageNum : pageNum
    })
    request._response._content.forEach( (flower,index) => {
        plantContainer.appendChild(templates.plantTemplate.cloneNode(true).content)
        plantContainer.children[index].children[0].src = ""
        plantContainer.children[index].children[1].textContent = flower.name
        plantContainer.children[index].children[2].onclick = () => {
            const rx = new Fjax()
            rx.open( "/api/users/" + currentUser.id, "PUT")
            rx.send({
                attribute : "plants",
                plant_id : flower.id
            })
        }
        })
    

}

function defineHomeOnClicks(){{
    debugger
    const nextPageBtn = document.getElementById('nextPage')
    const previousPageBtn = document.getElementById('previousPage')
    nextPageBtn.onclick = nextPage
    previousPageBtn.onclick = previousPage
}}

function nextPage(){
    if (currentPage){
        currentPage++;
        fetchPlants(currentPage)
    }
}
function previousPage(){
    if (currentPage && currentPage >= 2 && currentPage < 5){
        currentPage--;
        fetchPlants(currentPage)
    }
}
    plantContainer.appendChild(templates.plantTemplate.cloneNode(true).content)
    plantContainer.appendChild(templates.plantTemplate.cloneNode(true).content)
    plantContainer.appendChild(templates.plantTemplate.cloneNode(true).content)

}

function fetchUserPlants() {
    const plantContainer = document.getElementById('item-container')
    const reqUserPlants = new Fjax();
    const userId = JSON.parse(localStorage.getItem("currentUser")).id;
    reqUserPlants.open(`/api/users/${userId}`, "POST");
    reqUserPlants.send({ prop: "plants" });
    const userPlants = reqUserPlants._response._content;
    for (let i = 0; i<userPlants.length; i++) {
        const reqPlant = new Fjax;
        reqPlant.open(userPlants[i], "GET");
        reqPlant.send();
        const plant = reqPlant._response._content;
        plantContainer.appendChild(templates.plantTemplate.cloneNode(true).content);``
        plantContainer.children[i].children[0].src = "";
        plantContainer.children[i].children[1].innerText = plant.name;
        plantContainer.children[i].removeChild( plantContainer.children[i].children[2])
    }
}

initApp()
resetDB()



