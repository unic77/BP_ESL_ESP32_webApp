<script>
    import Card from './BLECard.svelte';
    import './main.css'
    import {setHouseBought, setCarriereChosen} from '../DBConnection.js';

    let deviceName = "ESP32";

    /**
     * @type {any[]}
     */
    let arr = [];
    $: currentPlayer = arr[0];

    let updatePosition = false;

    /**
     * @type {number}
     */
    let amountOfPlayersEnded = 0;

    /**
     * @type {any}
     */
    let rolled = 0;

    /**
     * @type {any}
     */
    var currentPlayer;

    /**
     * @type {number}
     */
    var currentPlayerIndex = 0;

    function isWebBLEAvaible(){
        if(!navigator.bluetooth){
            alert('Web BLE is not supported');
            return false;
        }
        return true;
    }

    function nextPlayer(){
        rolled = 0;
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
                    childeren: 1,
                    amountOfWildCards: 0,
                }
                console.log(player);
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
    
    function rollrandom(){
        updatePosition = true;
        rolled = Math.floor(Math.random() * 4)+1;
    }

    /**
     * @param {any} player
     */
    function endPlayer(player){
        amountOfPlayersEnded++;
        console.log('player ended: ' + player.name);
        switch(amountOfPlayersEnded){
            case 1:
                player.money = player.money + 800000;
                alert('player: ' + player.name + ' engdigt eerst en krijgt 800000$');
            break;

            case 2:
                player.money = player.money + 600000;
                alert('player: ' + player.name + ' engdigt tweede en krijgt 600000$');
                if(amountOfPlayersEnded >= arr.length){
                    calculateWinner();
                }
            break;

            case 3:
                player.money = player.money + 400000;
                alert('player: ' + player.name + ' engdigt derde en krijgt 400000$');
                if(amountOfPlayersEnded >= arr.length){
                    calculateWinner();
                }
            break;

            case 4:
                player.money = player.money + 200000;
                alert('player: ' + player.name + ' engdigt vierde en krijgt 200000$');
                calculateWinner();
            break;
        }
    
    }

    function calculateWinner(){
        console.log("players: ");
        console.log(arr);
        console.log("amount of ended players: "+ amountOfPlayersEnded);
        let winner = arr[0];
        arr.forEach(player => {
            if(player.money > winner.money){
                winner = player;
            }
        });

        console.log('winner is: ' + winner.name);
        alert('winner is: ' + winner.name);
        alert("restart the browser to play again");
    }

    /**
     * @param {any} event
     */
    function beforeUnload(event){

        event.preventDefault();
        event.returnValue = '';

        //update db
        arr.forEach(player => {
            console.log('disconnecting: ' + player.name);
            player.device.gatt.disconnect();
            if(player.device.gatt.connected){
                player.device.gatt.disconnect();
            }

            //reset game on db
            if(player.work){
                setCarriereChosen(player.work, !player.work.universitie, false);
            }
            
            if(player.house){
                player.house.forEach((/** @type {any} */ house) => {
                    setHouseBought(house, false);
                });
            }
        });

        alert('beforeunload');
        console.log('beforeunload');

        return '...';
    }

</script>
<reference types="web-bluetooth" />


<form>
    <button on:click={() => connectRequest()} > connect with BLE device</button>
</form>

<svelte:window on:beforeunload={(event) => beforeUnload(event)}/>

<div class="totalBle">
    {#if arr}
        <div class="connectedBle">
            {#each arr as player}
                <Card endPlayer={endPlayer} rolled={rolled} bind:updatePosition={updatePosition} currentPlayer={currentPlayer.device.id} player={player}/> 
            {/each}
        </div>

        {#if arr.length >= 2}
            {#if rolled && currentPlayer}
                <h3>player: {currentPlayer.name} rolled: {rolled}</h3>
            {/if}
            {#if currentPlayer.name}
                <button on:click={() =>{rollrandom()}}>spin for player {currentPlayer.name}</button>
                <button on:click={() => nextPlayer()}>next player</button>
            {:else}
                <h3>click on the button below when all names have been filled in</h3>
                <button on:click={() => nextPlayer()}>start game</button>
            {/if}
        {:else} 
            <p>connect minumum 2 devices to play</p>    
        {/if}
    {/if}
</div>