// sets everything up on load
window.addEventListener("load", ()=>{
  if(localStorage.getItem("budget_cards")){
    let storedCards = JSON.parse(localStorage.getItem("budget_cards"));
    storedCards.forEach((card)=>{
      displayCards(card.cardId, card.budgetName, card.budgetStart, card.budgetEnd);
    });
    overallBudgetMath();
  }else{
    localStorage.setItem("budget_cards", JSON.stringify([]));
    localStorage.setItem("budget_items", JSON.stringify([]));
    localStorage.setItem("id", "0");
    localStorage.setItem("listitem_id", "0");
  }
});


// adds a new budget when button is clicked
function addBudget(){
  if(!localStorage.getItem("id")){
    localStorage.setItem("id", "0");
  }
  if(!localStorage.getItem("budget_cards")){
    localStorage.setItem("budget_cards", JSON.stringify([]));
  }
  if(!localStorage.getItem("budget_items")){
    localStorage.setItem("budget_items", JSON.stringify([]));
  }


  let newId = Number(localStorage.getItem("id"))
  let newCard = {
    cardId: newId,
    budgetName: "New Budget",
    budgetStart: 0,
    budgetEnd: 0
  };
  let cards = JSON.parse(localStorage.getItem("budget_cards"));
  cards.push(newCard);
  localStorage.setItem("budget_cards", JSON.stringify(cards));

  localStorage.setItem("id", (newId++).toString());
  displayCards(newCard.cardId, newCard.budgetName, newCard.budgetStart, newCard.budgetEnd);
}


// build the html for the individual budget cards
function displayCards(id = 0, budgetName = "Budget Name", budgetStart = 0, budgetEnd = 0){


  let buildCardHTMLStart = `
		        <div class="indiv-budget-card" data-card="${id}">
		      <input type="text" class="budget-name" onblur="changeName(this, '${id}')" value="${budgetName}">
		      <p class="start-title">Budget Start:</p>
		      <div class="budget-start">$<input type="number" onblur="changeBudgetStart(this, ${id})" value="${budgetStart}"></div>
		      <ul class="budget-items">
		        <h3>Items:</h3>`;

  let listItemHTML = "";
  let listItems = localStorage.getItem("budget_items");
  if(listItems){
    let listItemArray = JSON.parse(listItems);
    listItemArray.forEach((item)=>{
      if(item.cardId == id){
        let addItem = `<li data-listid="${item.uniqueId}">
		          <input type="text" class="item-name" onblur="changeItemName(this, ${item.cardId})" value="${item.itemName}">
		          <span class="item-amount">
		            $<input value="${item.expense}" type="number" onblur="changeValue(this, ${item.uniqueId}, ${item.cardId})">
		            <delete onclick="displayDeleteOption(this)">⋮<span onclick="deleteOption(${item.uniqueId}, ${item.cardId})">Click to delete item</span></delete>
		          </span>
		        </li>`;
        listItemHTML += addItem;
      }
    });
  }

  let buildCardHTMLEnd = `</ul>
		      <div class="budget-end-wrapper">
		        <p class="end-title">Budget End:</p>
		        <div class="budget-end">$<dollar>${budgetEnd}</dollar></div>
		      </div>
		      <button class="add-item" onclick="addBudgetItem(${id})">Add Budget Item</button>
		      <div class="trash-budget" onclick="trashBudget('${id}')">🗑</div>
		    </div>
		    `;
  let card = buildCardHTMLStart + listItemHTML + buildCardHTMLEnd;
  document.querySelector(".budget-cards").innerHTML += card;

  let idNumber = Number(localStorage.getItem("id"));
  idNumber++;
  localStorage.setItem("id", idNumber.toString());
}


