 
<script lang="ts">
import { Chessground } from "chessground";
import type { Api } from "chessground/api";
import type { Config } from "chessground/config";
import { untrack } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

interface Props extends HTMLAttributes<HTMLDivElement> {
	/**
	 * The config that will be passed into the `Chessground` function
	 * @default {}
	 */
	config?: Config;
	/**
	 * The api returned from the `Chessground` function
	 * @default undefined
	 */
	chessground?: Api;
	/**
	 * Callback once the `Chessground` has initialized
	 * @param chessground The chessground instance
	 * @default () => {}
	 */
	onready?: (chessground: Api) => unknown;
}

let {
	config = {},
	chessground = $bindable(undefined),
	onready = () => {},
	...attributes
}: Props = $props();

let element: HTMLElement | null = $state(null);

const initialize_chessground = () => {
	if (!element) {
		return;
	}
	chessground = Chessground(element, config);
	onready(chessground);
};

const update_chessground = () => {
	if (!chessground) {
		return;
	}
	chessground.set(config);
};

$effect(() =>
	untrack(() => {
		initialize_chessground();
	}),
);

$effect(() => {
	update_chessground();
});
</script>

<div bind:this={element} {...attributes}></div>
 