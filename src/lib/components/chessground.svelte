<script lang="ts">
	import '../styles/base.css';
	import '../styles/board.css';
	import '../styles/pieces.css';

	import ChessgroundBase from './chessground-base.svelte';
	import { merge } from 'ts-deepmerge';
	import { is_promotion, promotion_roles } from '../utils/promotion.js';
	import type { Api } from 'chessground/api';
	import type { Config } from 'chessground/config';
	import type { Key, Piece, PiecesDiff } from 'chessground/types';
	import type { PromotionRole } from '../utils/promotion.js';
	import type { HTMLAttributes } from 'svelte/elements';

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

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/**
		 * The config that is passed into the `Chessground` function
		 * @default {}
		 */
		config?: Config | undefined;
		/**
		 * Callback once the `Chessground` has initialized
		 * @param chessground The chessground instance
		 * @default undefined
		 */
		onready?: ((chessground: Api) => unknown) | undefined;
		/**
		 * The api returned from the `Chessground` function
		 * @default undefined
		 */
		chessground?: Api | undefined;
		/**
		 * The element that is passed into the `Chessground` function
		 * @default undefined
		 */
		element?: HTMLElement | undefined;
	}

	let {
		config = {},
		onready,
		chessground = $bindable(),
		element = $bindable(),
		...attributes
	}: Props = $props();

	let promotion: Promotion | null = $state(null);

	const internal_config: Config = $derived({
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
				config?.events?.move?.(orig, dest, capturedPiece);
			}
		}
	});

	const merged_config = $derived(merge(config, internal_config));

	const cancel_promote = () => {
		if (chessground === undefined || promotion === null) {
			return;
		}

		const pieces: PiecesDiff = new Map([
			[promotion.move.orig, promotion.piece],
			[promotion.move.dest, promotion.move.capturedPiece]
		]);

		chessground.setPieces(pieces);

		promotion = null;
	};

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

		config?.events?.move?.(
			promotion.move.orig,
			promotion.move.dest,
			$state.snapshot(promotion.move.capturedPiece)
		);

		promotion = null;
	};
</script>

<div class="container">
	{#if promotion !== null}
		<button class="dialog-backdrop" onclick={() => cancel_promote()}></button>
		<div
			class="dialog"
			style:--top-offset="{promotion.dialog.top_offset}%"
			style:--left-offset="{promotion.dialog.left_offset}%"
			style:--bg={promotion.piece.color === 'white' ? 'black' : 'white'}
		>
			{#each promotion_roles as role}
				<button class="dialog-option {role} {promotion.piece.color}" onclick={() => promote(role)}>
				</button>
			{/each}
		</div>
	{/if}
	<ChessgroundBase
		config={merged_config}
		{onready}
		bind:chessground
		bind:element
		{...attributes}
		inert={attributes?.inert || promotion !== null}
	/>
</div>

<style>
	.container {
		position: relative;
		width: fit-content;
		height: fit-content;
	}
	.dialog-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 10;
		background-color: rgba(0, 0, 0, 50%);
	}
	.dialog {
		top: var(--top-offset);
		left: var(--left-offset);
		width: 12.5%;
		height: 50%;
		z-index: 10;
		position: absolute;
		display: flex;
		flex-direction: column;
	}

	.dialog-option {
		border: none;
		height: 25%;
		width: 100%;
		background-size: cover;
		border-radius: 50%;
		transition: background-color 100ms ease-in-out;
	}

	.dialog-option:hover {
		background-color: darkgray;
		cursor: pointer;
	}
</style>
