<script>
    import { onDestroy, onMount } from 'svelte';
    import './blecard.css'
    import {getCarriere, getCarriereUnief, getHouses,setHouseBought, setCarriereChosen} from '../DBConnection.js';
    import Carrier from './carrierCard.svelte';
    import House from './houseCard.svelte';

    /**
     * @type {any}
     */
    export let player;

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
    let nameInit = false;

    onDestroy(() => {
        if(player.device.gatt.connected){
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
            var characteristicFunction = characteristic;

            characteristicFunction.startNotifications();
            characteristicFunction.addEventListener('characteristicvaluechanged',(/** @type {any} */ event) =>{handleEvent(event, characteristicFunction)}); 
        });
    });

    /**
     * @param {any} event
     * @param {{ value: any; }} characteristic
     */
    async function handleEvent(event, characteristic){
        //nog groote functionaliteit insteken. 
        var decoder = new TextDecoder('utf-8');
        var recievedText = decoder.decode(characteristic.value);
        deviceFunction = recievedText;

        
        if(recievedText == 'carrier'){
            choises = await getCarriere();
        }
        else if(recievedText == 'universiteit'){
            choises = await getCarriereUnief();
        }
        else if(recievedText == 'house'){
            choises = await getHouses();
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
     */
    function UpdateDeviceAndBackend(device, value){
        console.log('Update Device');
        console.log(player);
        if(deviceFunction == 'carrier' || deviceFunction == 'universiteit'){
            player.work = value;

            if(deviceFunction == 'universiteit'){
                setCarriereChosen(value, false, true);
            }
            else{
                setCarriereChosen(value, true, true);
            }

            sendValueToCharacteristic('170746ed-a31c-49ea-804a-178e244ee4ef', device, player.work.naam);
            choises = [];
        }
        else if(deviceFunction == 'geld'){
            //verder implementeren
            player.money = value;
            sendValueToCharacteristic('e739d173-9337-4c78-97f4-d68512de07df', device, player.money);
        }
        else if(deviceFunction == 'house'){
            player.house = value.naam;
            setHouseBought(value, true);
            sendValueToCharacteristic('33cb479d-67ac-4073-9eac-58e886d64e0c', device, player.house);
            choises = [];
        }
        else if(deviceFunction == 'childeren'){
            player.childeren = value;
            sendValueToCharacteristic('ca0929ca-0a50-4aa9-9aa0-898a93c6b15d', device, player.childeren);
        }
    }

    /**
     * @param {BluetoothDevice} device
     */
    function updateName(device){
        sendValueToCharacteristic('1476db45-ed9c-4f50-ad6b-6e6815effa66', device, player.name);
        nameInit = true;
    }

</script>

<card>
    <h3>{player.device.name}</h3>
    <h5>player name: </h5>
    {#if nameInit}
        <p>{player.name}</p>
    {:else}
        <input bind:value={player.name}>
    {/if}
    {#if choises}
        <div class="choisesDiv">
        {#each choises as choise}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div on:click={() => {UpdateDeviceAndBackend(player.device, choise)}}>
                {#if deviceFunction == 'carrier'}
                    <Carrier carrier={choise}/>
                {:else if deviceFunction == 'house'}
                    <House house={choise}/>
                {/if}
            </div>
        {/each}
        </div>
    {/if}
    {#if !nameInit}
        <button on:click={() => updateName(player.device)}>send</button>
    {/if}
</card>