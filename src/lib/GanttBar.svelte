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
				<span>{label}</span>
			{/if}
		</div>
		{#if details}
			<div class="details">
				<span>{details}</span>
			</div>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}

<style>
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
		background: #fff;
		/* grid-column: 0 / span 500; */
		z-index: 50;
		white-space: nowrap;
		/* min-width: 10rem; */
	}

	.details {
		display: none; /* Initially hidden */
		position: absolute;
	}

	.barr:hover .label {
		display: block; /* Visible when .barr is hovered */
	}

	.barr:hover .details {
		display: block;
	}
</style>
