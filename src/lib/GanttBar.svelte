<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import type { Snippet } from 'svelte';

	const {
		bounds,
		vals,
		bg = '#777',
		gridcols = 500,
		rows = 1,
		label,
		details,
		children,
		header
	}: {
		bounds: [Date, Date];
		vals: [Date, Date];
		bg: string;
		gridcols: number;
		rows: number;
		label?: string;
		details?: string;
		header?: Snippet;
		children?: Snippet;
	} = $props();

	let outerScale = $derived(scaleLinear()
		.domain(bounds)
		.range([1, gridcols])
		.clamp(true));

	let gridStart = $derived(Math.floor(outerScale(vals[0])));
	// Everything must take at least one grid cell.
	let endCol = $derived(Math.max(Math.ceil(outerScale(vals[1])), gridStart + 1));
	let span = $derived(endCol - gridStart);
	let gridStyle = $derived(
		`border: 3px solid ${bg}; grid-column: ${gridStart} / span ${span}; grid-row: span ${rows}; border 1.5px solid ${bg}`
	);
	let fullScreen = 
	`border: 3px solid ${bg}; grid-column: 0 / span ${gridcols}; grid-row: span ${rows}; border 1.5px solid ${bg}`

	let hovered = $state(false)

</script>

{#if span > 0}
	<div aria-roledescription="tooltip" aria-label="tooltip" class="barr" style={gridStyle}>
		{#if header}
			<div class="centered">
				{@render header()}
			</div>
		{/if}
		<div class="label">
			{#if label}
				<span class="text label-text">{label}</span>
			{/if}
		</div>
		{#if details}
			<div class="details">
				<span class="text details-text">{details}</span>
			</div>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}

<style>
	.text {
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
	}
	.label-text {
		padding: 0.25em;
	}
	.details-text {
		font-size: small;
		white-space: normal;
	}
	.barr {
		overflow: hidden;
		padding: 1px 30px 1px 3px;
		text-wrap: nowrap;
		display: inline-block;
		position: relative;
    padding: 2px 0px;
    margin: 1px -3px;
		border: 1px solid #d1d5db; /* Equivalent to bg-gray-100 */
		border-radius: 0.375rem; /* Equivalent to rounded */
		cursor: pointer;
		min-width: 0;
		transition:
			min-width 0.3s ease,
			max-height 0.3s ease,
			height 0.3s ease,
			grid-column 0.3s ease,
			background 0.1s ease; /* Add transition */
	}

	.centered {
    display: flex;
    justify-content: center;
  }

	.barr:hover {
		cursor: pointer;
		min-width: 15rem;
		white-space: nowrap;
		background: #fff;
		z-index: 50;
	}

	.barr>.details {
		top: 100%;         /* Position below the bar */
		left: 0;
		width: max-content;
		min-width: 100%;
		max-height: 0px;
		opacity: 0;
		/* padding: 0.5em 1em; */
		border-radius: 0.375rem;
		max-width: 100%;
		text-wrap: wrap;
		transition: opacity 0.2s ease max-height 0.2s ease;
	}

	.barr:hover .label {
		display: block; /* Visible when .barr is hovered */
	}

	.barr:hover>.details {
		display: block;
		opacity: 1;
		pointer-events: auto;
		padding: 0.25em;
		max-height: 100px;
	}
</style>
