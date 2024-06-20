<script lang="ts">
	import { initial } from 'chessground/fen';
	import ChessgroundBase from './chessground-base.svelte';
	import { dismiss } from './dismiss.js';
	import { is_promotion, promotion_roles } from './promotion.js';
	import type { Api } from 'chessground/api';
	import type { Config } from 'chessground/config';
	import type { PromotionRole } from './promotion.js';
	import type { Key, Piece, PiecesDiff } from 'chessground/types';

	interface Promotion {
		piece: Piece;
		move: {
			orig: Key;
			dest: Key;
			capturedPiece?: Piece;
		};
		dialog: {
			top_offset: number;
			left_offset: number;
		};
	}

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

	let chessground: Api | undefined = $state();
	let promotion: Promotion | null = $state(null);

	const config: Config = $derived({
		fen,
		events: {
			move: (orig, dest, capturedPiece) => {
				if (chessground === undefined) {
					return;
				}
				const piece = chessground.state.pieces.get(dest);
				if (piece !== undefined && is_promotion(dest, piece)) {
					promotion = {
						piece,
						move: {
							orig,
							dest,
							capturedPiece
						},
						dialog: {
							get top_offset() {
								if (chessground === undefined) {
									return 0;
								}
								return chessground.state.orientation === piece.color ? 0 : 50;
							},
							get left_offset() {
								if (chessground === undefined) {
									return 0;
								}
								const file = dest.charAt(0) || 'a';
								const rank = parseInt(file, 36) - 9;
								const percentage = (rank - 1) * 12.5;
								return chessground.state.orientation === 'white' ? percentage : 87.5 - percentage;
							}
						}
					};
					return;
				}
				if (onmove === undefined) {
					return;
				}
				onmove(orig, dest, capturedPiece);
			}
		}
	});

	const promote = (role: PromotionRole) => {
		if (chessground === undefined || promotion === null) {
			return;
		}

		const pieces: PiecesDiff = new Map([
			[
				promotion.move.dest,
				{
					role,
					color: promotion.piece.color,
					promoted: true
				}
			]
		]);

		chessground.state.animation.enabled = false;
		chessground.setPieces(pieces);
		chessground.state.animation.enabled = true;

		if (onmove !== undefined) {
			onmove(promotion.move.orig, promotion.move.dest, promotion.move.capturedPiece);
		}

		promotion = null;
	};
</script>

<div class="container">
	{#if promotion !== null}
		<div
			class="dialog"
			style:--top-offset="{promotion.dialog.top_offset}%"
			style:--left-offset="{promotion.dialog.left_offset}%"
			style:--bg={promotion.piece.color === 'white' ? 'black' : 'white'}
			use:dismiss
			ondismiss={() => (promotion = null)}
		>
			{#each promotion_roles as role}
				<button class="dialog-option {role} {promotion.piece.color}" onclick={() => promote(role)}>
				</button>
			{/each}
		</div>
	{/if}
	<ChessgroundBase inert={promotion !== null} bind:chessground {config} />
</div>

<style>
	.container {
		position: relative;
		width: fit-content;
		height: fit-content;
	}
	.dialog {
		top: var(--top-offset);
		left: var(--left-offset);
		width: 12.5%;
		height: 50%;
		z-index: 10;
		position: absolute;
	}
	.dialog-option {
		border: none;
		height: 25%;
		width: 100%;
		background-size: cover;
	}
</style>
