<script lang="ts">
	import './styles/base.css';
	import './styles/board.css';
	import './styles/pieces.css';
	import { Chessground } from 'chessground';
	import { untrack } from 'svelte';
	import type { Api } from 'chessground/api';
	import type { Config } from 'chessground/config';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/**
		 * The config that is passed into the `Chessground` function
		 * @default undefined
		 */
		config?: Config | undefined;
		/**
		 * The api returned from the `Chessground` function
		 * @default undefined
		 */
		chessground?: Api | undefined;
		/**
		 * Callback once the `Chessground` has initialized
		 * @param chessground The chessground instance
		 * @default undefined
		 */
		onready?: ((chessground: Api) => unknown) | undefined;
		/**
		 * The element that is passed into the `Chessground` function
		 * @default undefined
		 */
		element?: HTMLElement | undefined;
	}

	let {
		config = undefined,
		chessground = $bindable(),
		onready = undefined,
		element = $bindable(),
		...attributes
	}: Props = $props();

	const initialize_chessground = () => {
		if (element === undefined) {
			return;
		}
		chessground = Chessground(element, config);
		if (onready === undefined) {
			return;
		}
		onready(chessground);
	};

	const update_chessground = () => {
		if (chessground === undefined || config === undefined) {
			return;
		}
		chessground.set(config);
	};

	$effect(() =>
		untrack(() => {
			initialize_chessground();
		})
	);

	$effect(() => {
		update_chessground();
	});
</script>

<div style="width: 500px; height: 500px;" bind:this={element} {...attributes}></div>
