/*##########################################################
  _____ ___  ____   ___    _     ___ ____ _____ 
 |_   _/ _ \|  _ \ / _ \  | |   |_ _/ ___|_   _|
   | || | | | | | | | | | | |    | |\___ \ | |  
   | || |_| | |_| | |_| | | |___ | | ___) || |  
   |_| \___/|____/ \___/  |_____|___|____/ |_|  
                                                
    -Enemy Drops
    -Crafting/Cooking/Alchemy
    -Weapons list
    -Enemy list
    -Enemy drops
    -Crit calculations


##########################################################*/
var EnemyHealth = 10;
var EnemyDamage = 5;
var EnemyNumber = 0;
var EnemySpeed = 3;
var Money = 200;
var HeroExp = 0;
var HeroMaxHealth = 100;
var HeroHealth = 100;
var BaseDamage = 5;
var ETime = 0;
var PTime = 0;
var paused = false;
var EnemyMaxHealth = 10;
var AttackLevel = 1;
var HeroSpeed = 20;
var CurrentWeapon = 0;
var CurrentPage = 0;
var OwnedItems = [0];
var FinalDamage = 0;
var CritRate = 0.5;
var DamageType = 'Physical';
var DmgMultiplier = 1;
var CritDamage = 2;
var ShowStats = false;

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
        BaseDamage = units['BaseDamage'];
        Money = units['Money'];
        EnemyDamage = units['EnemyDamage'];
        EnemySpeed = units['EnemySpeed'];
        ETime = units['ETime'];
        OwnedItems = units['OwnedItems']
    }
    UpdateShop();
    showUpdate();
    //each second
    window.setInterval(function () {
        //set each unit
        showUpdate();
        getUpdate();
        window.localStorage.setItem(
            'units', JSON.stringify({
                'EnemyHealth': EnemyHealth,
                'EnemyMaxHealth': EnemyMaxHealth,
                'HeroMaxHealth': HeroMaxHealth,
                'HeroHealth': HeroHealth,
                'BaseDamage': BaseDamage,
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
    document.getElementById("DisplayBaseDamage").innerHTML = "Level: " + AttackLevel + " You are dealing " + FinalDamage + ' damage every ' + HeroSpeed/10 + ' seconds';
    document.getElementById("DisplayGold").innerHTML = "Gold: " + Money ;
    document.getElementById("UpgradeCost").innerHTML = "Upgrade attack for: " + AttackLevel * 25 ;
    document.getElementById("Weapon").innerHTML = "Current Weapon: " + ItemStats[CurrentWeapon].Name + " is dealing " + ItemStats[CurrentWeapon].Damage + ' ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage";
    if (paused == false) {
        document.getElementById("DisplayDead").innerHTML = " ";
    }
    else {
        document.getElementById("DisplayDead").innerHTML = "*You are dead* Please wait a moment";
    }


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
    if (Money >= AttackLevel * 25) {
        Money = Money - AttackLevel * 25;
        AttackLevel = AttackLevel + 1
        
    }
}

function getUpdate() {
    BaseDamage = AttackLevel;
    //Check if it's time for the enemy to attack
    if (ETime >= EnemySpeed) {
        ETime = 0;
        HeroHealth = HeroHealth - EnemyDamage;
        UpdateLog('You took ' + EnemyDamage + " damage.")
    }

    //Check if the enemy is dead
    if (EnemyHealth <= 0) {
        Money = Money + 5;
        ETime = 0;
        PTime = 0;
        EnemyHealth = EnemyMaxHealth;
        UpdateLog(EnemyStats[EnemyNumber].Name + " has died")
    }

    //Calculate final attack damage
    CalcFinalDamage();

    DisplayStats(ShowStats);

    //Check if its time for players auto-attack
    if (PTime >= HeroSpeed) {
        PTime = 0;
        if (Math.floor(Math.random() * 100) <= CritRate* 100) {
            FinalDamage = FinalDamage * CritDamage;
            EnemyHealth = EnemyHealth - FinalDamage;
            UpdateLog('You attacked for ' + FinalDamage + " damage with a devastating critical!")
        }
        else {
            EnemyHealth = EnemyHealth - FinalDamage;
            UpdateLog('You attacked for ' + FinalDamage + " damage.")
        }
    }

    //Regen health if paused
    if (paused == true) {
        HeroHealth = HeroHealth + HeroMaxHealth/20;
    }
    
    //Handle player death
    if (HeroHealth <= 0) {
        ETime = 0;
        PTime = 0;
        HeroHealth = 0;
        paused = true;
        UpdateLog('You have fallen, please wait until your health has regenerated')
    }

    //Unpause after regen to full
    if (HeroHealth == HeroMaxHealth) {
        paused = false;
    }

    //Increment countdowns
    if (paused == false) {
        ETime = ETime + 1
    }
    if (paused == false) {
        PTime = PTime + 1
    }

}

var CombatLog = ['‏‏‎ ‎','‏‏‎ ‎','‏‏‎ ‎'];
function UpdateLog(NewLine) {
    CombatLog.push(NewLine);
    if (CombatLog.length == 4) {
        CombatLog.shift();
    }
    log = '';
    colors = ['black', 'gray', 'white'];
    for (i = 0; i < CombatLog.length; i++) {
        log += '<p style="color:' + colors[i] + ';">' + CombatLog[i] + '<p>';
    }
        
    document.getElementById("CombatLog").innerHTML = log;
}

function CalcFinalDamage() {
    if (EnemyStats[EnemyNumber].Weak.includes(ItemStats[CurrentWeapon].Element)) {
        document.getElementById("WeakResist").innerHTML = 'The enemy is weak to ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage, resulting in 1.5x damage";
        DmgMultiplier = 1.5;
    }
    else if (EnemyStats[EnemyNumber].Resist.includes(ItemStats[CurrentWeapon].Element)) {
        document.getElementById("WeakResist").innerHTML = 'The enemy is resistant to ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage resulting in 0.5x damage";
        DmgMultiplier = 0.5;
    }
    else {
        document.getElementById("WeakResist").innerHTML = 'The enemy is neutral to ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage resulting in 1x damage";
        DmgMultiplier = 1;
    }
    FinalDamage = (ItemStats[CurrentWeapon].Damage * DmgMultiplier + BaseDamage)
}
function InitialiseEnemy(ID) {
    EnemyMaxHealth = EnemyStats[ID].Health;
    EnemyHealth = EnemyMaxHealth;
    EnemyDamage = EnemyStats[ID].Damage;
    EnemySpeed = EnemyStats[ID].Speed;
}

function InitialiseConstants() {
    EnemyStats = [
        {Name:"Goblin", Health:10, Damage:5, EXP:1, Gold:5, Speed:10, Weak:['Fire', 'Wind'], Resist:['Elec']},
        {Name:"Gnoblin", Health:15, Damage:16, EXP:3, Gold:10, Speed:15, Weak:['Ice'], Resist:['Elec', 'Fire']},
        {Name:"Gnomlin", Health:60, Damage:20, EXP:10, Gold:25, Speed:40, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec', 'Physical']},
        {Name:"Gromlin", Health:20, Damage:2, EXP:25, Gold:45, Speed:1, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec']},
        {Name:"Gremlin", Health:80, Damage:20, EXP:30, Gold:50, Speed:10, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec']},
        {Name:"a", Health:99, Damage:9, EXP:9, Gold:9, Speed:9, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec']}
    ];
    ItemStats = [
        {Name:"Practice Sword", ImageID:"PracSword.png", Cost:5, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9},
        {Name:"Wooden Shield", Cost:5, ImageID:"WoodShield.png", Health:25, Damage:1, Element:'Fire', Gold:0, Speed:1.1},
        {Name:"Sharpened Practice Sword", ImageID:"PracSword.png", Cost:10, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9},
        {Name:"Reinforced Wooden Shield", ImageID:"PracSword.png", Cost:10, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1},
        {Name:"Sword", ImageID:"PracSword.png", Cost:20, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9},
        {Name:"Shield", ImageID:"PracSword.png", Cost:20, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1},
        {Name:"Practice Sword", ImageID:"PracSword.png", Cost:5, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9},
        {Name:"Wooddeld", ImageID:"PracSword.png", Cost:5, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1},
        {Name:"Sharpenedd", ImageID:"PracSword.png", Cost:10, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9},
        {Name:"Reiaed Wooden Shield", ImageID:"PracSword.png", Cost:10, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1},
        {Name:"Swoad", ImageID:"PracSword.png", Cost:20, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9},
        {Name:"Shdld", ImageID:"PracSword.png", Cost:20, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1}
    ];
    
    CurrentPage = 0;

    InitialiseEnemy(EnemyNumber)
    UpdateShop();
    showUpdate();
}

function UpdateShop() {
    CreateCustomTable(7, 5, 'ShopTable', ShopRowFunction);
    document.getElementById("ShopPage").innerHTML = "<b>" + CurrentPage + "</b>" ;

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
        Header = ['', '<b> Name </b>', "<b> Cost </b>", '<b> Damage </b>', '<b style="width:100%"> Buy </b>'];
        if ((Column == 0 || Column == 2) || Column == 3) {
            style = 'ShopTableSmall';
        }
        else {
            style = 'ShopTableHeader';
        }
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
            Item = ["<img src='https://mochifox.github.io/Test/Assets/" + ItemStats[ItemNumber].ImageID + "'>", ItemStats[ItemNumber].Name, ItemStats[ItemNumber].Cost, ItemStats[ItemNumber].Damage, PurchaseButton];
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

function DisplayStats(Toggle) {
    stats = [HeroMaxHealth, BaseDamage, AttackLevel, HeroSpeed, CritRate, CritDamage];
    text = ['Max health: ',  'Base damage: ', 'Level: ', 'Attack speed: ', 'Critical hit chance: ', 'Critical multiplier: '];
    if (Toggle == true) {
        StatsText = '';
        for (i = 0; i < stats.length; i++) {
            StatsText += text[i] + ' ' + stats[i] + '<br>';
        }
    }
    else {
        StatsText = ''
    }
    document.getElementById("Stats").innerHTML = StatsText;
}
function ToggleStats () {
    ShowStats = !ShowStats;
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
    BaseDamage = 1;
    ETime = 0;
    PTime = 0;
    paused = false;
    EnemyMaxHealth = 10;
    HeroSpeed = 20;
    OwnedItems = [0];
    UpdateShop();
    showUpdate();
}

