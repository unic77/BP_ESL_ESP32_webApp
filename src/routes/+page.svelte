<script>
    import Card from './BLECard.svelte';
    import './main.css'
    let deviceName = "ESP32";

    /**
     * @type {any[]}
     */
    let arr = [];

    /**
     * @type {any}
     */
    let rolled;

    /**
     * @type {any}
     */
    var currentPlayer;

    /**
     * @type {number}
     */
    var currentPlayerIndex;

    function isWebBLEAvaible(){
        if(!navigator.bluetooth){
            alert('Web BLE is not supported');
            return false;
        }
        return true;
    }

    function nextPlayer(){
        if(!currentPlayer){
            currentPlayer = arr[0];
            currentPlayerIndex = 0;
        }
        else{
            currentPlayerIndex++;
            if(currentPlayerIndex >= arr.length){
                currentPlayerIndex = 0;
            }
            currentPlayer = arr[currentPlayerIndex];
        }
        rolled = 0;
    }

    function connectRequest(){
        if(!isWebBLEAvaible()){
            return;
        }
        getDeviceInfo();
    }

    function getDeviceInfo(){
        let options = {
            optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'],
            filters: [
                {services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']},
                {namePrefix: deviceName}
            ]
        };

        console.log('Requesting Bluetooth Device...');
        navigator.bluetooth.requestDevice(options).then(async device => {
            console.log('Connecting to GATT Server...');

            if(!arr.find(player => player.device.id === device.id)){
                console.log('Name: ' + device.name);
                
                var player = {
                    device: device,
                    name: null,
                    work: null,
                    money: 400000,
                    house: [],
                    boardPosition: 0,
                    childeren: 1
                }
                arr.push(player);
                arr = arr;
            }
            else{
                console.log('Device already connected');
                window.alert('Device already connected');
            }
        }).catch(error => {
            console.log('Argh! ' + error);
        });

    }  

</script>
<reference types="web-bluetooth" />


<form>
    <button on:click={() => connectRequest()} > connect with BLE device</button>
</form>
<div class="totalBle">
    {#if arr}
        <div class="connectedBle">
                //array mag niet updaten. 
                {#each arr as player}
                    {#if player == currentPlayer}
                        <Card rolled={rolled} player={player}/> 
                    {:else}
                        <Card rolled={0} player={player}/> 
                    {/if}
                {/each}
        </div>

        {#if arr.length >= 2}
            {#if rolled}
                <h3>player: {currentPlayer.name} rolled: {rolled}</h3>
            {/if}
            {#if currentPlayer}
                <button on:click={() =>{rolled = Math.floor(Math.random() * 10)}}>spin for player {currentPlayer.name}</button>
                <button on:click={() => nextPlayer()}>next player</button>
            {:else}
                <button on:click={() => nextPlayer()}>start game</button>
            {/if}
        {:else} 
            <p>connect minumum 2 devices to play</p>    
        {/if}
    {/if}
</div>