<script>
    import { onDestroy, onMount } from 'svelte';
    import './blecard.css'
    import {getCarriere, getCarriereUnief, getHouses,setHouseBought, setCarriereChosen, getWildCard} from '../DBConnection.js';
    import Carrier from './carrierCard.svelte';
    import House from './houseCard.svelte';

    //todo: implementeer kinderen

    /**
     * @type {any}
     */
    export let player;

    export let currentPlayer;

    /**
     * @type {(arg0: any) => void}
     */
     export let endPlayer;

    /**
     * @type {string}
     */
    let deviceFunction;

    /**
     * @type {any[]}
     */
    let choises;

    /**
     * @type {boolean}
     */
    let nameInit;
    
    /**
     * @type {null}
     */
    let currentName;

    /**
     * @type {any}
     */
    var characteristicFunction;

    /**
     * @type {boolean}
     */
    export let updatePosition;

    export let rolled;
    $:{
        if(currentPlayer == player.device.id && updatePosition == true){
            player.boardPosition = player.boardPosition + rolled;
            sendValueToCharacteristic("b2cb2216-b3a6-40f9-b4a3-8149e1a1fbce", player.device, player.boardPosition);
            updatePosition = false;
        }
    }

    let playerEnded = false;

    onDestroy(() => {
        //does not work on reload => how to fix ?
        if(player.device.gatt.connected){
            characteristicFunction.stopNotifications();
            player.device.gatt.disconnect();
        }

        //reset game on db
        if(player.work){
            setCarriereChosen(player.work, !player.work.universitie, false);
        }
        if(player.house){
            setHouseBought(player.house, false);
        }
    });

    
    //todo: put al the functions into a java class
    onMount(async () => {
        player.device.gatt.connect().then((/** @type {any} */ server) => {
        return server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
        }).then((/** @type {any} */ service) => {
            return service.getCharacteristic('a4fad047-26a6-44ed-b307-4ce99852b904');
        }).then((/** @type {any} */ characteristic) => {
            characteristicFunction = characteristic;
            console.log('Getting Characteristic...');
            characteristicFunction.startNotifications();
            console.log('Notifications started');
            characteristicFunction.addEventListener('characteristicvaluechanged',(/** @type {any} */ event) =>{handleBleEvent(event, characteristicFunction)}); 
            console.log('Event listener added');
        });

        if(player.name){
            currentName = player.name;
            nameInit = true;
        }
        else{
            currentName = null;
            nameInit = false;
        }
    });

    /**
     * @param {any} event
     * @param {{ value: any; }} characteristic
     */
    async function handleBleEvent(event, characteristic){
        var decoder = new TextDecoder('utf-8');
        var recievedText = decoder.decode(characteristic.value);
        deviceFunction = recievedText;
        console.log(recievedText);
        
        if(recievedText == 'carrier'){
            choises = await getCarriere();
        }
        else if(recievedText == 'universiteit'){
            choises = await getCarriereUnief();
        }
        else if(recievedText == 'house'){
            choises = await getHouses();
        }
        else if(recievedText == 'salaris'){
            UpdateDeviceAndBackend(player.device);
        }
        else if(recievedText == 'kinderen'){
            choises = ['yes', 'no'];
        }
        else if(recievedText == 'stop'){
            alert('player landed on a stop card cancel this mesage and roll again');
            player.boardPosition = 0;
            sendValueToCharacteristic("b2cb2216-b3a6-40f9-b4a3-8149e1a1fbce", player.device, player.boardPosition);
        }
        else if(recievedText == 'end'){
            endGameForPlayer();
        }
        else if(recievedText == 'wildcard'){
            var wildCard = await getWildCard();
            handelWildCard(wildCard);
        }
        else if(recievedText == ''){
            //no Operation
        }
        else{
            alert('internal error, function not found');
        }
    }

    /**
     * @param {any} characteristic
     * @param {BluetoothDevice} device
     * @param {string} value
     */
    function sendValueToCharacteristic(characteristic, device, value){
        if (device.gatt) {
                device.gatt.connect().then(server => {
                return server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
            }).then(service => {
                return service.getCharacteristic(characteristic);
            }).then(characteristic => {
                return characteristic.writeValue(new TextEncoder().encode(value));
            }).then(() => {
                console.log('Value written!');
            }).catch(error => {
                console.log('Argh! ' + error);
            });
        }
    }

    /**
     * @param {any} wildCard
     */
    function handelWildCard(wildCard){
        alert(player.name + ": " + wildCard.text);
        console.log("before: ");
        console.log(player);
        console.log("value: ");
        console.log(wildCard);
        console.log(wildCard.value);
        if(wildCard.from == "money"){
            player.money = player.money + wildCard.value;
            console.log("after: ");
            console.log(player);
            sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', player.device, player.money);
            player.amountOfWildCards = player.amountOfWildCards + 1;
            
        }
        else if(wildCard.from == "salaris"){
            player.salaris = player.salaris + wildCard.value;
            player.amountOfWildCards = player.amountOfWildCards + 1;
            console.log("after: ");
            console.log(player);
        }
        else{
            alert('internal errorn');
        }
    }

    /**
     * @param {BluetoothDevice} device
     * @param {any} [value]
     * 
     */
    function UpdateDeviceAndBackend(device, value){
        if(deviceFunction == 'carrier' || deviceFunction == 'universiteit'){
            player.work = value;
            player.salaris = value.salaris;

            if(deviceFunction == 'universiteit'){
                setCarriereChosen(value, false, true);
                player.money = player.money - 200000;
                player.work.universitie = true;
            }
            else{
                setCarriereChosen(value, true, true);
                player.work.universitie = false;
            }

            sendValueToCharacteristic('170746ed-a31c-49ea-804a-178e244ee4ef', device, player.work.naam);
            sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', device, player.money);
            choises = [];
        }
        else if(deviceFunction == 'salaris' && player.work){
            //verder implementeren
            player.money = player.salaris + player.money;
            sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', device, player.money);
        }
        else if(deviceFunction == 'house'){
            if(value.koopPrijs <= player.money){
                var housarray = player.house;
                housarray.push(value);
                player.house = housarray;
                player.money = player.money - value.koopPrijs;
                sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', device, player.money);
                setHouseBought(value, true);
                updateHouse(housarray);
            }
            else{
                alert('not enough money to buy' + value.name);
            }
            choises = [];
        }
        else if(deviceFunction == 'childeren'){
            player.childeren = value;
            sendValueToCharacteristic('ca0929ca-0a50-4aa9-9aa0-898a93c6b15d', device, player.childeren);
        }
        deviceFunction = '';
    }

    /**
     * @param {BluetoothDevice} device
     */
    function playerInit(device){
        player.name = currentName;
        sendValueToCharacteristic('1476db45-ed9c-4f50-ad6b-6e6815effa66', device, player.name);
        sendValueToCharacteristic('ca0929ca-0a50-4aa9-9aa0-898a93c6b15d', device, player.childeren);
        sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', player.device, player.money);
        nameInit = true;
    }

    /**
     * @param {any} house
     */
    function sellHous(house){
        alert('house: ' + house.naam + ' will be sold');
        if(confirm('the prise at which the hous will be sold is dependend on a number being odd or even, Do you accept?')){
            setHouseBought(house, false);
            var randomVlaue = Math.floor(Math.random() * 10);
            if(randomVlaue % 2 == 0){
                alert('house sold number: '+ randomVlaue + ' even and is sold for: ' + house.verkoopPrijsHoog + ' $');
                player.money = player.money + house.verkoopPrijsHoog;
            }
            else{
                alert('house sold number: '+ randomVlaue + ' oneven and is sold for: '+ house.verkoopPrijsLaag + ' $');
                player.money = player.money + house.verkoopPrijsLaag;
            }
            player.house = player.house.filter((/** @type {any} */ h) => h != house);
            sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', player.device, player.money);
            updateHouse(player.house);
        }
        else{
            alert('house not sold');
        }
        choises = [];
        deviceFunction = '';
    }

    /**
     * @param {any[]} housarray
     */
    function updateHouse(housarray){
        try{
            if(housarray.length == 0){
                sendValueToCharacteristic('33cb479d-67ac-4073-9eac-58e886d64e0c', player.device, "");
            }
            else if(housarray.length == 1){
                sendValueToCharacteristic('33cb479d-67ac-4073-9eac-58e886d64e0c', player.device, housarray[0].naam);
            }
            else{
                sendValueToCharacteristic('33cb479d-67ac-4073-9eac-58e886d64e0c', player.device, housarray.length + "");
            }
        }
        catch(e){
           updateHouse(housarray); 
        }
    }

    /**
     * @param {string} choise
     */
    function addchilderen(choise){
        if(choise == 'yes'){
            player.childeren = player.childeren + 1;
        }
        sendValueToCharacteristic('ca0929ca-0a50-4aa9-9aa0-898a93c6b15d', player.device, player.childeren);
        choises = [];
        deviceFunction = '';
    }

    function endGameForPlayer(){
        alert("game for " + player.name + " ended. now calculating end value.");
        player.money = player.amountOfWildCards * 100000;
        player.amountOfWildCards = 0;

        player.money = player.childeren * 100000;
        player.childeren = 0;

        player.house.forEach((/** @type {any} */ house) => {
            sellHous(house);
        });

        alert("player: " + player.name + " has ended with " + player.money + "$")
        playerEnded = true;

        endPlayer(player);
    }

