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
                'EnemySpeed': EnemySpeed
            })
        );
    }, 1000);
});

function showUpdate() {
    document.getElementById("1").innerHTML = "Enemy HP: " + EnemyHealth;
    document.getElementById("2").innerHTML = "HP: " + HeroHealth + "/" + HeroMaxHealth;
    document.getElementById("3").innerHTML = "The enemy is dealing " + EnemyDamage + ' every ' + EnemySpeed + ' second';
    document.getElementById("4").innerHTML = "You're damage: " + HeroDamage;
    document.getElementById("5").innerHTML = "Gold: " + Money;

}
//functions for the units
//a is one more for each click
function getEnemyHP() {
    EnemyHealth = EnemyHealth - HeroDamage;
    if (EnemyHealth <= 0) {
        Money = Money + 5;
        EnemyHealth = 10
    }
    showUpdate();
}

function getUpdate() {
    if (Time >= EnemySpeed) {
        Time = 0
        HeroHealth = HeroHealth - EnemyDamage
    }
    Time = Time + 1
}

function Initialise() {
    EnemyHealth = 10;
    EnemyDamage = 5;
    EnemyNumber = 0;
    EnemySpeed = 3;
    Turn = 0;
    Money = 200;
    HeroExp = 0;
    HeroMaxHealth = 100;
    HeroHealth = 100;
    HeroDamage = 5;
    Time = 0;
    showUpdate();
}