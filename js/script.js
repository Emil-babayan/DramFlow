import getData from "./fb-helpers.js"
import {drawGraph} from "./canvas.js"

let DATA = []
const keys = ["USD", "EUR", "GBP", "CAD", "CHF", "RUB", "GEL"]
let time = null
let dialogIsOpen = false

const urlBtc = "https://blockchain.info/ticker";
const cells = document.getElementsByTagName("td")
const clock = document.querySelector(".clock")
const main = document.querySelector("main")
const chartIcon = document.querySelector("svg")
const dateRange = document.querySelector("h2")
const flagsection = document.querySelector(".flagsection")
const canvas = document.getElementById("canvas")

canvas.width = canvas.offsetParent.offsetWidth
canvas.height = 301;

function showDialog(){
  dialogIsOpen = true
  const veil = document.createElement("div")
  const dialog = document.createElement("div")
  const info = document.createElement("p")
  const author = document.createElement("p")
  const input = document.createElement("input")

  veil.classList.add("veil")
  dialog.classList.add("dialog")
  info.classList.add("info")
  author.classList.add("author")
  input.type = "button"
  input.value = "Հասկացա"
  info.textContent = "Տվյալները վերցված են ՀՀ ԿԲ-ից և Blockchain.info կրիպտոարժույթային հարթակից"
  author.textContent = "Coded by Emil Babayan, 2023, no rights reserved"

  input.addEventListener("click", function(){
    veil.remove()
    dialog.remove()
    dialogIsOpen = false
  })

  dialog.append(info, input, author)
  main.append(veil, dialog)

}

function setTime(){
  const now = new Date()
  const hours = now.getHours()
  const mins = now.getMinutes()
  const seconds = now.getSeconds()
  clock.firstElementChild.textContent = `${hours.toString().padStart(2, 0)}:${mins.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`
}

function setDate(){
  const now = new Date()
  const monthIndex = now.getMonth()
  const day = now.getDate()
  const weekday = now.getDay()
  const months = ['Հունվարի', 'Փետրվարի', 'Մարտի', 'Ապրիլի', 'Մայիսի', 'Հունիսի', 'Հուլիսի', 'Օգոստոսի', 'Սեպտեմբերի', 'Հոկտեմբերի', 'Նոյեմբերի', 'Դեկտեմբերի']
  const days = ["կիրակի", "երկուշաբթի", "երեքշաբթի", "չորեքշաբթի", "հինգշաբթի", "ուրբաթ", "շաբաթ"]
  document.querySelector(".datecell").textContent = `${months[monthIndex]} ${day}, ${days[weekday]}`
}

function formatDiff(diff){
  if(Number.isInteger(diff)){
    return diff + ".00"
  }
  return Number(diff + "0").toFixed(2)
}

async function fetchData(){
  const res = await getData()
  renderData(res)
  DATA.push(...res)
  localStorage.setItem("exchangedata", JSON.stringify(res))
  localStorage.setItem("dtex", Date.now())
}

function isFresh(){
  const lastTimeStamp = +localStorage.getItem("dtex");
  if(!lastTimeStamp || !localStorage.getItem("exchangedata")) return false
  const currentDate = new Date();
  const lastDate = new Date(lastTimeStamp);
  const isSameDay = currentDate.getUTCDate() === lastDate.getUTCDate() && currentDate.getUTCMonth() === lastDate.getUTCMonth() && currentDate.getUTCFullYear() === lastDate.getUTCFullYear();

  const currentHourUTC = currentDate.getUTCHours();

  return !(!isSameDay || (currentHourUTC >= 13 && lastDate.getUTCHours() < 13));

}

function fillDataRange(start, end){
  start = new Date(start.created.seconds * 1000)
  end = new Date(end.created.seconds * 1000)
  return `${String(start.getDate()).padStart(2, 0)}.${String(start.getMonth() + 1).padStart(2, 0)}.${start.getFullYear()} – ${String(end.getDate()).padStart(2, 0)}.${String(end.getMonth() + 1).padStart(2, 0)}.${end.getFullYear()}`

}

function renderData(resource = DATA){
  const latest = resource.at(-1)
  const prev = resource.at(-2)
  const flagpointCurrencyRates = flagsection.getElementsByTagName("h4")
  const populateHero = document.querySelector("h4")
  populateHero.textContent = latest["USD"]
  populateHero.appendChild(Object.assign(document.createElement("sub"), {textContent: "֏"}))
  keys.forEach((key, idx) => {
    const amount = (+latest[key]).toFixed(2)
    let diff = +(amount - prev[key]).toFixed(2)
    cells[idx + 1].textContent = flagpointCurrencyRates[idx].textContent = amount
    flagpointCurrencyRates[idx].appendChild(Object.assign(document.createElement("sub"), {textContent: "֏"}))

    const pointer = cells[idx + 1].previousElementSibling
    const spanToAppend = document.createElement("span")
    let actions = {
      less: {
        class: "fall",
        textContent: "▾",
        appendage: ""
      },
      more: {
        class: "up",
        textContent: "▴",
        appendage: "+"
      },
      same: {
        class: "stable",
        textContent: "◬",
        appendage: ""
      },
    }

    let action = null
    if(diff < 0) action = "less"; else if(diff > 0) action = "more"; else action = "same"

    pointer.classList.add(actions[action].class)
    Object.assign(spanToAppend, {textContent: actions[action].textContent})
    pointer.append(spanToAppend, actions[action].appendage, formatDiff(diff))

    dateRange.textContent = fillDataRange(resource[0], resource.at(-1))

    drawGraph(canvas, resource.map(elem => ({
      value: elem["USD"],
      date: elem.created.seconds * 1000
    })))

  })

  fetch(urlBtc)
  .then(res => res.json())
  .then(({USD}) => {
    cells[cells.length - 1].textContent = splitBy(Math.floor((USD["15m"] * latest["USD"])).toString(), 3, "_")
  })
}

function splitBy(string, chuknSize, delimiter){
  let result = ""
  let idx = 0
  for(let i = string.length - 1; i >= 0; i--){
    result = string[i] + result
    idx++
    idx %= chuknSize
    if(!idx) result = delimiter + result

  }
  return result
}

function init(){
  const stale = !isFresh()
  if(stale) fetchData(); else{
    const localData = JSON.parse(localStorage.getItem("exchangedata"))
    DATA.push(...localData)
    renderData(localData)
  }

}

flagsection.addEventListener("click", function(e){

  const key = e.target.dataset.key
  if(!key) return
  const activeTarget = e.target.closest(".flagpoint")
  console.log(activeTarget)
  const hero = document.querySelector(".chart-hero")
  hero.replaceChildren(...activeTarget.cloneNode(true).children)
  activeTarget.classList.add("active")

  for(const elem of flagsection.children){
    elem.classList.toggle("active", activeTarget === elem)
  }

  const dataSelected = DATA.map(elem => ({
    value: elem[key],
    date: elem.created.seconds * 1000
  }))

  drawGraph(canvas, dataSelected)

})

window.addEventListener("keydown", function(e){
  if(e.key == "F12") e.preventDefault()
  if(e.altKey && e.ctrlKey && e.key == "i" && !dialogIsOpen){
    showDialog()
  }
})

chartIcon.addEventListener("click", () => {
  main.classList.toggle("charts")
})

window.addEventListener("DOMContentLoaded", function(){
  setDate()
  setTime()
  time = setInterval(setTime, 1000)
  init()
})

window.addEventListener("contextmenu", function(e){
  e.preventDefault()
})

