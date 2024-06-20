<script lang="ts">
	import { initial } from 'chessground/fen';
	import BaseChessground from './chessground-base.svelte';
	import type { Config } from 'chessground/config';
	import type { Api } from 'chessground/api';
	import type { Key, Piece } from 'chessground/types';

	interface Props {
		/**
		 * The FEN representation of the board
		 */
		fen?: string | undefined;

		/**
		 * Callback called when a move on the board occurs
		 */
		onmove?: Required<Config>['events']['move'];
	}

	let { fen = $bindable(initial), onmove }: Props = $props();

	let chessground: Api | undefined = $state(undefined);
	let show_promotion_popover = $state(false);

	const is_promotion = (piece: Piece, from: Key, to: Key) => {
		if (piece.role !== 'pawn') {
			return false;
		}

		const rank = parseInt(to[1]);
		const promotion_rank = piece.color === 'white' ? 1 : 7;

		return promotion_rank === rank;
	};

	const config: Config = $derived({
		fen,
		events: {
			change: () => {
				if (!chessground) {
					return;
				}
				fen = chessground.getFen();
			},
			move: (from, to, captured) => {
				if (!chessground) {
					return;
				}
				const piece = chessground.state.pieces.get(to);
				if (!piece) {
					return;
				}
				if (is_promotion(piece, from, to)) {
					show_promotion_popover = true;
					return;
				}
				if (onmove === undefined) {
					return;
				}
				onmove(from, to, captured);
			}
		}
	});
</script>

<BaseChessground bind:chessground {config} />