//adds budget list items
function addBudgetItem(parentCard){
  if(!localStorage.getItem("listitem_id")){
    localStorage.setItem("listitem_id", "0");
  }
  if(!localStorage.getItem("budget_items")){
    localStorage.setItem("budget_items", JSON.stringify([]));
  }
  let budget = document.querySelector(`.indiv-budget-card[data-card="${parentCard}"]`);
  let newItem = `<li data-listid="${localStorage.getItem('listitem_id')}">
		          <input type="text" class="item-name" onblur="changeItemName(this, ${parentCard})" value="Item Name">
		          <span class="item-amount">
		            $<input value="0" type="number" onblur="changeValue(this, ${localStorage.getItem('listitem_id')}, ${parentCard})">
		            <delete onclick="displayDeleteOption(this)">⋮<span onclick="deleteOption(${localStorage.getItem("listitem_id")}, ${parentCard})">Click to delete item</span></delete>
		          </span>
		        </li>`;
  let budgetInfo = {
    uniqueId: localStorage.getItem("listitem_id"),
    cardId: parentCard,
    itemName: "New Item",
    expense: 0
  }
  let oldBudgetItemsList = JSON.parse(localStorage.getItem("budget_items"));
  oldBudgetItemsList.push(budgetInfo);
  localStorage.setItem("budget_items", JSON.stringify(oldBudgetItemsList));

  budget.querySelector(".budget-items").innerHTML += newItem;

  let idNumber = Number(localStorage.getItem("listitem_id"));
  idNumber++;
  localStorage.setItem("listitem_id", idNumber.toString());
}


// saves and displays a budget's new name
function changeName(nameInput, id){
  nameInput.setAttribute("value", nameInput.value);
  let allBudgets = JSON.parse(localStorage.getItem("budget_cards"));
  allBudgets.forEach((budget)=>{
    if(budget.cardId == id){
      budget.budgetName = nameInput.value;
    }
  });
  localStorage.setItem("budget_cards", JSON.stringify(allBudgets));
}


// saves and displays a budget's new start amount and calculates end amount
function changeBudgetStart(inputAmount, id){
  inputAmount.setAttribute("value", inputAmount.value);
  let allBudgets = JSON.parse(localStorage.getItem("budget_cards"));
  allBudgets.forEach((budget)=>{
    if(budget.cardId == id){
      budget.budgetStart = inputAmount.value;
    }
  });
  localStorage.setItem("budget_cards", JSON.stringify(allBudgets));

  singleBudgetMath(id);
}


// saves and displays an expense item's new name
function changeItemName(nameInput, id){
  nameInput.setAttribute("value", nameInput.value);
  let allBudgets = JSON.parse(localStorage.getItem("budget_items"));
  allBudgets.forEach((items)=>{
    if(items.cardId == id){
      if(items.uniqueId == nameInput.parentNode.dataset.listid){
        items.itemName = nameInput.value;
      }
    }
  });
  localStorage.setItem("budget_items", JSON.stringify(allBudgets));
}


// saves and displays an expense item's new value
function changeValue(valueInput, itemId, cardId){
  valueInput.setAttribute("value", Math.round(valueInput.value));
  valueInput.value = Math.round(valueInput.value);
  let allBudgets = JSON.parse(localStorage.getItem("budget_items"));
  allBudgets.forEach((items)=>{
    if(items.cardId == cardId){
      if(items.uniqueId == itemId){
        items.expense = valueInput.value;
      }
    }
  });
  localStorage.setItem("budget_items", JSON.stringify(allBudgets));
  singleBudgetMath(cardId);
}


//toggles option to delete a budget item/expense
function displayDeleteOption(option){
  option.querySelector("span").classList.toggle("active");
}


//deletes budget item/expense if confirmed
function deleteOption(uniqueId, cardId){
  let areYouSure = confirm("You are about to delete this budget item. Are you sure you would like to proceed? (This action cannot be undone.)");
  if(areYouSure){
    document.querySelector(`li[data-listid="${uniqueId}"`).remove();
    let budgetItems = JSON.parse(localStorage.getItem("budget_items"));
    budgetItems.forEach((item, index, storageObject)=>{
      if(item.uniqueId == uniqueId){
        storageObject.splice(index, 1);
      }
    });
    localStorage.setItem("budget_items", JSON.stringify(budgetItems));
    singleBudgetMath(cardId);
  }
}


// gets rid of entire budget
function trashBudget(cardId){
  let areYouSure = confirm("You are about to delete this budget envelope. Are you sure you would like to do this? (This action cannot be undone.)");
  if(areYouSure){
    let budgetCards = JSON.parse(localStorage.getItem("budget_cards"));
    budgetCards.forEach((item, index, budgetObject)=>{
      if(item.cardId == cardId){
        budgetObject.splice(index, 1);
      }
    });
    localStorage.setItem("budget_cards", JSON.stringify(budgetCards));

    let budgetItems = JSON.parse(localStorage.getItem("budget_items"));
    let filterdBudgetItems = budgetItems.filter((item)=>{
      if(item.cardId == cardId){
        return false;
      }else{
        return true;
      }
    });
    console.log(budgetItems);
    localStorage.setItem("budget_items", JSON.stringify(filterdBudgetItems));
    document.querySelector(`.indiv-budget-card[data-card="${cardId}"]`).remove();
    overallBudgetMath();
  }
}


