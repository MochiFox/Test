
var EnemyHealth = 10;
var EnemyDamage = 5;
var EnemyNumber = 1;
var EnemySpeed = 3;
var Money = 200;
var HeroExp = 0;
var HeroMaxHealth = 100;
var HeroHealth = 100;
var HeroDamage = 5;
var Time = 0;
var paused = false;
var EnemyMaxHealth = 10;
var AttackLevel = 1;

let EnemyStats = [
    {Name:"Goblin", Health:10, Damage:5, EXP:5, Gold:5, Speed:10},
    {Name:"Gnoblin", Health:15, Damage:16, EXP:5, Gold:5, Speed:15},
    {Name:"Gnomlin", Health:5, Damage:5, EXP:5, Gold:5, Speed:5},
    {Name:"Gromlin", Health:5, Damage:8, EXP:5, Gold:5, Speed:8},
    {Name:"Gremlin", Health:7, Damage:7, EXP:7, Gold:7, Speed:7},
    {Name:"a", Health:99, Damage:9, EXP:9, Gold:9, Speed:9}
]

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
        Time = units['Time'];
    }

    showUpdate();
    //each second
    window.setInterval(function () {
        //set each unit
        showUpdate();
        getUpdate();
        HeroDamage = AttackLevel * 5;
        window.localStorage.setItem(
            'units', JSON.stringify({
                'EnemyHealth': EnemyHealth,
                'EnemyMaxHealth': EnemyMaxHealth,
                'HeroMaxHealth': HeroMaxHealth,
                'HeroHealth': HeroHealth,
                'HeroDamage': HeroDamage,
                'Money': Money,
                'EnemyDamage': EnemyDamage,
                'Time': Time,
                'EnemySpeed': EnemySpeed,
                'paused' : paused,
                'AttackLevel': AttackLevel
            })
        );
    }, 100);
}); 

function showUpdate() {
    document.getElementById("DisplayEnemyHP").innerHTML = EnemyStats[EnemyNumber].Name +" HP: " + EnemyHealth + "/" + EnemyMaxHealth;
    document.getElementById("DisplayHeroHP").innerHTML = "HP: " + HeroHealth + "/" + HeroMaxHealth;
    document.getElementById("DisplayEnemyDamage").innerHTML = "The enemy is dealing " + EnemyDamage + ' damage every ' + EnemySpeed/10 + ' seconds';
    document.getElementById("DisplayHeroDamage").innerHTML = "Level: " + AttackLevel + " You're damage: " + HeroDamage;
    document.getElementById("DisplayGold").innerHTML = "Gold: " + Money ;
    document.getElementById("UpgradeCost").innerHTML = "Costs: " + AttackLevel * 2 ;
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
        EnemyHealth = EnemyHealth - HeroDamage;
        if (EnemyHealth <= 0) {
            Money = Money + 5;
            Time = 0;
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
            Time = 0;
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
            Time = 0;
        }
        else {
            EnemyNumber = 0;
        }
    }
    showUpdate();
}

function UpgradeAttack() {
    if (Money >= AttackLevel * 2) {
        Money = Money - AttackLevel * 2;
        AttackLevel = AttackLevel + 1
    }
}
function getUpdate() {
    if (Time >= EnemySpeed) {
        Time = 0
        HeroHealth = HeroHealth - EnemyDamage
    }

    if (paused == true) {
        HeroHealth = HeroHealth + HeroMaxHealth/20
    }
    
    if (HeroHealth <= 0) {
        Time = 0
        HeroHealth = 0;
        paused = true;
    }
    if (HeroHealth == HeroMaxHealth) {
        paused = false;
    }
    if (paused == false) {
        Time = Time + 1
    }

}

function InitialiseEnemy(ID) {
    EnemyMaxHealth = EnemyStats[ID].Health;
    EnemyHealth = EnemyMaxHealth;
    EnemyDamage = EnemyStats[ID].Damage;
    EnemySpeed = EnemyStats[ID].Speed;
}

function Initialise() {
    EnemyHealth = 10;
    EnemyDamage = 5;
    EnemyNumber = 1;
    EnemySpeed = 3;
    AttackLevel = 1
    Money = 200;
    HeroExp = 0;
    HeroMaxHealth = 100;
    HeroHealth = 100;
    HeroDamage = 5;
    Time = 0;
    paused = false;
    EnemyMaxHealth = 10;
   
    EnemyStats = [
        {Name:"Glitch1", Health:1, Damage:1, EXP:1, Gold:1, Speed:1},
        {Name:"Goblin", Health:10, Damage:5, EXP:5, Gold:5, Speed:10},
        {Name:"Gnoblin", Health:15, Damage:16, EXP:5, Gold:5, Speed:15},
        {Name:"Gnomlin", Health:5, Damage:5, EXP:5, Gold:5, Speed:5},
        {Name:"Gromlin", Health:5, Damage:8, EXP:5, Gold:5, Speed:8},
        {Name:"Gremlin", Health:7, Damage:7, EXP:7, Gold:7, Speed:7},
        {Name:"a", Health:99, Damage:9, EXP:9, Gold:9, Speed:9},
        {Name:"Glitch2", Health:1, Damage:1, EXP:1, Gold:1, Speed:1}
    ]
    showUpdate();
}