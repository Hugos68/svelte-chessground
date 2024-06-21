<script lang="ts">
	import Chessground from '$lib/components/chessground.svelte';
	import type { Config } from 'chessground/config';

	import { Chess, SQUARES } from 'chess.js';

	function toDests(chess: Chess) {
		const dests = new Map();
		SQUARES.forEach((s) => {
			const ms = chess.moves({ square: s, verbose: true });
			if (ms.length)
				dests.set(
					s,
					ms.map((m) => m.to)
				);
		});
		return dests;
	}

	const chess = new Chess();

	const config: Config = {
		movable: {
			color: 'white',
			free: false,
			dests: toDests(chess)
		}
	};


</script>

<Chessground {config} />
