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
    -Weapon mastery

##########################################################*/

var EnemyHealth = 10;
var EnemyDamage = 5;
var EnemyNumber = 0;
var EnemySpeed = 3;
var Money = 200;
var HeroEXP = 0;
var HeroMaxHealth = 100;
var HeroHealth = 100;
var ETime = 0;
var PTime = 0;
var paused = false;
var EnemyMaxHealth = 10;
var HeroSpeed = 20;
var CurrentWeapon = 0;
var CurrentPage = 0;
var OwnedItems = [0];
var FinalDamage = 0;
var CritRate = 0.5;
var DamageType = 'Physical';
var WeaponType = 1;
var DmgMultiplier = 1;
var CritDamage = 2;
var ShowStats = false;
var MasteryBuff = 0;
var weaponTypes = ['Sword', "Bow", "Shield", "Staff"];
function DisplayText(Txt) {
    document.getElementById("TestTxt").innerHTML = Txt;
}

var EnemyStats = [];
var ItemStats = [];
var EXPShopDetails = [];
var BoughtStats = [0,0,0];
var WeaponXP = [0,0,0,0];
var WeaponLevels = [0,0,0,0];
var WeaponLevelDetails = [];
InitialiseConstants();

$(document).ready(function () {
    let units = window.localStorage.getItem('units');
    if (units != null) {
        units = JSON.parse(units);

        EnemyHealth = units['EnemyHealth'];
        EnemyMaxHealth = units['EnemyMaxHealth'];
        HeroMaxHealth = units['HeroMaxHealth'];       
        Money = units['Money'];
        OwnedItems = units['OwnedItems'];
        HeroEXP = units['HeroEXP'];
        BoughtStats = units['BoughtStats'];
        WeaponXP = units['WeaponXP'];
        HeroEXP = units['HeroEXP']
    }
    UpdateShops();
    UpdateEXPShop()
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
                'Money': Money,
                'OwnedItems': OwnedItems,
                'HeroEXP': HeroEXP,
                'WeaponXP': WeaponXP,
                'BoughtStats': BoughtStats
            })
        );
    }, 100);
}); 

