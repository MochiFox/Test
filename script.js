
var EnemyHealth = 10;
var EnemyDamage = 5;
var EnemyNumber = 0;
var EnemySpeed = 3;
var Money = 200;
var HeroExp = 0;
var HeroMaxHealth = 100;
var HeroHealth = 100;
var HeroDamage = 5;
var ETime = 0;
var PTime = 0;
var paused = false;
var EnemyMaxHealth = 10;
var AttackLevel = 1;
var HeroSpeed = 20;
var CurrentWeapon = 0;
var CurrentPage = 0;
var OwnedItems = [0];
/*function get(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // defensive check
            if (typeof callback === "function") {
                // apply() sets the meaning of "this" in the callback
                callback.apply(xhr);
            }
        }
    };
    xhr.send();
}
// ----------------------------------------------------------------------------


var finalUrl = "https://mochifox.github.io/Test/Enemies.json";
var EnemyStats = [];
// get() completes immediately...
get(finalUrl,
    // ...however, this callback is invoked AFTER the response arrives
    function () {
        // "this" is the XHR object here!
        idk = this.responseText
        //EnemyStats = JSON.parse(this.responseText);
    }
);
alert(idk)


function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("TestTxt").innerHTML  return this.responseText;
      }
    };
    xhttp.open("GET", "https://mochifox.github.io/Test/Enemies.json", true);
    xhttp.send();
    return xhttp.responseText;
  }

function DisplayText(Txt) {
    document.getElementById("TestTxt").innerHTML = Txt;
}
loadDoc()
DisplayText(loadDoc());
let EnemyStats = JSON.parse(idk);
*/
function DisplayText(Txt) {
    document.getElementById("TestTxt").innerHTML = Txt;
}
let EnemyStats = [];
let ItemStats = [];
InitialiseConstants();

$(document).ready(function () {
    let units = window.localStorage.getItem('units');
    if (units != null) {
        units = JSON.parse(units);

        EnemyHealth = units['EnemyHealth'];
        EnemyMaxHealth = units['EnemyMaxHealth'];
        HeroMaxHealth = units['HeroMaxHealth'];       
        HeroHealth = units['HeroHealth'];
        HeroDamage = units['HeroDamage'];
        Money = units['Money'];
        EnemyDamage = units['EnemyDamage'];
        EnemySpeed = units['EnemySpeed'];
        ETime = units['ETime'];
    }

    showUpdate();
    //each second
    window.setInterval(function () {
        //set each unit
        showUpdate();
        getUpdate();
        HeroDamage = AttackLevel;
        window.localStorage.setItem(
            'units', JSON.stringify({
                'EnemyHealth': EnemyHealth,
                'EnemyMaxHealth': EnemyMaxHealth,
                'HeroMaxHealth': HeroMaxHealth,
                'HeroHealth': HeroHealth,
                'HeroDamage': HeroDamage,
                'HeroSpeed': HeroSpeed,
                'Money': Money,
                'EnemyDamage': EnemyDamage,
                'ETime': ETime,
                'PTime': PTime,
                'EnemySpeed': EnemySpeed,
                'paused' : paused,
                'AttackLevel': AttackLevel,
                'OwnedItems': OwnedItems
            })
        );
    }, 100);
}); 

function showUpdate() {
    document.getElementById("DisplayEnemyHP").innerHTML = EnemyStats[EnemyNumber].Name +" HP: " + EnemyHealth + "/" + EnemyMaxHealth;
    document.getElementById("DisplayHeroHP").innerHTML = "HP: " + HeroHealth + "/" + HeroMaxHealth;
    document.getElementById("DisplayEnemyDamage").innerHTML = "The enemy is dealing " + EnemyDamage + ' damage every ' + EnemySpeed/10 + ' seconds';
    document.getElementById("DisplayHeroDamage").innerHTML = "Level: " + AttackLevel + " You are dealing " + (HeroDamage + ItemStats[CurrentWeapon].Damage) + ' damage every ' + HeroSpeed/10 + ' seconds';
    document.getElementById("DisplayGold").innerHTML = "Gold: " + Money ;
    document.getElementById("UpgradeCost").innerHTML = "Costs: " + AttackLevel * 2 ;
    document.getElementById("Weapon").innerHTML = "Current Weapon: " + ItemStats[CurrentWeapon].Name + " is adding " + ItemStats[CurrentWeapon].Damage + " damage";
    if (paused == false) {
        document.getElementById("DisplayDead").innerHTML = "";
    }
    else {
        document.getElementById("DisplayDead").innerHTML = "*You are dead* Please wait a moment";
    }


}
//functions for the units
//a is one more for each click
function getEnemyHP() {
    if (paused == false) {
        EnemyHealth = EnemyHealth - (HeroDamage + ItemStats[CurrentWeapon].Damage);
        if (EnemyHealth <= 0) {
            Money = Money + 5;
            ETime = 0;
            PTime = 0;
            EnemyHealth = EnemyMaxHealth;
        }
    }
    showUpdate();
}

