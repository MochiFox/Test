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
    -random enemy pool

     
    -enemy ideas:
    -high defense = use poison
    -low health/defense + very high attack + low speed = use shield
    -high health = use sword
    -high health + elemental affinity = use staff
##########################################################*/

var EnemyHealth = 10;
var EnemyDamage = 5;
var EnemyNumber = 0;
var EnemySpeed = 3;
var Money = 200;
var HeroEXP = 0;
var HeroMaxHealth = 1000;
var HeroHealth = 1000;
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
var weaponTypes = ['Melee', "Ranged", "Defensive", "Magic"];
var weaponColors =['red','green','purple','blue']
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
var StatShopStats = [1,1,0.5]

var WeaponLevelDetails = [];
InitialiseConstants();
InitialiseEnemy(EnemyNumber)

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


setInterval(function(){ 
    if (paused == false) {
        ETime = ETime + 1;
    }
    if (paused == false) {
        PTime = PTime + 1;
    }
}, 10);
    



function showUpdate() {
    document.getElementById("DisplayEnemyHP").innerHTML = '<div class="toolTarget">' + EnemyStats[EnemyNumber].Name  + '<span class="toolHover">' + EnemyStats[EnemyNumber].Flavour + '</span> </div>' +" &nbsp HP: " + EnemyHealth/10 + "/" + EnemyStats[EnemyNumber].Health/10;
    document.getElementById("DisplayHeroHP").innerHTML = "HP: " + HeroHealth/10 + "/" + HeroMaxHealth/10;
    document.getElementById("DisplayEnemyDamage").innerHTML = "The enemy is dealing " + EnemyDamage/10 + ' damage every ' + EnemySpeed/100 + ' seconds';
    document.getElementById("DisplayBaseDamage").innerHTML = "Damage: You are dealing " + FinalDamage/10 + ' damage every ' + HeroSpeed/100 + ' seconds';
    document.getElementById("DisplayGold").innerHTML = "Gold: " + Money/10; //
    document.getElementById("DisplayEXP").innerHTML = "Experience: " + HeroEXP / 10;
    document.getElementById("Weapon").innerHTML = "Current Weapon: " + ItemStats[CurrentWeapon].Name + " is dealing " + ItemStats[CurrentWeapon].Damage / 10 + ' ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage";
    document.getElementById("Contributions").innerHTML = UpdateContributions();

    document.getElementById("currentWeapon").innerHTML = "Weapon mastery for: <span style='color:" + weaponColors[ItemStats[CurrentWeapon].type] + "'>" + weaponTypes[ItemStats[CurrentWeapon].type] + "</span> type weapons";
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
            displayNextLastEnemy()
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
            displayNextLastEnemy()
            
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
    damage = EnemyDamage - (BoughtStats[2]*10) * 0.5;
    if (weaponType == 2){
        damage = damage * 0.9;
    }
    if (damage < 0){
        damage = 0;
    }
    damage = Math.round(damage);
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
            diff = (unroundgainedMoney * GoldBoost - unroundgainedMoney)
            diff = Math.round(diff);
            unroundgainedMoney = unroundgainedMoney * GoldBoost;
            
        }
    }

    
    if (BuffUnlocked == true){
        if (Math.floor(Math.random() * 100) <= BuffRate* 100) {
            if (activeBuffs.length < 3) {
                activeBuffs.push(50);
            }
            else{
                activeBuffs.splice(0, 1)
                activeBuffs.push(50);
            }
            
        }
        
    }

    gainedMoney = Math.round(unroundgainedMoney);
    gainedHeroXP = Math.round(unroundgainedHeroXP);
    gainedWeaponXP = Math.round(unroundgainedWeaponXP);

    Money += gainedMoney;
    HeroEXP += gainedHeroXP;
    WeaponXP[ItemStats[CurrentWeapon].type] += gainedWeaponXP;
    ETime = 0;
    PTime = 0;
    EnemyHealth = EnemyMaxHealth;
    UpdateLog(EnemyStats[EnemyNumber].Name + " has died, you gained " + gainedHeroXP / 10 + " exp, " + gainedWeaponXP /10 +  " weapon xp and " + gainedMoney / 10 + ' gold')

    if (BuffUnlocked == true){UpdateLog('Your staff mastery blesses you with <span style="color:blue"> 5 seconds of ' + BuffBoost + ' damage</span>' )}
    if (GoldUnlocked == true){UpdateLog('Your bow mastery allows you to <span style="color:yellow"> loot ' + diff /10+ ' gold</span>' )}

}

