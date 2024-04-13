<script>
    import './blecard.css'

    /**
     * @type {any}
     */
     export let player;

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
        sendValueToCharacteristic('170746ed-a31c-49ea-804a-178e244ee4ef', device, player.work);
        sendValueToCharacteristic("e739d173-9337-4c78-97f4-d68512de07df",device, player.money.toString());
        sendValueToCharacteristic("33cb479d-67ac-4073-9eac-58e886d64e0c", device, player.house);
        if(player.childeren <= 6){
            sendValueToCharacteristic("ca0929ca-0a50-4aa9-9aa0-898a93c6b15d", device, player.childeren.toString());
        }
        else{
            console.warn('more childeren added than supported');
        }
        
    }
</script>

<card>
    <h3>{name}</h3>
    <h5>player name: </h5>
    <input bind:value={player.name}>
    <h5>player work: </h5>
    <input bind:value={player.work}>
    <h5>player money: </h5>
    <input class="inputNumber" type="number" bind:value={player.money}>
    <h5>player childeren: </h5>
    <input class="inputNumber" type="number" bind:value={player.childeren}>
    <h5>player house: </h5>
    <input bind:value={player.house}>
    <button on:click={() => UpdateDevice(player.device)}>send</button>
</card>