<script>
    export let carrier;
</script>

<style>

    carrier{
        border: 1px solid black;
        margin: 10px;
        padding: 10px;
        transition: 0.5s;
    }

    carrier:hover{
        background-color: lightgrey;
        cursor: pointer;
        scale: 1.1;
    }
</style>

<carrier>
    <h4>{carrier.naam}</h4>
    <p>salarirs: {carrier.salaris} $</p>
</carrier>