</script>

<card>
    <h3>{player.device.name}</h3>
    <h5>player name: </h5>
    {#if nameInit}
        <p>{player.name}</p>
    {:else}
        <input bind:value={currentName}>
    {/if}
    {#if choises}
        <div class="choisesDiv">
            {#if deviceFunction == 'kinderen'}
                <h4>do you want an extra child?</h4>
            {/if}
            <div>
                {#each choises as choise}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div on:click={() => {UpdateDeviceAndBackend(player.device, choise)}}>
                        {#if deviceFunction == 'carrier' || deviceFunction == 'universiteit'}
                            <Carrier carrier={choise}/>
                        {:else if deviceFunction == 'house'}
                            <House deleteHouse={false} house={choise}/>
                        {:else if deviceFunction == 'kinderen'}
                            <button on:click={() => addchilderen(choise)}>{choise}</button>
                        {/if}
                    </div>
                {/each}
            </div>
            {#if deviceFunction == 'house' && player.house.length > 0}
                <h4>houses owned</h4>
                <div>
                {#each player.house as house}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div on:click={() => {sellHous(house)}}>
                        <House deleteHouse={true} house={house}/>
                    </div>
                {/each}
                </div>
            {/if}
            {#if playerEnded}
                <h4>player {player.name} ended with {player.money}$</h4>
            {/if}
        </div>
    {/if}
    {#if !nameInit}
        <button on:click={() => playerInit(player.device)}>send</button>
    {/if}
</card>