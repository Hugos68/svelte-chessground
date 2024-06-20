<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Api } from 'chessground/api';
	import type { Config } from 'chessground/config';
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/**
		 * The config that will be passed into the `Chessground` function
		 * @default null
		 */
		config?: Config | undefined;
		/**
		 * The api returned from the `Chessground` function
		 * @default null
		 */
		chessground?: Api | undefined;
		/**
		 * Callback once the `Chessground` has initialized
		 * @param chessground The chessground instance
		 * @default null
		 */
		onready?: ((chessground: Api) => unknown) | undefined;
	}

	let {
		config = undefined,
		chessground = $bindable(undefined),
		onready = undefined,
		...attributes
	}: Props = $props();

	let element: HTMLElement | null = $state(null);

	const initialize_chessground = () => {
		if (element === null) {
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

<div bind:this={element} {...attributes}></div>
