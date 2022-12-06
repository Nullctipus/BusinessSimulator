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
var matprice = 2000;
var matsBasePrice = 2000;
var automakers = 0;
var autoMakerCost = 10000;
var price = 5;
var marketing = 1;
var marketingCost = 10000;
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
var autoMakerCostHTML = document.getElementById("autoMakerCost");
var marketingCostHTML = document.getElementById("marketingCost");
var stockscontainerHTML = document.getElementById("stockscontainer");

const TERMLINECOUNT = 5
const MATSPERPRODUCT = 2;
const POPULATION = 10;
const MATSPERPURCASE = 1000;

const PURCHASEUPDATETIME = 10;
const MATSUPDATETIME = 10000;
const MAKERUPDATETIME = 1;
const MATSOFFSETTIME = 2000;
const MAKEROFFSETTIME = 1000;
const STOCKUPDATETIME = 10000;

const LOWRISKMAXCHANGE = 10;
const LOWRISKCHANCE = .9;
const MEDRISKMAXCHANGE = 200;
const MEDRISKCHANCE = .75;
const HIGHRISKMAXCHANGE = 1000;
const HIGHRISKCHANCE = .5;

//#region StartPage
function SetStart(name, product) {
    if (name == "")
        name = "Dunder Mifflin";
    if (product == "")
        product = "Paper";
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
function BuyAutoMaker() {
    if (funds < autoMakerCost) {
        logError("Not Enough funds to make a automaker");
        return;
    }
    addFunds(-autoMakerCost);
    automakers++;
    autoMakerCost *= 2;
    autoMakerCostHTML.innerText = "Cost $" + asDollars(autoMakerCost);

}
function BuyMarketing() {
    if (funds < marketingCost) {
        logError("Not Enough funds to do Marketing");
        return;
    }
    addFunds(-marketingCost);
    marketing++;
    marketingCost *= 2;
    marketingCostHTML.innerText = "Cost $" + asDollars(marketingCost);
    demand = (marketing / asDollars(price)) / 100
    demandHTML.innerText = "Demand: " + Math.round(demand * 100) + "%"

}
function UpdateAutoMakers() {
    var amm = 0;
    for (var i = 0; i < automakers; i++) {
        var rand = Math.random();
        if (rand < .75)
            continue;
        if (rand < .95)
            amm += 1;
        else
            amm += 2;
    }
    if (mats < MATSPERPRODUCT * amm)
        amm = mats % (MATSPERPRODUCT * amm);
    mats -= amm * MATSPERPRODUCT;
    product += amm;
    matsHTML.innerText = "Materials: " + mats;
    unsoldHTML.innerHTML = "Unsold: " + product;
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
    priceHTML.innerHTML = "Price per <span class=\"hasBusinessProduct\"></span>: $" + asDollars(price);
    demand = (marketing / asDollars(price)) / 100
    demandHTML.innerText = "Demand: " + Math.round(demand * 100) + "%"
}

function randomMatsPrice() {
    matprice = Math.max(1000, matprice + Math.trunc((Math.random() - .5) * 500));
    matpriceHTML.innerText = "Cost: $" + asDollars(matprice);
}
function purchaseMats(amount) {
    if (amount * matprice > funds) {
        logError("Not Enough funds for " + amount + " Materials");
        return;
    }
    addFunds(-amount * matprice);
    mats += amount * MATSPERPURCASE;
    matsHTML.innerText = "Materials: " + mats;
}

//#region Stocks
function createStock(name, price) {
    return {
        name: name,
        price: price,
        owned: 0
    }
}
var stocks = [
    [createStock("LGN", 1000), createStock("TNP", 10000), createStock("ATL", 100000)],
    [createStock("ACC", 1000), createStock("RGS", 10000), createStock("BGX", 100000)],
    [createStock("RNG", 1000), createStock("ESC", 10000), createStock("TAB", 100000)],
];

function stocksUpdate() {
    //▽△–
    for (var risk = 0; risk < 3; risk++) {

        var chance = 0;
        var change = 0;
        switch (risk) {
            case 0:
                chance = LOWRISKCHANCE;
                change = LOWRISKMAXCHANGE;
                break;
            case 1:
                chance = MEDRISKCHANCE;
                change = MEDRISKMAXCHANGE;
                break;
            case 2:
                chance = HIGHRISKCHANCE;
                change = HIGHRISKMAXCHANGE;
                break;
        }
        for (var i = 1; i < 4; i++) {
            var vc = 0;
            var rand = Math.random();
            if (rand.toFixed(2) == chance) {
                stockscontainerHTML.children[risk].children[i].children[0].className = "";
                stockscontainerHTML.children[risk].children[i].children[0].innerText = stocks[risk][i - 1].name + " – 0";
                continue;
            }
            if (rand > chance) {
                stockscontainerHTML.children[risk].children[i].children[0].className = "stockdec";
                vc = -Math.random() * change;
                stockscontainerHTML.children[risk].children[i].children[0].innerText = stocks[risk][i - 1].name + " ▽ " + asDollars(Math.trunc(vc));
            }
            else {
                stockscontainerHTML.children[risk].children[i].children[0].className = "stockinc";
                vc = Math.random() * change;
                stockscontainerHTML.children[risk].children[i].children[0].innerText = stocks[risk][i - 1].name + " △ " + asDollars(Math.trunc(vc));
            }
            stocks[risk][i - 1].price = Math.trunc(Math.max(1, stocks[risk][i - 1].price + vc));
            stockscontainerHTML.children[risk].children[i].children[1].innerHTML = "Per Share: $" + asDollars(stocks[risk][i - 1].price) + "<br>Owned: " + stocks[risk][i - 1].owned;
        }
    }
}

function BuyStock(risk, index, amount) {
    var asInt = parseInt(amount);

    if (isNaN(asInt)) { logError(amount + " is not integer"); return }
    var { name, price } = stocks[risk][index - 1];
    if (funds < asInt * price) {
        logError("failed to buy " + amount + " " + name + " because funds are too low");
        return;
    }
    if (asInt < 0 && (-1 * asInt) > stocks[risk][index - 1].owned) {
        logError("You do not have " + amount + " " + name);
        return;
    }
    addFunds(-asInt * price);
    stocks[risk][index - 1].owned += asInt;
    stockscontainerHTML.children[risk].children[index].children[1].innerHTML = "Per Share: $" + asDollars(price) + "<br>Owned: " + stocks[risk][index - 1].owned;
}
//#endregion

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
    if (isNaN(asInt)) { logError(amount + " is not integer"); return }
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
    autoMakerCostHTML = document.getElementById("autoMakerCost");
    stockscontainerHTML = document.getElementById("stockscontainer");
    marketingCostHTML = document.getElementById("marketingCost");
    initLoan();
    logInfo("This is info text");
    logError("This is an Error");
    logSuccess("This is a Success");
});
function PurchaseUpdate() {
    if (isNaN(mats)) mats = 0;
    if (isNaN(product)) product = 0;
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
setInterval(PurchaseUpdate, PURCHASEUPDATETIME);
setInterval(stocksUpdate, STOCKUPDATETIME);
setTimeout(() => {
    setInterval(randomMatsPrice, MATSUPDATETIME);
}, MATSOFFSETTIME);
setTimeout(() => {
    setInterval(UpdateAutoMakers, MAKERUPDATETIME);
}, MAKEROFFSETTIME);