<script lang="ts">
	import './base.css';
	import './board.css';
	import './pieces.css';

	import Chessground from '$lib/chessground.svelte';
</script>

<div>
	<Chessground />
</div>

<style>
	div {
		max-width: 500px;
	}
</style>