// does the math for a single budget card
function singleBudgetMath(cardId){
  let startCardValue = 0,
      totalItemValues = 0,
      remainingBalance = 0,
      cards = JSON.parse(localStorage.getItem("budget_cards")),
      itemsPerCard = JSON.parse(localStorage.getItem("budget_items"));

  if(cards != null){
    cards.forEach(card=>{
      if(card.cardId == cardId){
        startCardValue = Number(card.budgetStart);
      }
    });
  }

  if(itemsPerCard != null){
    itemsPerCard.forEach(item=>{
      if(item.cardId == cardId){
        totalItemValues += Number(item.expense);
      }
    });
  }

  remainingBalance = startCardValue - totalItemValues;
  cards.forEach(card=>{
    if(card.cardId == cardId){
      card.budgetEnd = remainingBalance;
    }
  });
  localStorage.setItem("budget_cards", JSON.stringify(cards));
  document.querySelector(`.indiv-budget-card[data-card="${cardId}"] .budget-end dollar`).innerHTML = remainingBalance;
  overallBudgetMath();
}


// does the math for all the budgets
function overallBudgetMath(){
  if(localStorage.getItem("budget_cards")){

    let startingBudget = 0;
    let budgetCards = JSON.parse(localStorage.getItem("budget_cards"));
    budgetCards.forEach( budget =>{
      startingBudget += Number(budget.budgetStart);
    });

    let allExpenses = 0;
    if(localStorage.getItem("budget_items")){
      let budgetItems = JSON.parse(localStorage.getItem("budget_items"));
      budgetItems.forEach(item=>{
        allExpenses += Number(item.expense);
      });
    }

    document.querySelector("#total-start").innerHTML = "$" + startingBudget;
    document.querySelector("#total-spent").innerHTML = "$" + allExpenses;
    document.querySelector("#total-remaining").innerHTML = "$" + (startingBudget-allExpenses);
  }
}

function archiveBudgetsConfirm(){
  let archiveConfirm = confirm("You are about to download/archive this budget and erase information from the app. Would you like to continue?");
  if(archiveConfirm){
    archiveBudgets();
  }
}

function archiveBudgets(){
  let budgetCards = localStorage.getItem("budget_cards");
  let budgetItems = localStorage.getItem("budget_items");
  let concatenated = JSON.stringify([budgetCards,budgetItems]);
  let downloadFile = "data:text/plain;charset=utf-8," + encodeURIComponent(concatenated);
  document.querySelector(".downloader").setAttribute("href", downloadFile);
  document.querySelector(".downloader").click();
  localStorage.clear();
  document.querySelector(".budget-cards").innerHTML = "";
  document.querySelectorAll("#total-start, #total-spent, #total-remaining").forEach((item)=>{
    item.innerHTML = "$0";
  });
}

function importBudgetConfirm(){
  let importConfirm = confirm("Before you import a previous budget, be sure you have saved and archived your previous budget. Are you sure you would like to continue?");
  if(importConfirm){
    document.querySelector(".uploader").click();
  }
}

function uploadBudget(){
  let file = document.querySelector(".uploader").files[0];
  if(file.name.split(".")[1] != "budgets"){
    alert(`Sorry, that file type is not supported by this program. Please try again by uploading a ".budgets" file.`);
    return;
  }

  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function() {
    let results = JSON.parse(reader.result);
    console.log(results);
    let budgetCards = JSON.parse(results[0]);
    if(budgetCards.length > 0){
      localStorage.setItem("budget_cards", JSON.stringify(budgetCards));
      localStorage.setItem("id", ((budgetCards[budgetCards.length - 1].cardId) + 1).toString());
      window.location.reload();
    }
    let budgetItems = JSON.parse(results[1]);
    localStorage.setItem("budget_items", JSON.stringify(budgetItems));
    if(budgetItems.length > 0){
      localStorage.setItem("listitem_id", ((budgetItems[budgetItems.length - 1].uniqueId) + 1).toString());
    }
  };

  reader.onerror = function() {
    alert("Sorry, something went awry with your upload. Try uploading again and only use a \".budgets\" file.");
    console.log(reader.error);
  };

}


// adding service worker functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/budget/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}
