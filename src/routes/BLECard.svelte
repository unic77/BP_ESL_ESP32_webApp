<script>
    import { onDestroy, onMount } from 'svelte';
    import './blecard.css'
    import {getCarriere, getCarriereUnief, getHouses,setHouseBought, setCarriereChosen} from '../DBConnection.js';
    import Carrier from './carrierCard.svelte';
    import House from './houseCard.svelte';

    //todo: implementeer kinderen

    /**
     * @type {any}
     */
    export let player;

    export let currentPlayer;
    $: console.log(currentPlayer)

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

    export let rolled;
    $:{
        if(currentPlayer == player.device.id){
            console.log('rolled: ' + rolled);
            console.log(player);
            player.boardPosition = player.boardPosition + rolled;
            console.log("bord position "+ player.name +": " + player.boardPosition);
            sendValueToCharacteristic("b2cb2216-b3a6-40f9-b4a3-8149e1a1fbce", player.device, player.boardPosition);
        }
    }

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
        //doesnt have to reconnect evry time. => search how to fix
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
        //nog groote functionaliteit insteken. 
        var decoder = new TextDecoder('utf-8');
        var recievedText = decoder.decode(characteristic.value);
        deviceFunction = recievedText;

        console.log('recieved: ' + recievedText);
        
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
                console.log('Getting Service...');
                return server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
            }).then(service => {
                console.log('Getting Characteristic...');
                return service.getCharacteristic(characteristic);
            }).then(characteristic => {
                console.log('Writing value...');
                return characteristic.writeValue(new TextEncoder().encode(value));
            }).then(() => {
                console.log('Value written!');
            }).catch(error => {
                console.log('Argh! ' + error);
            });
        }
    }

    /**
     * @param {BluetoothDevice} device
     * @param {any} [value]
     * naam klopt niet is meer dan alleen update backend enzo
     */
    function UpdateDeviceAndBackend(device, value){
        console.log('Update Device');
        console.log(player);
        if(deviceFunction == 'carrier' || deviceFunction == 'universiteit'){
            player.work = value;
            player.salaris = value.salaris;

            if(deviceFunction == 'universiteit'){
                setCarriereChosen(value, false, true);
            }
            else{
                setCarriereChosen(value, true, true);
            }

            sendValueToCharacteristic('170746ed-a31c-49ea-804a-178e244ee4ef', device, player.work.naam);
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
    function updateName(device){
        sendValueToCharacteristic('1476db45-ed9c-4f50-ad6b-6e6815effa66', device, player.name);
        //set one character in the car
        sendValueToCharacteristic('ca0929ca-0a50-4aa9-9aa0-898a93c6b15d', device, player.childeren);
        sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', player.device, player.money);
        nameInit = true;
        player.name = currentName;
    }

    /**
     * @param {any} house
     */
    function sellHous(house){
        console.log(player.house);
        
        if(confirm('Odd number will sell the house low, even number will sell the house high. Do you accept?')){
            setHouseBought(house, false);
            player.house = player.house.filter((/** @type {any} */ h) => h != house);
            var randomVlaue = Math.floor(Math.random() * 10);
            if(randomVlaue % 2 == 0){
                alert('house sold number: '+ randomVlaue + ' even');
                player.money = player.money + house.verkoopPrijsHoog;
            }
            else{
                alert('house sold number: '+ randomVlaue + ' oneven');
                player.money = player.money + house.verkoopPrijsLaag;
            }
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
        if(housarray.length <= 1){
            sendValueToCharacteristic('33cb479d-67ac-4073-9eac-58e886d64e0c', player.device, housarray[0].naam);
        }
        else{
            sendValueToCharacteristic('33cb479d-67ac-4073-9eac-58e886d64e0c', player.device, housarray.length + "");
        }
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
            <div>
                {#each choises as choise}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div on:click={() => {UpdateDeviceAndBackend(player.device, choise)}}>
                        {#if deviceFunction == 'carrier'}
                            <Carrier carrier={choise}/>
                        {:else if deviceFunction == 'house'}
                            <House deleteHouse={false} house={choise}/>
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
        </div>
    {/if}
    {#if !nameInit}
        <button on:click={() => updateName(player.device)}>send</button>
    {/if}
</card>