function NextEnemy() {
    if (paused == false) {
        if (EnemyNumber < (EnemyStats.length - 1)) {
            EnemyNumber = EnemyNumber + 1;
            InitialiseEnemy(EnemyNumber);
            ETime = 0;
            PTime = 0;
        }
        else {
            EnemyNumber = EnemyStats.length - 1;
        }
    }
    showUpdate();
}

function LastEnemy() {
    if (paused == false) {
        if (EnemyNumber > 0) {
            EnemyNumber = EnemyNumber - 1;
            InitialiseEnemy(EnemyNumber);
            ETime = 0;
            PTime = 0;
        }
        else {
            EnemyNumber = 0;
        }
    }
    showUpdate();
}

function UpgradeAttack() {
    if (Money >= AttackLevel * 2) {
        Money = Money - AttackLevel * 25;
        AttackLevel = AttackLevel + 1
    }
}
function getUpdate() {
    if (ETime >= EnemySpeed) {
        ETime = 0;
        HeroHealth = HeroHealth - EnemyDamage;
    }

    if (EnemyHealth <= 0) {
        Money = Money + 5;
        ETime = 0;
        PTime = 0;
        EnemyHealth = EnemyMaxHealth;
    }

    if (PTime >= HeroSpeed) {
        PTime = 0;
        EnemyHealth = EnemyHealth - (ItemStats[CurrentWeapon].Damage + HeroDamage);
    }

    if (paused == true) {
        HeroHealth = HeroHealth + HeroMaxHealth/20;
    }
    
    if (HeroHealth <= 0) {
        ETime = 0;
        PTime = 0;
        HeroHealth = 0;
        paused = true;
    }

    if (HeroHealth == HeroMaxHealth) {
        paused = false;
    }
    if (paused == false) {
        ETime = ETime + 1
    }
    if (paused == false) {
        PTime = PTime + 1
    }

}

function InitialiseEnemy(ID) {
    EnemyMaxHealth = EnemyStats[ID].Health;
    EnemyHealth = EnemyMaxHealth;
    EnemyDamage = EnemyStats[ID].Damage;
    EnemySpeed = EnemyStats[ID].Speed;
}

function InitialiseConstants() {
    EnemyStats = [
        {Name:"Goblin", Health:10, Damage:5, EXP:1, Gold:5, Speed:10},
        {Name:"Gnoblin", Health:15, Damage:16, EXP:3, Gold:10, Speed:15},
        {Name:"Gnomlin", Health:60, Damage:20, EXP:10, Gold:25, Speed:40},
        {Name:"Gromlin", Health:20, Damage:2, EXP:25, Gold:45, Speed:1},
        {Name:"Gremlin", Health:80, Damage:20, EXP:30, Gold:50, Speed:10},
        {Name:"a", Health:99, Damage:9, EXP:9, Gold:9, Speed:9}
    ];
    ItemStats = [
        {Name:"Practice Sword", Cost:5, Health:5, Damage:5, EXP:0, Gold:0, Speed:0.9},
        {Name:"Wooden Shield", Cost:5, Health:25, Damage:1, EXP:0, Gold:0, Speed:1.1},
        {Name:"Sharpened Practice Sword", Cost:10, Health:5, Damage:5, EXP:0, Gold:0, Speed:0.9},
        {Name:"Reinforced Wooden Shield", Cost:10, Health:25, Damage:1, EXP:0, Gold:0, Speed:1.1},
        {Name:"Sword", Cost:20, Health:5, Damage:5, EXP:0, Gold:0, Speed:0.9},
        {Name:"Shield", Cost:20, Health:25, Damage:1, EXP:0, Gold:0, Speed:1.1},
        {Name:"Practice Sword", Cost:5, Health:5, Damage:5, EXP:0, Gold:0, Speed:0.9},
        {Name:"Wooddeld", Cost:5, Health:25, Damage:1, EXP:0, Gold:0, Speed:1.1},
        {Name:"Sharpenedd", Cost:10, Health:5, Damage:5, EXP:0, Gold:0, Speed:0.9},
        {Name:"Reiaed Wooden Shield", Cost:10, Health:25, Damage:1, EXP:0, Gold:0, Speed:1.1},
        {Name:"Swoad", Cost:20, Health:5, Damage:5, EXP:0, Gold:0, Speed:0.9},
        {Name:"Shdld", Cost:20, Health:25, Damage:1, EXP:0, Gold:0, Speed:1.1}
    ];
    
    CurrentPage = 0;

    InitialiseEnemy(EnemyNumber)
    showUpdate();
}