function getUpdate() {
    //Check if it's time for the enemy to attack
    
    UpdateMasteryBonuses()

    EnemyDamage  = calcEnemyDamage();
    if (ETime >= EnemySpeed) {
        ETime = 0;
        if (BlockUnlocked == true && Math.floor(Math.random() * 100) <= BlockRate* 100){
            UpdateLog('Your shield mastery allows you to <span style="color:purple"> block all damage</span>')
        }
        if (CurrentWeapon == 2){
            EnemyDamage = EnemyDamage * 0.9
        }
        HeroHealth = HeroHealth - EnemyDamage;
        UpdateLog('You took ' + EnemyDamage /10 + " damage.")
    }

    //Calculate final attack damage
    CalcFinalDamage();

    DisplayStats(ShowStats);

    //Check if its time for players auto-attack
    if (PTime >= HeroSpeed) {
        PTime = 0;
        if (CritUnlocked == true && Math.floor(Math.random() * 100) <= CritRate* 100) {
                EnemyHealth = EnemyHealth - FinalDamage * CritDamage;
                UpdateLog('You attacked for ' + FinalDamage * CritDamage / 10 + ' damage with a <span style="color:red"> devastating critical! </span>' )
        }
        else {
            EnemyHealth = EnemyHealth - FinalDamage;
            UpdateLog('You attacked for ' + FinalDamage / 10 + " damage.")
        }
        EnemyHealth = Math.round(EnemyHealth);

    }

    //Check if the enemy is dead
    if (EnemyHealth <= 0) {
        calcEnemyReward()
        InitialiseEnemy(EnemyNumber)
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
    boughtBonus = (BoughtStats[0] * 10);
    weaponBase = ItemStats[CurrentWeapon].Damage;
    weaponType = ItemStats[CurrentWeapon].type;
    DamageContribution.push(("Base level damage: " + boughtBonus/10));
    DamageContribution.push(("Base weapon damage: " + weaponBase/10));
    weaponMasteryLevel = WeaponLevels[weaponType];
    
    
    if (EnemyStats[EnemyNumber].Weak.includes(ItemStats[CurrentWeapon].Element)) {
        document.getElementById("WeakResist").innerHTML = 'The enemy is weak to ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage, resulting in 1.5x damage";
        DmgMultiplier = 1.5;
        dmgMultText = "+" + Math.round(DmgMultiplier * 100 - 100);
    }
    else if (EnemyStats[EnemyNumber].Resist.includes(ItemStats[CurrentWeapon].Element)) {
        document.getElementById("WeakResist").innerHTML = 'The enemy is resistant to ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage resulting in 0.5x damage";
        DmgMultiplier = 0.5;
        dmgMultText = Math.round(DmgMultiplier * 100 - 100);
    }
    else {
        document.getElementById("WeakResist").innerHTML = 'The enemy is neutral to ' + ItemStats[CurrentWeapon].Element.toLowerCase() + " damage resulting in 1x damage";
        DmgMultiplier = 1;
        dmgMultText = "+" + Math.round(DmgMultiplier * 100 - 100);
    }

    if (weaponType == 0) {
        SwordLvlBonus = 1.1;
        DamageContribution.push("Sword bonus: x" + SwordLvlBonus);
    }
    else {
        SwordLvlBonus = 1;
    }


    Buff = ((activeBuffs.length) * BuffBoost) + 1;
    DamageContribution.push(("Enemy resistance: " + dmgMultText + "%"));
    WeaponMulti =  1 + weaponMasteryLevel * 0.05;
    DamageContribution.push(("Weapon mastery level: +" + Math.round(WeaponMulti * 100 - 100)+ '%'));
    unroundFinalDamage = ((weaponBase  * (WeaponMulti) + boughtBonus) * DmgMultiplier * SwordLvlBonus) * Buff;
    FinalDamage = Math.round(unroundFinalDamage);
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
        {Name:"Imaginary Rat", Flavour:"I guess you could call that training", boss: false, Health:50, Damage:10, EXP:100, Gold:0, Speed:200, Weak:['Fire', 'Wind'], Resist:['Elec']},
        {Name:"Imaginary Snake", Flavour:"Not quite as scary as a real one", boss: false, Health:150, Damage:50, EXP:300, Gold:0, Speed:150, Weak:['Ice'], Resist:['Elec', 'Fire']},
        {Name:"Imaginary Boar", Flavour:"Tastes like air", boss: false,Health:350, Damage:300, EXP:1000, Gold:0, Speed:500, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec', 'Physical']},
        {Name:"Imaginary Goblin", Flavour:"It's here to steal your money, at least if it was real", boss: false,Health:800, Damage:200, EXP:2500, Gold:0, Speed:100, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec']},
        {Name:"Imaginary Goblin leader", Flavour:"They look like your old maths teacher", boss: true,Health:2000, Damage:700, EXP:30, Gold:0, Speed:500, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec']},
        {Name:"rat", Flavour:"Just clearing out the basement", boss: false,Health:990, Damage:90, EXP:9, Gold:9, Speed:9, Weak:['Fire', 'Ice', 'Wind'], Resist:['Elec']}
    ];
    ItemStats = [ //type: 0= Sword, 1= Bow, 2= Shield, 3= Staff
        {Name:"Foam sword", Flavour:"You really think this will work?", ImageID:"PracSword.png", Cost:1000, Health:0, Damage:10, Element:'Physical', Gold:0, Speed:300, type:0},
        {Name:"Wooden plank", Flavour:"Barely sturdy enough to block a punch", Cost:1000, ImageID:"WoodShield.png", Health:250, Damage:20, Element:'Physical', Gold:0, Speed:300, type:2},
        {Name:"Rubber band", Flavour:"A favourite in classroom warfare", ImageID:"PracSword.png", Cost:1000, Health:0, Damage:20, Element:'Physical', Gold:0, Speed:200, type:1},
        {Name:"Enclyopedia", Flavour:"All that knowledge makes a great bludgeon", ImageID:"PracSword.png", Cost:1000, Health:0, Damage:20, Element:'Physical', Gold:0, Speed:400, type:3},
        {Name:"Sword", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:200, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Shield", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:200, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3},
        {Name:"Practice Sword", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:50, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Wooddeld", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:50, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3},
        {Name:"Sharpenedd", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:10, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Reiaed Wooden Shield", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:10, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3},
        {Name:"Swoad", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:20, Health:5, Damage:5, Element:'Physical', Gold:0, Speed:0.9, type:3},
        {Name:"Shdld", Flavour:"PLACEHOLDER", ImageID:"PracSword.png", Cost:20, Health:25, Damage:1, Element:'Physical', Gold:0, Speed:1.1, type:3}
    ];
    
    EXPShopDetails = [
        {Skill:"Damage",Scale:function(lvl) {return (lvl+ 1) * 250},Description:"+" + StatShopStats[0] + " Base Damage",Effect:function(lvl) {return ('+' + (lvl) + ' Base Damage')}},
        {Skill:"Health",Scale:function(lvl) {return (lvl+ 1) * 10},Description:"+" + StatShopStats[1] + "  HP",Effect:function(lvl) {return ('+' + (lvl) + ' HP')}},
        {Skill:"Block",Scale:function(lvl) {return (lvl+ 1) * 10},Description:"+" + StatShopStats[2] + " Block",Effect:function(lvl) {return ('+' + (lvl)* 0.5 + ' Block')}}
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
        ["+10 base damage", "+10% damage", "-10% attack time", "Chance to deal critical damage"], //sword
        ["-10% attack time", "+10% gold", "+10% damage", "Chance to deal inflict poison"], //Bow
        ["+5 base damage", "+10% weapon exp", "-10% attack time", "Chance to deal block damage"], //Shield
        ["+10% hero exp", "+10% damage", "+10% hero exp", "Chance to deal gain a damage buff on kill"] //Staff

        [[0,5],[1,20],[2,20],[]] //sword
    ];

    WeaponLevelStats = [
        //levels that are multiples of 5 get a bonus
        //first number = type of bonus, 2nd is amount
        //0 = base dmg, 1 = % dmg, 2 = attack time, 3 = gold, 4 = hero exp, 5 = weapon exp, 6 = critical chance, 7 = stats shop base damage, 99 = text
        [[99, "1.1x damage"],[0,5],[7,1],[2,20],[99, "Chance to deal critical damage"],[1,5]], //sword
        [[99, "1.1x gold"],[0,5],[1,25],[2,10],[1,5]], //bow
        [[99, "0.9x enemy damage"],[0,5],[1,25],[2,20],[1,5]], //Shield
        [[99, "1.1x exp"],[0,5],[1,25],[2,20],[1,5]] //Staff
    ];

    CurrentPage = 0;

    InitialiseEnemy(EnemyNumber);
    UpdateShops();
    UpdateEXPShop();
    UpdateMasteryList()
    showUpdate();
    UpdateMasteryBar();
    HeroSpeed = ItemStats[CurrentWeapon].Speed
    HeroMaxHealth = 1000 + ItemStats[CurrentWeapon].Health + BoughtStats[1] * 10
    displayNextLastEnemy()
}

function displayNextLastEnemy(){
    if (EnemyNumber < EnemyStats.length - 1){
        next = EnemyStats[EnemyNumber + 1].Name
    }
    else{
        next ="Nothing here"
    }
    if (EnemyNumber > 0 ){
        last = EnemyStats[EnemyNumber - 1].Name
    }
    else{
        last ="Nothing here"
    }
    document.getElementById("lastEnemyName").innerHTML = last
    document.getElementById("nextEnemyName").innerHTML = next
}
function CreateMasteryText(type, amount){
    if (type == 0){
        return ("+" + amount + " base damage");
    }
    else if (type == 1){
        return ("+" + amount + "% damage");
    }
    else if (type == 2){
        return ("+" + amount + "% attack speed");
    }
    else if (type == 3){
        return ("+" + amount + "% gold");
    }
    else if (type == 4){ 
        return ("+" + amount + "% hero exp");
    }
    else if (type == 5){
        return ("+" + amount + "% weapon exp");
    }
    else if (type == 6){
        return ("+" + amount + "% critical chance");
    }
    else if (type == 7){
        return ("+" + amount + " Stats Shop Base damage");
    }
    else if (type == 99){
        return (amount);
    }
}

function UpdateMasteryBonuses() {
    swordBonus = WeaponLevelStats[0];
    bowBonus = WeaponLevelStats[1];
    shieldBonus = WeaponLevelStats[2];
    staffBonus = WeaponLevelStats[3];
    
    finalBonus = [0,0,0,0,0,0,0,0,0,0,0]
    swordLvl = getMasteryLevel(WeaponLevels[0]);
    bowLvl = getMasteryLevel(WeaponLevels[1]);
    shieldLvl = getMasteryLevel(WeaponLevels[2]);
    staffLvl = getMasteryLevel(WeaponLevels[3]);
    
    for (i=0; i < swordLvl;i++){
        if (swordBonus[i][0] != 99){
            finalBonus.splice(swordBonus[i][0], 1, finalBonus[swordBonus[i][0]] + swordBonus[i][1])
        }
    }
    for (i=0; i < bowLvl;i++){
        if (bowBonus[i][0] != 99){
            finalBonus.splice(bowBonus[i][0], 1, finalBonus[bowBonus[i][0]] + bowBonus[i][1])
        }
    }
    for (i=0; i < shieldLvl;i++){
        if (shieldBonus[i][0] != 99){
            finalBonus.splice(shieldBonus[i][0], 1, finalBonus[shieldBonus[i][0]] + shieldBonus[i][1])
        }
    }
    for (i=0; i < staffLvl;i++){
        if (staffBonus[i][0] != 99){
            finalBonus.splice(staffBonus[i][0], 1, finalBonus[staffBonus[i][0]] + staffBonus[i][1])
        }
    }
    
    MasteryStats = finalBonus
}

function getMasteryLevel(lvl){
    mastery = Math.floor(lvl / 5);
    return mastery
}

function getWeaponLevel(xp){
    lvl = ((0.02 * xp) ** 0.5);
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
        Name = '<div class="toolTarget">' + ItemStats[ItemNumber].Name  + '<span class="toolHover">' + ItemStats[ItemNumber].Flavour + '</span> </div>'

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
            Item = ["<img src='https://mochifox.github.io/Test/Assets/" + ItemStats[ItemNumber].ImageID + "'>", Name, ItemStats[ItemNumber].Cost / 10, ItemStats[ItemNumber].Damage / 10, weaponTypes[ItemStats[ItemNumber].type], PurchaseButton];
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
        Mastery = [names[num],WeaponLevels[num],WeaponXP[num] / 10,getNextWeaponlevel(WeaponXP[num])-WeaponXP[num] / 10,'+' + (WeaponLevels[num] * 5) + "% " + names[num].toLowerCase() + " damage"];
        return [Mastery[Column], style];
    }
}

function MasteryDetailsRowFunction(TableRow, Column){
    specialLevels = [20,50,100]
    currentWeaponType = ItemStats[CurrentWeapon].type;
    if (TableRow == 0) {
        Header = ["Level", "XP", "Bonus"];
        style = 'ShopTableHeader';
        return [Header[Column], style];
    }
    else {
        style = 'ShopTableCells'
        
        BonusNumber = MasteryPage * 5 + TableRow - 1;
        Output = [BonusNumber,'','']
        if (BonusNumber != 0) {
            Output[2] = '+5% damage';
        }
        Output[1] = ((BonusNumber) ** 2) / 0.2;
        
        if (specialLevels.includes(BonusNumber)){
            style = 'ShopTableSpecial'
        }

        if (WeaponLevels[currentWeaponType] >= BonusNumber){
            style = 'ShopTableOwned'
        }

        if ((BonusNumber % 5) == 0){
            //equal = (element) => element == BonusNumber; WTF is this?????
            index = Math.floor(BonusNumber / 5);
            stat = WeaponLevelStats[currentWeaponType][index]
            if (BonusNumber != 0) {
                Output[2] += ", " + CreateMasteryText(stat[0],stat[1]);  //CreateMasteryText(WeaponLevelStats[weaponType][index])
            }
            else {
                Output[2] += CreateMasteryText(stat[0],stat[1]);
            }
        }


        return [Output[Column], style];
    }
}

function BuyItem(ItemNumber) {
    if (Money >= ItemStats[ItemNumber].Cost) {
        Money = Money - ItemStats[ItemNumber].Cost;
        OwnedItems.push(ItemNumber)
        EquipItem(ItemNumber)
        UpdateShops();
    }
    else {
        alert("Not enough money")
    }

}

function EquipItem(ItemNumber) {

    CurrentWeapon = ItemNumber;
    UpdateShops();
    HeroSpeed = ItemStats[CurrentWeapon].Speed
    HeroMaxHealth = 1000 + ItemStats[CurrentWeapon].Health + BoughtStats[1] * 10
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
    bonus = [BoughtStats];
    stats = [(HeroMaxHealth + (bonus[1]*10))/10, bonus[0], 1, HeroSpeed, WeaponLevels[0], WeaponLevels[1], WeaponLevels[2], WeaponLevels[3]];
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
    HeroMaxHealth = 1000;
    HeroHealth = 1000;
    ETime = 0;
    PTime = 0;
    paused = false;
    EnemyMaxHealth = 10;
    HeroSpeed = 300;
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
    Money = 1000
    HeroEXP += 10000;

}

function instakill() {
    EnemyHealth = 0
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
        Item = [stat.Skill,stat.Scale(level)/10,level,stat.Description,stat.Effect(level),purchaseSkill];
        return [Item[Column], style];
    }
}

function BuySkill(skillNum) {
    statDetails = EXPShopDetails[skillNum];
    upgradeCost = statDetails.Scale(BoughtStats[skillNum]);
    if (HeroEXP >= upgradeCost) {
        HeroEXP -= upgradeCost;
        BoughtStats[skillNum] += 1;
    }
    HeroMaxHealth = 1000 + ItemStats[CurrentWeapon].Health + BoughtStats[1] * 10
    UpdateEXPShop()
}


