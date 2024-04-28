<script>
    import Card from './BLECard.svelte';
    import './main.css'
    let deviceName = "ESP32";

    /**
     * @type {any[]}
     */
    let arr = [];



    function isWebBLEAvaible(){
        if(!navigator.bluetooth){
            alert('Web BLE is not supported');
            return false;
        }
        return true;
    }

    function connectRequest(){
        if(!isWebBLEAvaible()){
            return;
        }
        getDeviceInfo();
    }

    /**
     * @param {any[]} arr
     */
    function storeDeviceInfLocal(arr){
        localStorage.setItem('devices', JSON.stringify(arr));
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
            if(!arr.includes(device)){
                //fix zodat niet meer dan 1 device vna het zelfde ene nieuw profiel aan maakt. dit werkt nietmeer door player
                console.log('Name: ' + device.name);

                
                var player = {
                    device: device,
                    name: null,
                    work: null,
                    money: 400000,
                    house: [],
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
                {#each arr as player}
                    <Card player={player}/> 
                {/each}
        </div>

        {#if arr.length >= 2}
            <a href="/gamepage" on:click={() => storeDeviceInfLocal(arr)}>start game</a>
            <!-- <button class="startButton" on:click={() => printConnectedBleDevices()}>start</button> -->
        {:else}
            <p>connect minumum 2 devices to play</p>    
        {/if}
    {/if}
</div>