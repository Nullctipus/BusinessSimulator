function Init() {
    funds = 0;
    product = 0;
    invdemand = 3;
    mats = 0;
    price = .5;
    lifetimeSales = 0;
    initLoan();
    setTab(1);
    addFunds(0); // update text
}
var funds = 0;
var product = 0;
var lifetimeSales = 0;
var demand = .3;
var mats = 0;
var matprice = 10;
var price = 5;
var marketing = 1;
var BusinessName = "";
var BusinessProduct = "";
var termHTML = document.getElementById("terminal");
var gameHTML = document.getElementById("game");
var fundsHTML = document.getElementById("fundsinfo");
var loanHTML = document.getElementById("loaninfo");
var unsoldHTML = document.getElementById("unsoldProductInfo");
var demandHTML = document.getElementById("demandinfo");
var matsHTML = document.getElementById("matsinfo");
var priceHTML = document.getElementById("pricePerProduct");
var matpriceHTML = document.getElementById("matsprice");
const TERMLINECOUNT = 5
const MATSPERPRODUCT = 2;
const POPULATION = 100;

//#region StartPage
function SetStart(name, product) {
    BusinessName = name;
    BusinessProduct = product;
    document.getElementById("startinfo").style.display = "none";
    gameHTML.style.display = "";
    logSuccess("Set Name to " + name + " and Product to " + product);
    document.styleSheets[0].insertRule('.hasBusinessName::after {content:"' + name + '" ;}');
    document.styleSheets[0].insertRule('.hasBusinessProduct::after {content: "' + product + '";}');
}
//#endregion

//#region GUI

function log(html) {
    for (var i = 0; i < 4; i++)
        termHTML.children[i].innerHTML = termHTML.children[i + 1].innerHTML;
    termHTML.children[4].innerHTML = html;
}
function logInfo(str) {
    console.log("[STDOUT] " + str);
    log("[STDOUT] " + str);
}
function logError(str) {
    console.log("[STDERR] " + str);
    log("<span style=\"color:#ff0000;\">[STDERR] " + str + "</span>");
}
function logSuccess(str) {
    console.log("[STDSUC] " + str);
    log("<span style=\"color:#00ff00;\">[STDSUC] " + str + "</span>");
}
var currentTab = 1;
function setTab(n) {
    gameHTML.children[currentTab].style.display = "none";
    gameHTML.children[n].style.display = "";
    currentTab = n;

}
function addFunds(amount) {
    funds += Math.round(amount);
    fundsHTML.innerText = "Funds: " + asDollars(funds);
}

function MakeProduct(amount) {
    if (mats < MATSPERPRODUCT * amount) {
        logError("Not Enough Mats to make " + amount + " " + BusinessProduct);
        return;
    }
    mats -= MATSPERPRODUCT * amount;
    product += amount;
    matsHTML.innerText = "Materials: " + mats;
    unsoldHTML.innerHTML = "Unsold: " + product;
}
function asDollars(cents) {
    return cents / 100;
}
function addPrice(aprice) {
    if (price + aprice == 0)
        return
    price += aprice;
    priceHTML.innerHTML = "Price per <span class=\"hasBusinessProduct\"></span>: " + asDollars(price);
    demand = (marketing / asDollars(price)) / 100
    demandHTML.innerText = "Demand: " + Math.round(demand * 100) + "%"
}
function purchaseMats(amount) {
    if (amount * matprice > funds) {
        logError("Not Enough funds for " + amount + " Materials");
        return;
    }
    addFunds(-amount * matprice);
    mats += amount;
    matsHTML.innerText = "Materials: " + mats;
}

//#endregion
//#region Loans
var loan = {
    start: 0,
    amount: 0,
    percent: 0,
    simple: true,
    interval: 0
}
function initLoan() {
    loan = {
        start: 0,
        amount: 0,
        percent: 0,
        simple: true,
        interval: 0
    }
    document.getElementById("loanbuttons").style.display = "";
    document.getElementById("afterloan").style.display = "none";
    loanHTML.style.display = "none";

}
function setLoan(amount, percent, simple, interval) {
    addFunds(amount);
    loan.start = amount;
    loan.amount = amount;
    loan.percent = percent;
    loan.simple = simple;
    loan.interval = interval
    setTimeout(updateLoan, interval);
    loanHTML.innerText = "Loan: " + asDollars(loan.amount) + " left to pay"
    document.getElementById("loanbuttons").style.display = "none";
    document.getElementById("afterloan").style.display = "";
    loanHTML.style.display = "";
}
function updateLoan() {
    if (loan.amount > 0) {
        if (loan.simple)
            loan.amount += loan.start * loan.percent;
        else
            loan.amount += loan.amount * loan.percent;
        loan.amount = Math.round(loan.amount)
        loanHTML.innerText = "Loan: " + asDollars(loan.amount) + " left to pay"
        setTimeout(updateLoan, loan.interval);
        if (loan.amount > 0 && funds == 0 && product == 0 && mats == 0) {
            setTab(4) //bankrupt
        }
    }
}
function payLoan(amount) {
    var asInt = parseInt(amount);
    if (isNaN(asInt)) { log(amount + " is not integer"); return }
    asInt *= 100;
    if (funds >= asInt) {
        addFunds(-asInt)
        loan.amount -= asInt;
        loanHTML.innerText = "Loan: " + loan.amount + " left to pay"
        logSuccess("Paid " + amount + " off loan");
    }
    else
        logError("you don't have " + amount + " funds");
    if (loan.amount <= 0) {
        addFunds(-loan.amount);
        initLoan();
        //document.getElementById("tabs").children[0].style.display = "none";
        //setTab(2);
    }
}
//#endregion
addEventListener('DOMContentLoaded', (event) => {
    termHTML = document.getElementById("terminal");
    gameHTML = document.getElementById("game");
    fundsHTML = document.getElementById("fundsinfo");
    loanHTML = document.getElementById("loaninfo");
    unsoldHTML = document.getElementById("unsoldProductInfo");
    demandHTML = document.getElementById("demandinfo");
    matsHTML = document.getElementById("matsinfo");
    priceHTML = document.getElementById("pricePerProduct");
    matpriceHTML = document.getElementById("matsprice");
    initLoan();
    logInfo("This is info text");
    logError("This is an Error");
    logSuccess("This is a Success");
});
function Update() {
    if (product > 0) {
        var amm = Math.floor(POPULATION * demand);
        //Chance the amount gets added
        if (Math.random() <= (POPULATION * demand) - amm)
            amm++;
        if (amm > product)
            amm = product;
        addFunds(price * amm);
        product -= amm;
        unsoldHTML.innerText = "Unsold: " + product;

    }
}
setInterval(Update, 1000);