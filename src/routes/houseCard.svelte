<script>
    export let house;
    export let deleteHouse;
</script>

<style>
    house{
        border: 1px solid black;
        margin: 10px;
        padding: 10px;
        transition: 0.5s;
    }

    house:hover{
        background-color: lightgrey;
        cursor: pointer;
        scale: 1.1;
    }

    .delete:hover{
        background-color: rgb(227, 90, 90);
        color: white;
    }


    .high{
        color: green;
    }

    .low{
        color: red;
    }

</style>

<house class={!deleteHouse ? "": "delete"}>
    <h4>{house.naam}</h4>
    <p>koop prijs: {house.koopPrijs} $</p>
    <p>verkoop prijzen:</p>
    <p class="high">{house.verkoopPrijsHoog} $</p>
    <p class="low">{house.verkoopPrijsLaag} $</p>
</house>