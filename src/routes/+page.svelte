<script>
    import Card from './BLECard.svelte';
    import './main.css'
    let deviceName = "ESP32";

    /**
     * @type {any[]}
     */
    var arr = [];
    $: console.log(arr);

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

    function getDeviceInfo(){
        let options = {
            optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'],
            filters: [
                {namePrefix: deviceName}
            ]
        };

        console.log('Requesting Bluetooth Device...');
        navigator.bluetooth.requestDevice(options).then(device => {
            console.log('Connecting to GATT Server...');
            if(!arr.includes(device)){
                console.log('Name: ' + device.name);
                var player = {
                    device: device,
                    name: 'test',
                    work: 'test',
                    money: 1,
                    house: 'test',
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
    
    function printArr(){
        console.log(arr);
    }

</script>
<reference types="web-bluetooth" />

<form>
    <h1>BLE e-ink board games</h1>
    <button on:click={() => connectRequest()} > connect with BLE device</button>
</form>
<div class="totalBle">
    <div class="connectedBle">
        {#each arr as player}
            <Card  player={player}/> 
        {/each}
    </div>

    {#if arr.length >= 2}
        <a href="/gameMainPage">start game</a>
        <!-- <button class="startButton" on:click={() => printConnectedBleDevices()}>start</button> -->
    {:else}
        <p>connect minumum 2 devices to play</p>    
    {/if}
</div>