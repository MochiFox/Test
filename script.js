//letiables for each unit
var EnemyHealth = 10;
var EnemyDamage = 5;
var EnemyNumber = 0;
var EnemySpeed = 3;
var Money = 200;
var HeroExp = 0;
var HeroMaxHealth = 100;
var HeroHealth = 100;
var HeroDamage = 5;
var Time = 0;
var paused = false;

let EnemyStats = {
    1:["Goblin",10, 5, 5,], //10 health, 5 damage, 5 exp reward
    2:["Gnoblin",20, 8, 10,] //10 health, 5 damage, 5 exp reward
}

$(document).ready(function () {
    let units = window.localStorage.getItem('units');
    if (units != null) {
        units = JSON.parse(units);

        EnemyHealth = units['EnemyHealth'];
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
        window.localStorage.setItem(
            'units', JSON.stringify({
                'EnemyHealth': EnemyHealth,
                'HeroMaxHealth': HeroMaxHealth,
                'HeroHealth': HeroHealth,
                'HeroDamage': HeroDamage,
                'Money': Money,
                'EnemyDamage': EnemyDamage,
                'Time': Time,
                'EnemySpeed': EnemySpeed,
                'paused' : paused
            })
        );
    }, 100);
}); 

function showUpdate() {
    document.getElementById("DisplayEnemyHP").innerHTML = "Enemy HP: " + EnemyHealth;
    document.getElementById("DisplayHeroHP").innerHTML = "HP: " + HeroHealth + "/" + HeroMaxHealth;
    document.getElementById("DisplayEnemyDamage").innerHTML = "The enemy is dealing " + EnemyDamage + ' damage every ' + EnemySpeed/10 + ' seconds';
    document.getElementById("DisplayHeroDamage").innerHTML = "You're damage: " + HeroDamage;
    document.getElementById("DisplayGold").innerHTML = "Gold: " + Money;
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
            EnemyHealth = 10
        }
    }
    showUpdate();
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

function Initialise() {
    EnemyHealth = 10;
    EnemyDamage = 10;
    EnemyNumber = 0;
    EnemySpeed = 1;
    Turn = 0;
    Money = 200;
    HeroExp = 0;
    HeroMaxHealth = 100;
    HeroHealth = 100;
    HeroDamage = 5;
    Time = 0;
    paused = false;
    showUpdate();
}
