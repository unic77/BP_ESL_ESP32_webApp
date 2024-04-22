<script>
    import './main.css'
    /**
     * @type {any}
     */
    let arr=[];
</script>

<div class="header">
    <h1>BLE e-ink board games</h1>
</div>

<main>
    <slot arr={arr}></slot>
</main>