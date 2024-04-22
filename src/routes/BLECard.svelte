<script>
    import { onMount } from 'svelte';
    import './blecard.css'

    /**
     * @type {any}
     */
    export let player;

    /**
     * @type {string}
     */
     export let deviceFunction;

    
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
        var decoder = new TextDecoder('utf-8');
        var recievedText = decoder.decode(characteristic.value);
        console.log(recievedText)
        deviceFunction = recievedText;
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
     */
    function UpdateDevice(device){
        console.log('Update Device');
        console.log(player);
        sendValueToCharacteristic('1476db45-ed9c-4f50-ad6b-6e6815effa66', device, player.name);
    }

    /**
     * @param {{ gatt: { connect: () => Promise<any>; }; }} device
     */
    function ReadFunctions(device){
        if (device.gatt) {
            device.gatt.connect().then(server => {
                console.log('Getting Service...');
                return server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
            }).then(service => {
                console.log('Getting Characteristic...');
                return service.getCharacteristic('a4fad047-26a6-44ed-b307-4ce99852b904');
            }).then(characteristic => {
                console.log('Reading value...');
                return characteristic.readValue();
            }).then(value => {
                console.log('Value: ' + new TextDecoder().decode(value.buffer));
            }).catch(error => {
                console.log('Argh! ' + error);
            });
        }
    }
</script>

<card>
    <h3>{player.device.name}</h3>
    <h5>player name: </h5>
    <input bind:value={player.name}>
    <h5>device function: {deviceFunction}</h5>
    <button on:click={() => UpdateDevice(player.device)}>send</button>
    <button on:click={() => ReadFunctions(player.device)}>read function</button> <!--for test> -->
</card>