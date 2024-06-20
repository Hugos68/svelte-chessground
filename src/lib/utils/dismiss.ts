import type { Action } from 'svelte/action';

const dismiss: Action<HTMLElement, undefined, { ondismiss: (event: CustomEvent) => void }> = (
	node
) => {
	const onclick = (event: MouseEvent) => {
		if (event.target === null || node.contains(event.target as HTMLElement)) {
			return;
		}
		node.dispatchEvent(new CustomEvent('dismiss'));
	};

	const onkeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') {
			return;
		}
		node.dispatchEvent(new CustomEvent('dismiss'));
	};

	document.addEventListener('mousedown', onclick);
	document.addEventListener('keydown', onkeydown);

	const destroy = () => {
		document.removeEventListener('mousedown', onclick);
		document.removeEventListener('keydown', onkeydown);
	};

	return { destroy };
};

export { dismiss };
