
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
var idk = ''

function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("TestTxt").innerHTML = this.responseText;
      }
    };
    xhttp.open("GET", "https://mochifox.github.io/Test/Enemies.json", true);
    xhttp.send();
  }

/*function DisplayText(Txt) {
    document.getElementById("TestTxt").innerHTML = Txt
}
loadDoc()
DisplayText(idk);
*/

/*let EnemyStats = [
    {Name:"Goblin", Health:10, Damage:5, EXP:1, Gold:5, Speed:10},
    {Name:"Gnoblin", Health:15, Damage:16, EXP:3, Gold:10, Speed:15},
    {Name:"Gnomlin", Health:60, Damage:20, EXP:10, Gold:25, Speed:40},
    {Name:"Gromlin", Health:20, Damage:2, EXP:25, Gold:45, Speed:1},
    {Name:"Gremlin", Health:80, Damage:20, EXP:30, Gold:50, Speed:10},
    {Name:"a", Health:99, Damage:9, EXP:9, Gold:9, Speed:9}
]*/

let ItemStats = [
    {Name:"Practice Sword", Health:5, Damage:5, EXP:0, Gold:0, Speed:0.9},
    {Name:"Wooden Shield", Health:25, Damage:1, EXP:0, Gold:0, Speed:1.1},
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
                'AttackLevel': AttackLevel
            })
        );
    }, 100);
}); 

function showUpdate() {
    document.getElementById("DisplayEnemyHP").innerHTML = EnemyStats[EnemyNumber].Name +" HP: " + EnemyHealth + "/" + EnemyMaxHealth;
    document.getElementById("DisplayHeroHP").innerHTML = "HP: " + HeroHealth + "/" + HeroMaxHealth;
    document.getElementById("DisplayEnemyDamage").innerHTML = "The enemy is dealing " + EnemyDamage + ' damage every ' + EnemySpeed/10 + ' seconds';
    document.getElementById("DisplayHeroDamage").innerHTML = "Level: " + AttackLevel + " You are dealing " + HeroDamage + ' damage every ' + HeroSpeed/10 + ' seconds';
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
        EnemyHealth = EnemyHealth - HeroDamage;
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

function Initialise() {

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
    EnemyStats = [
        {Name:"Goblin", Health:10, Damage:5, EXP:1, Gold:5, Speed:10},
        {Name:"Gnoblin", Health:15, Damage:16, EXP:3, Gold:10, Speed:15},
        {Name:"Gnomlin", Health:60, Damage:20, EXP:10, Gold:25, Speed:40},
        {Name:"Gromlin", Health:20, Damage:2, EXP:25, Gold:45, Speed:1},
        {Name:"Gremlin", Health:80, Damage:20, EXP:30, Gold:50, Speed:10},
        {Name:"a", Health:99, Damage:9, EXP:9, Gold:9, Speed:9}
    ];
    InitialiseEnemy(EnemyNumber)
    showUpdate();
}