function UpdateShop() {
    CreateCustomTable(7, 4, 'ShopTable', ShopRowFunction);
    document.getElementById("ShopPage").innerHTML = "<b>" + CurrentPage + "</b>" ;
    /*document.getElementById("ShopPage").innerHTML = "Page: " + (CurrentPage + 1);
    for (i = 0; i < 5; i++) {
        if ((CurrentPage * 4 + i) < ItemStats.length) {
            document.getElementById("ShopName" + i).innerHTML = ItemStats[CurrentPage * 4 + i].Name ;
            document.getElementById("ShopPrice" + i).innerHTML = ItemStats[CurrentPage * 4 + i].Cost ;
            document.getElementById("ShopStats" + i).innerHTML = ItemStats[CurrentPage * 4 + i].Damage ;
            if ((CurrentPage * 4 + i) == CurrentWeapon) {
                document.getElementById("ShopBuy" + i).innerHTML = ' <button> OWNED </button> ' ;
            }
            else {
                document.getElementById("ShopBuy" + i).innerHTML = ' <button onclick="BuyItem(' + i + ')"> BUY </button> ' ;
            }
        }
        else {
            document.getElementById("ShopName" + i).innerHTML = "Coming Soon" ;
            document.getElementById("ShopPrice" + i).innerHTML = '' ;
            document.getElementById("ShopStats" + i).innerHTML = '' ;
            document.getElementById("ShopBuy" + i).innerHTML = '' ;
        }
    }*/
}
UpdateShop();

function CreateCustomTable(Rows, Columns, ID, RowFunction) {
    var table = document.getElementById(ID);
    for(k = table.rows.length - 1; k >= 0; k--){
        table.deleteRow(k);
    }
    for (i=0; i<Rows; i++) {
        var row = table.insertRow(i);
        for (j=0; j<Columns; j++) {
            var cell = row.insertCell(j);
            cell.innerHTML = RowFunction(i, j)[0];
            cell.className = RowFunction(i, j)[1];
        }
    }
}

function ShopRowFunction(TableRow, Column) {
    if (TableRow == 0) {
        Header = ['<b> Name </b>', "<b> Cost </b>", '<b> Damage </b>', '<b style="width:100%"> BUY </b>'];
        style = 'ShopTableHeader';
        return [Header[Column], style];
    }
    else {
        style = 'ShopTableCells'
        ItemNumber = CurrentPage * 6 + TableRow - 1;
        if (CurrentWeapon == ItemNumber) {
            PurchaseButton = ' <button style="color:black"> EQUIPPED </button> ' ;
            style = 'ShopTableOwned';
        }
        else if (OwnedItems.includes(ItemNumber)) {
            PurchaseButton = ' <button style="color:black" onclick="EquipItem(' + ItemNumber + ')"> OWNED </button> ' ;
            style = 'ShopTableOwned';
        }
        else {
            PurchaseButton = ' <button onclick="BuyItem(' + ItemNumber + ')"> BUY </button> ' ;
        }

        if (ItemNumber < ItemStats.length) {
            Item = [ItemStats[ItemNumber].Name, ItemStats[ItemNumber].Cost, ItemStats[ItemNumber].Damage, PurchaseButton];
        }
        else {
            return ['‎',style]
        }
        
        return [Item[Column], style];
    }
}
function BuyItem(ItemNumber) {
    if (Money >= ItemStats[ItemNumber].Cost) {
        Money = Money - ItemStats[ItemNumber].Cost;
        OwnedItems.push(ItemNumber)
        CurrentWeapon = ItemNumber;
        UpdateShop();
    }
    else {
        alert("Not enough money")
    }

}

function EquipItem(ItemNumber) {
    CurrentWeapon = ItemNumber;
    UpdateShop();
}

function ShopPageNext() {
    if (CurrentPage <= 2) {
        CurrentPage = CurrentPage + 1;
    }
    UpdateShop();
}

function ShopPagePrev() {
    if (CurrentPage > 0) {
        CurrentPage = CurrentPage - 1;
    }
    UpdateShop();
}

function ResetValues() {
    InitialiseEnemy(EnemyNumber)
    CurrentWeapon = 0;
    EnemyNumber = 0;
    AttackLevel = 1
    Money = 200;
    HeroExp = 0;
    HeroMaxHealth = 100;
    HeroHealth = 100;
    HeroDamage = 1;
    ETime = 0;
    PTime = 0;
    paused = false;
    EnemyMaxHealth = 10;
    HeroSpeed = 20;
    OwnedItems = [0];
    UpdateShop();
    showUpdate();
}