function showUpdate() {
    document.getElementById("DisplayEnemyHP").innerHTML = EnemyStats[EnemyNumber].Name +" HP: " + EnemyHealth + "/" + EnemyMaxHealth;
    document.getElementById("DisplayHeroHP").innerHTML = "HP: " + HeroHealth + "/" + HeroMaxHealth;
    document.getElementById("DisplayEnemyDamage").innerHTML = "The enemy is dealing " + EnemyDamage + ' damage every ' + EnemySpeed/10 + ' seconds';
    document.getElementById("DisplayBaseDamage").innerHTML = "Damage: You are dealing " + FinalDamage + ' damage every ' + HeroSpeed/10 + ' seconds';
    document.getElementById("DisplayGold").innerHTML = "Gold: " + Money;
    document.getElementById("DisplayEXP").innerHTML = "Experience: " + HeroEXP;
    document.getElementById("Weapon").innerHTML = "Current Weapon: " + ItemStats[CurrentWeapon].Name + " is dealing " + ItemStats[CurrentWeapon].Damage + ' ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage";
    if (paused == false) {
        document.getElementById("DisplayDead").innerHTML = "<br>";
    }
    else {
        document.getElementById("DisplayDead").innerHTML = "<b> You are dead! </b> Please wait a moment";
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

function calcEnemyDamage() {
    EnemyDamage = EnemyStats[EnemyNumber].Damage;
    damage = EnemyDamage - BoughtStats[2] * 0.5;
    if (damage < 0){
        damage = 0;
    }
    return damage
}
function getUpdate() {
    //Check if it's time for the enemy to attack
    EnemyDamage  = calcEnemyDamage();
    if (ETime >= EnemySpeed) {
        ETime = 0;
        HeroHealth = HeroHealth - EnemyDamage;
        UpdateLog('You took ' + EnemyDamage + " damage.")
    }



    //Calculate final attack damage
    CalcFinalDamage();

    DisplayStats(ShowStats);

    //Check if its time for players auto-attack
    if (PTime >= HeroSpeed) {
        PTime = 0;
        if (Math.floor(Math.random() * 100) <= CritRate* 100) {
            EnemyHealth = EnemyHealth - FinalDamage * CritDamage;
            UpdateLog('You attacked for ' + FinalDamage * CritDamage + ' damage with a <span style="color:red"> devastating critical! </span>' )
        }
        else {
            EnemyHealth = EnemyHealth - FinalDamage;
            UpdateLog('You attacked for ' + FinalDamage + " damage.")
        }
    }

    //Check if the enemy is dead
    if (EnemyHealth <= 0) {
        gainedHeroXP = EnemyStats[EnemyNumber].EXP;
        gainedMoney = EnemyStats[EnemyNumber].Gold;
        gainedWeaponXP = EnemyStats[EnemyNumber].EXP;
        Money += gainedMoney;
        HeroEXP += gainedHeroXP;
        WeaponXP[ItemStats[CurrentWeapon].type] += gainedWeaponXP;
        ETime = 0;
        PTime = 0;
        EnemyHealth = EnemyMaxHealth;
        UpdateLog(EnemyStats[EnemyNumber].Name + " has died, you gained " + gainedHeroXP + " exp, " + gainedWeaponXP +  " weapon xp and " + gainedMoney + ' gold')
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

    WeaponLevels = getAllWeaponLevels();
    UpdateMasteryBar();

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
    WeaponMulti = WeaponLevels[ItemStats[CurrentWeapon].type] * 0.05;
    FinalDamage = ((ItemStats[CurrentWeapon].Damage  * (WeaponMulti + 1) + BoughtStats[0]) * DmgMultiplier);
    FinalDamage = Math.round(FinalDamage * 100) / 100
}

function InitialiseEnemy(ID) {
    EnemyMaxHealth = EnemyStats[ID].Health;
    EnemyHealth = EnemyMaxHealth;
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
    ItemStats = [ //type: 0= Sword, 1= Bow, 2= Shield, 3= Staff
        {Name:"Practice Sword", ImageID:"PracSword.png", Cost:5, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:0},
        {Name:"Wooden Shield", Cost:5, ImageID:"WoodShield.png", Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3},
        {Name:"Bow", ImageID:"PracSword.png", Cost:10, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:1},
        {Name:"Staff", ImageID:"PracSword.png", Cost:10, Health:25, Damage:1, Element:'Fire', Gold:0, Speed:1.1, type:3},
        {Name:"Sword", ImageID:"PracSword.png", Cost:20, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Shield", ImageID:"PracSword.png", Cost:20, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3},
        {Name:"Practice Sword", ImageID:"PracSword.png", Cost:5, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Wooddeld", ImageID:"PracSword.png", Cost:5, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3},
        {Name:"Sharpenedd", ImageID:"PracSword.png", Cost:10, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Reiaed Wooden Shield", ImageID:"PracSword.png", Cost:10, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3},
        {Name:"Swoad", ImageID:"PracSword.png", Cost:20, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Shdld", ImageID:"PracSword.png", Cost:20, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3}
    ];
    
    EXPShopDetails = [
        {Skill:"Damage",Scale:function(lvl) {return (lvl+ 1) * 25},Description:"+1 Base Damage",Effect:function(lvl) {return ('+' + (lvl) + ' Base Damage')}},
        {Skill:"Health",Scale:function(lvl) {return (lvl+ 1) * 10},Description:"+1 HP",Effect:function(lvl) {return ('+' + (lvl) + ' HP')}},
        {Skill:"Block",Scale:function(lvl) {return (lvl+ 1) * 10},Description:"+0.5 Block",Effect:function(lvl) {return ('+' + (lvl)* 0.5 + ' Block')}}
    ];

    WeaponLevelDetails = [
        //Upgrades at level 1,2,3,4,5,7,9,12,15,20,25,30,35,40,50,60,70,80,90,100
        //levels 20, 50 and 100 add new mechanics
        //lvl 20 sword = chance to deal critical damage, lvl 50 = sword crits weaken enemy, lvl 100 = all weapons weaken enemy
        //lvl 20 shield = chance to block damage, lvl 50 = shield has chance to stun enemy, lvl 100 = all weapons stun
        //lvl 20 bow = chance to gain extra gold, lvl 50 = bows inflicts posion, lvl 100 = all weapons inflict poison
        //lvl 20 staff = chance to gain a buff after a kill, lvl 50 = staff can choose element, lvl 100 = all (physical) weapons choose their element
        //innately sword = 10% damage, shield = 10% block, bow = 10% gold, staff = 10% exp
        //levels 2,5,12,20,30,40,60,80,100 add special bonuses
        {SwordBonuses:[]}
    ];

    CurrentPage = 0;

    InitialiseEnemy(EnemyNumber);
    UpdateShops();
    UpdateEXPShop();
    showUpdate();
    UpdateMasteryBar();
}

function getMasteryLevel(lvl){
    levels = [1,2,3,4,5,7,9,12,15,20,25,30,35,40,50,60,70,80,90,100];
    mastery = 0;
    for (i=0; i < levels.length; i++){
        if (lvl >= levels[i]){
            mastery += 1;
        }
    }
    return mastery
}

function getWeaponLevel(xp){
    lvl = ((0.2 * xp) ** 0.5);
    return Math.floor(lvl)
}

function getNextWeaponlevel(xp){
    nextXP = ((getWeaponLevel(xp)+1) ** 2) / 0.2;
    return(nextXP)
}

function getAllWeaponLevels(){
    Levels = [];
    for (i = 0; i < 4; i++){
        level = getWeaponLevel(WeaponXP[i]);
        Levels.push(level);
    }
    return Levels
}

function UpdateShops() {
    CreateCustomTable(7, 6, 'ShopTable', ShopRowFunction);
    document.getElementById("ShopPage").innerHTML = "<b>" + (CurrentPage + 1) + "</b>" ;

}
function UpdateEXPShop() {
    CreateCustomTable(4, 6, 'ExpShopTable', EXPShopRowFunction);
}
function UpdateMasteryBar(){
    CreateCustomTable(5, 5, 'WeaponMastery', MasteryRowFunction);
}
UpdateShops();
UpdateEXPShop()

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
        Header = ['', '<b> Name </b>', "<b> Cost </b>", '<b> Damage </b>', '<b> Type </b>', '<b style="width:100%"> Buy </b>'];
        if ((Column == 0 || Column == 2) || Column == 3 || Column == 4) {
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
            Item = ["<img src='https://mochifox.github.io/Test/Assets/" + ItemStats[ItemNumber].ImageID + "'>", ItemStats[ItemNumber].Name, ItemStats[ItemNumber].Cost, ItemStats[ItemNumber].Damage, weaponTypes[ItemStats[ItemNumber].type], PurchaseButton];
        }
        else {
            return ['‎',style]
        }
        
        return [Item[Column], style];
    }
}

function MasteryRowFunction(TableRow, Column){
    style = 'ShopTableSmall';
    names = weaponTypes;
    num = TableRow - 1;
    if (TableRow == 0) {
        Header = ['Weapon', "Level", "Current XP", "XP to level up", "Effect"];
        if (Column == 1) {
            style = 'ShopTableSmall';
        }
        else {
            style = 'ShopTableHeader';
        }
        return [Header[Column], style];
    }
    else{
        style = 'ShopTableCells';
        Mastery = [names[num],WeaponLevels[num],WeaponXP[num],getNextWeaponlevel(WeaponXP[num])-WeaponXP[num],'+' + (WeaponLevels[num] * 5) + "% " + names[num].toLowerCase() + " damage"];
        return [Mastery[Column], style];
    }
}
function BuyItem(ItemNumber) {
    if (Money >= ItemStats[ItemNumber].Cost) {
        Money = Money - ItemStats[ItemNumber].Cost;
        OwnedItems.push(ItemNumber)
        CurrentWeapon = ItemNumber;
        UpdateShops();
    }
    else {
        alert("Not enough money")
    }

}

function EquipItem(ItemNumber) {
    CurrentWeapon = ItemNumber;
    UpdateShops();
}

function ShopPageNext() {
    if (CurrentPage <= 2) {
        CurrentPage = CurrentPage + 1;
    }
    UpdateShops();
}

function ShopPagePrev() {
    if (CurrentPage > 0) {
        CurrentPage = CurrentPage - 1;
    }
    UpdateShops();
}

function DisplayStats(Toggle) {
    bonus = BoughtStats;
    stats = [HeroMaxHealth + bonus[1], bonus[0], 1, HeroSpeed, WeaponLevels[0], WeaponLevels[1], WeaponLevels[2], WeaponLevels[3]];
    text = ['Max health: ',  'Base damage: ', 'Level: ', 'Attack speed: ', 'Sword level: ', 'Bow level: ', 'Shield level: ', 'Staff level: '];
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
    localStorage.clear();
    InitialiseEnemy(EnemyNumber)
    CurrentWeapon = 0;
    EnemyNumber = 0;
    Money = 200;
    HeroExp = 0;
    HeroMaxHealth = 100;
    HeroHealth = 100;
    ETime = 0;
    PTime = 0;
    paused = false;
    EnemyMaxHealth = 10;
    HeroSpeed = 20;
    OwnedItems = [0];
    HeroEXP = 0;
    BoughtStats = [0,0,0];
    WeaponXP = [0,0,0,0];
    UpdateShops();
    UpdateEXPShop()
    showUpdate();
}

function Debug() {
    WeaponXP[CurrentWeapon.type] += 100;
    HeroEXP += 100;
}

function EXPShopRowFunction(TableRow, Column) {
    if (TableRow == 0) {
        Header = ['<b> Skill </b>', "<b> Cost </b>", '<b> Level <b>', '<b> Description </b>', '<b> Effect <b>', '<b> Buy? <b>'];
        if (Column == 1) {
            style = 'ShopTableSmall';
        }
        else {
            style = 'ShopTableHeader';
        }
        return [Header[Column], style];
    }
    else {
        stat = EXPShopDetails[(TableRow-1)];
        style = 'ShopTableCells';
        level = BoughtStats[(TableRow-1)];
        purchaseSkill = ' <button onclick="BuySkill(' + (TableRow-1) + ')"> BUY </button> ' ;
        Item = [stat.Skill,stat.Scale(level),level,stat.Description,stat.Effect(level),purchaseSkill];
        return [Item[Column], style];
    }
}

function BuySkill(skillNum) {
    stat = EXPShopDetails[skillNum];
    cost = stat.Scale(BoughtStats[skillNum]);
    if (HeroEXP >= cost) {
        HeroEXP -= cost;
        BoughtStats[skillNum] += 1;
    }
    UpdateEXPShop()
}


