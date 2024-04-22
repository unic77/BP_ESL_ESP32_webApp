<script>
    import './gamePage.css'

    /**
     * @type {any[]}
     */
    let arr = [];
    arr.push({name: 'test', work: 'test', money: 0, house: 'test', childeren: 1, device: null});
    arr.push({name: 'test1', work: 'test', money: 0, house: 'test', childeren: 1, device: null});

    let rolled = 0;

    let currentUser= 'test1';

    function nextPlayer(){
        let index = arr.findIndex(player => player.name == currentUser);
        if(index == arr.length - 1){
            currentUser = arr[0].name;
        }
        else{
            currentUser = arr[index + 1].name;
        }
    }

    function rollDice(){
        rolled = Math.floor(Math.random() * 10) + 1;
    }
</script>

<div class="mainDiv">
    <div class="usersDiv">
        {#each arr as player}
            {#if player.name == currentUser}
                <h3 class="collerdH2">{player.name}</h3>
            {:else}
                <h3>{player.name}</h3>
            {/if}
        {/each}
    </div>
    <div class="mainGameDiv">
        <div class="spinner" on:click={() => rollDice()}>
            <h1>click me to roll dice</h1>
            <h4> you rolled: {rolled}</h4>
        </div>
        <button on:click={() => nextPlayer()}>next player</button>
    </div>
</div>