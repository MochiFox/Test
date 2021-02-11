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

var MasteryPage = 0;
var CurrentPage = 0;
var OwnedItems = [0];
var FinalDamage = 0;

var DamageType = 'Physical';
var WeaponType = 0;
var DmgMultiplier = 1;

var ShowStats = false;
var MasteryBuff = 0;
var weaponTypes = ['Sword', "Bow", "Shield", "Staff"];
var DamageContribution = [];

var CritUnlocked = false;
var CritRate = 0.5;
var CritDamage = 2;

var BlockUnlocked = false;
var BlockRate = 0.5;

var GoldUnlocked = false;
var GoldRate = 0.5;
var GoldBoost = 2;

var BuffUnlocked = false;
var activeBuffs = [];
var BuffRate = 1;
var BuffBoost = 1.5;

function DisplayText(Txt) {
    document.getElementById("TestTxt").innerHTML = Txt;
}

var EnemyStats = [];
var ItemStats = [];
var EXPShopDetails = [];
var BoughtStats = [0,0,0];
var MasteryStats = [0,0]; // base damage, % damage, 
var WeaponXP = [0,0,0,0];
var WeaponLevels = [0,0,0,0];

var WeaponLevelDetails = [];
InitialiseConstants();

$(document).ready(function () {
    let units = window.localStorage.getItem('units');
    if (units != null) {
        units = JSON.parse(units);

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
    document.getElementById("DisplayGold").innerHTML = "Gold: " + Money; //
    document.getElementById("DisplayEXP").innerHTML = "Experience: " + HeroEXP;
    document.getElementById("Weapon").innerHTML = "Current Weapon: " + ItemStats[CurrentWeapon].Name + " is dealing " + ItemStats[CurrentWeapon].Damage + ' ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage";
    document.getElementById("Contributions").innerHTML = UpdateContributions();
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
    weaponType = ItemStats[CurrentWeapon].type;
    damage = EnemyDamage - BoughtStats[2] * 0.5;
    if (weaponType == 2){
        damage = damage * 0.9;
    }
    if (damage < 0){
        damage = 0;
    }
    damage = Math.round(damage * 100) / 100
    return damage
}

function calcEnemyReward(){
    weaponType = ItemStats[CurrentWeapon].type;
    unroundgainedHeroXP = EnemyStats[EnemyNumber].EXP;
    unroundgainedMoney = EnemyStats[EnemyNumber].Gold;
    unroundgainedWeaponXP = EnemyStats[EnemyNumber].EXP;
    if (weaponType == 1){ //Bow bonus
        unroundgainedMoney = unroundgainedMoney * 1.1
    }
    if (weaponType == 3){ //Staff bonus
        unroundgainedHeroXP = unroundgainedHeroXP * 1.1
    }


    if (GoldUnlocked == true){
        if (Math.floor(Math.random() * 100) <= GoldRate* 100) {
            diff = (gainedMoney * GoldBoost - gainedMoney)
            diff = Math.round(diff * 100) / 100;
            gainedMoney = gainedMoney * GoldBoost;
            
        }
    }

    
    if (BuffUnlocked == true){
        if (Math.floor(Math.random() * 100) <= BuffRate* 100) {
            if (activeBuffs.length < 3) {
                console.log(activeBuffs);
                activeBuffs.push(50);
            }
            else{
                console.log('activeBuffs');
                activeBuffs.splice(0, 1)
                activeBuffs.push(50);
            }
            
        }
        
    }

    gainedMoney = Math.round(unroundgainedMoney * 100) / 100;
    gainedHeroXP = Math.round(unroundgainedHeroXP * 100) / 100;
    gainedWeaponXP = Math.round(unroundgainedWeaponXP * 100) / 100;

    Money += gainedMoney;
    HeroEXP += gainedHeroXP;
    WeaponXP[ItemStats[CurrentWeapon].type] += gainedWeaponXP;
    ETime = 0;
    PTime = 0;
    EnemyHealth = EnemyMaxHealth;
    UpdateLog(EnemyStats[EnemyNumber].Name + " has died, you gained " + gainedHeroXP + " exp, " + gainedWeaponXP +  " weapon xp and " + gainedMoney + ' gold')

    if (BuffUnlocked == true){UpdateLog('Your staff mastery blesses you with <span style="color:blue"> 5 seconds of ' + BuffBoost + ' damage</span>' )}
    if (GoldUnlocked == true){UpdateLog('Your bow mastery allows you to <span style="color:yellow"> loot ~' + diff + ' gold</span>' )}

}

function getUpdate() {
    //Check if it's time for the enemy to attack
    
    EnemyDamage  = calcEnemyDamage();
    if (ETime >= EnemySpeed) {
        ETime = 0;
        if (BlockUnlocked == true && Math.floor(Math.random() * 100) <= BlockRate* 100){
            UpdateLog('Your shield mastery allows you to <span style="color:purple"> block all damage</span>')
        }
        HeroHealth = HeroHealth - EnemyDamage;
        UpdateLog('You took ' + EnemyDamage + " damage.")
    }

    //Calculate final attack damage
    CalcFinalDamage();

    DisplayStats(ShowStats);

    //Check if its time for players auto-attack
    if (PTime >= HeroSpeed) {
        PTime = 0;
        if (CritUnlocked == true && Math.floor(Math.random() * 100) <= CritRate* 100) {
                EnemyHealth = EnemyHealth - FinalDamage * CritDamage;
                UpdateLog('You attacked for ' + FinalDamage * CritDamage + ' damage with a <span style="color:red"> devastating critical! </span>' )
        }
        else {
            EnemyHealth = EnemyHealth - FinalDamage;
            UpdateLog('You attacked for ' + FinalDamage + " damage.")
        }
        EnemyHealth = Math.round(EnemyHealth * 100) / 100

    }

    //Check if the enemy is dead
    if (EnemyHealth <= 0) {
        calcEnemyReward()
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

    buffsList = '';
    for (i = 0;i < activeBuffs.length; i++){
        buffsList += "Damage buff: " + activeBuffs[i] + '<br>';
        if (activeBuffs[i] > 0){
            activeBuffs[i] -= 1;
        }
        else{
            activeBuffs.splice(i, 1)
        }
    }
    if (activeBuffs.length == 0){
        buffsList = "No active buffs"
    }
    document.getElementById("BuffsList").innerHTML = buffsList;

    WeaponLevels = getAllWeaponLevels();
    UpdateMasteryBar();
    UpdateMasteryList();

}

var CombatLog = ['‏‏‎ ‎','‏‏‎ ‎','‏‏‎ ‎','‏‏‎ ‎','‏‏‎ ‎','‏‏‎ ‎'];
function UpdateLog(NewLine) {
    CombatLog.push(NewLine);
    if (CombatLog.length == 7) {
        CombatLog.shift();
    }
    log = '';
    colors = ['black','black', 'gray','gray', 'white', 'white'];
    for (i = 0; i < CombatLog.length; i++) {
        log += '<p style="color:' + colors[i] + ';">' + CombatLog[i] + '<p>';
    }
        
    document.getElementById("CombatLog").innerHTML = log;
}

function CalcFinalDamage() {
    DamageContribution = []
    weaponBase = ItemStats[CurrentWeapon].Damage;
    weaponType = ItemStats[CurrentWeapon].type;
    DamageContribution.push(("Base weapon damage: " + weaponBase));
    weaponMasteryLevel = WeaponLevels[weaponType];
    
    boughtBonus = BoughtStats[0];
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

    if (weaponType == 0) {
        SwordBonus = 1.1;
        DamageContribution.push("Sword bonus: +10%");
    }

    Buff = (activeBuffs.length + 1) * BuffBoost;
    DamageContribution.push(("Enemy resistance: +" + (DmgMultiplier * 100 - 100) + "%"));
    WeaponMulti =  1 + weaponMasteryLevel * 0.05;
    DamageContribution.push(("Weapon mastery level: +" + (WeaponMulti * 100 - 100)+ '%'));
    unroundFinalDamage = ((weaponBase  * (WeaponMulti) + boughtBonus) * DmgMultiplier) * Buff;
    FinalDamage = Math.round(unroundFinalDamage * 100) / 100
}

var showContributions = false;

function UpdateContributions() {
    output = '';
    if (showContributions == true) {
        for(i=0; i < DamageContribution.length; i++){
            output += DamageContribution[i] + '<br>';
        }
    }
    return output;

}


function ToggleContr() {
    showContributions = !showContributions;
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
        {Name:"Wooden Shield", Cost:5, ImageID:"WoodShield.png", Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:2},
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
        ["+5 base damage", "+20% damage", "-20% attack time", "Chance to deal critical damage"] //sword
    ];

    CurrentPage = 0;

    InitialiseEnemy(EnemyNumber);
    UpdateShops();
    UpdateEXPShop();
    UpdateMasteryList()
    showUpdate();
    UpdateMasteryBar();
}

function getMasteryLevel(lvl){
    levels = [2,5,12,20,30,40,60,80,100];
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

    if (WeaponLevels[0] >= 20){ CritUnlocked = true; }
    else{ CritUnlocked = false; }

    if (WeaponLevels[1] >= 20){ GoldUnlocked = true; }
    else{ GoldUnlocked = false; }

    if (WeaponLevels[2] >= 20){ BlockUnlocked = true; }
    else{ BlockUnlocked = false; }

    if (WeaponLevels[3] >= 20){ BuffUnlocked = true; }
    else{ BuffUnlocked = false; }
}
function UpdateMasteryList(){
    CreateCustomTable(6, 3, 'WeaponMasteryDetails', MasteryDetailsRowFunction);
    document.getElementById("MasteryPage").innerHTML = "<b>" + (MasteryPage + 1) + "</b>" ;
}
UpdateShops();
UpdateEXPShop()
UpdateMasteryList()
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

function MasteryDetailsRowFunction(TableRow, Column){
    levels = [2,5,12,20,30,40,60,80,100];
    weaponType = ItemStats[CurrentWeapon].type;
    if (TableRow == 0) {
        Header = ["Level", "XP", "Bonus"];
        style = 'ShopTableHeader';
        return [Header[Column], style];
    }
    else {
        style = 'ShopTableCells'
        
        BonusNumber = MasteryPage * 5 + TableRow - 1;
        Output = [BonusNumber,'','3']
        Output[2] = '+5% damage';
        Output[1] = ((BonusNumber) ** 2) / 0.2;

        if (WeaponLevels[WeaponType] >= BonusNumber){
            style = 'ShopTableOwned'
        }

        if (levels.includes(BonusNumber)){
            equal = (element) => element == BonusNumber;
            index = levels.findIndex(equal);
            Output[2] += ", " + WeaponLevelDetails[weaponType][index];
        }
        return [Output[Column], style];
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

function MasteryPageNext() {
    if (MasteryPage <= 18) {
        MasteryPage = MasteryPage + 1;
    }
    UpdateMasteryList();
}

function MasteryPagePrev() {
    if (MasteryPage > 0) {
        MasteryPage = MasteryPage - 1;
    }
    UpdateMasteryList();
}

function DisplayStats(Toggle) {
    bonus = BoughtStats;
    stats = [HeroMaxHealth + bonus[1], bonus[0], 1, HeroSpeed, WeaponLevels[0], WeaponLevels[1], WeaponLevels[2], WeaponLevels[3]];
    text = ['Max health: ',  'Base damage: ', 'Level: ', 'Attack speed: ', 'Sword level: ', 'Bow level: ', 'Shield level: ', 'Staff level: '];
    if (CritUnlocked == true){
        text.push("Crit chance: ");
        stats.push(CritRate);
        text.push("Crit multiplier: ");
        stats.push(CritDamage);
    }
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
    activeBuffs = [];
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
    MasteryPage = 0;
    MasteryStats = [0,0];
    UpdateShops();
    UpdateEXPShop()
    showUpdate();
    
}

function Debug() {
    WeaponXP[ItemStats[CurrentWeapon].type] += 1000;
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


