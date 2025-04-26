<script lang="ts" generics="T extends Record<string, any>">
	import GanttBarr from './GanttBar.svelte';
	import GanttChart from './GanttChart.svelte';
	import { rollup } from 'd3-array';

	type GetMinMax = (d: T) => [Date, Date];

	const {
		getMinMax,
		data: rawData,
		label,
		sort = undefined,
		getColor = (t: T) => '#DDD',
		sublabel = (t: T) => {
			return '';
			const [min, max] = getMinMax(t);
			return `${min.toISOString()} - ${max.toISOString()}`;
		},
		groupings = [],
		focused = undefined,
		headerTimes = true
	}: {
		data: T[];
		getMinMax: GetMinMax;
		getColor?: (d: T) => string;
		label: (d: T) => string;
		sort?: boolean;
		sublabel?: (d: T) => string;
		groupings?: ((datum: T) => string)[];
		headerTimes?: boolean;
		focused?: number | undefined;
	} = $props();

	let data: T[] = $derived.by(() => {
		const d = rawData.filter((d) => {
			const [a, b] = getMinMax(d);
			if (isNaN(a.getTime() + b.getTime())) {
				console.error('Unable to parse date ', d);
				return false;
			}
			return true;
		})

		if (sort) return [...rawData].sort((a, b) => +getMinMax(a)[0] - +getMinMax(b)[0]);
		// if (sort === false) return shuffle([...rawData]);
		return rawData;
	});

	function aggregateMinMax(vals: T[]) {
		const mins = vals.map(getMinMax).map((d) => +d[0]);
		const maxs = vals.map(getMinMax).map((d) => +d[1]);
		return [new Date(Math.min(...mins)), new Date(Math.max(...maxs))] as [Date, Date];
	}
	let [mintime, maxtime] = $derived(aggregateMinMax(data));

	const gridcols = 500;

	type nestType = {
		label: string;
		data: T[];
	};

	let nestedData: Array<nestType> | null = $derived.by(() => {
		if (groupings.length > 0) {
			const f = groupings[0];
			function rollFunction(vals: T[]) {
				return {
					label: f(vals[0]),
					data: vals
				};
			}
			const rolled = rollup(data, rollFunction, groupings[0]);
			return [...rolled.values()];
		} else {
			return null;
		}
	});

	const ranges: [string, number][] = [
		['30 seconds', 30 * 1000],
    ['two minutes', 2 * 60 * 1000],
		['Five minutes', 5 * 60 * 1000],
		['One hour', 60 * 60 * 1000],
		['Six hours', 6 * 60 * 60 * 1000],
		['Twelve hours', 12 * 60 * 60 * 1000]
	];

	let prebuiltRanges = $derived(
		ranges.map(([label, duration]) => ({
			label,
			vals: [new Date(30_000 + +mintime), new Date(+mintime + duration * 1)] as [Date, Date],
			width: (duration as number) / (+maxtime - +mintime)
		}))
	);

	let customMinMax = $state<null | [Date, Date]>(null)
	let minMax = $derived<[Date, Date]>(customMinMax !== null ? customMinMax : [mintime, maxtime])

</script>

<div>
	<div class="overgrid m-0 p-0 h-full w-full">
		{#if nestedData}
			{#each nestedData as arr, i}
				<GanttBarr
					vals={aggregateMinMax(arr.data)}
					bounds={minMax}
					{gridcols}
					bg={'#777'}
					rows={1}
					>
						{#snippet header()}
							{arr.label}
						{/snippet}
						<div>
							<GanttChart
								data={arr.data}              
								{getMinMax}
								{getColor}
								{label}
								{sublabel}
								headerTimes={true}
								groupings={groupings.slice(1)}
							/>
						</div>
				</GanttBarr>
			{/each}
		{:else}
			{#each data as item, i}
				<GanttBarr
					vals={getMinMax(item)}
					bounds={[mintime, maxtime]}
					label={label(item)}
					details={sublabel(item)}
					{gridcols}
					bg={getColor(item)}
					rows={1}
				/>
			{/each}
		{/if}
	</div>
</div>

<style>
	.overgrid {
		display: grid;
		grid-template-columns: repeat(500, minmax(0, 1fr));
		grid-auto-flow: column;
		/* grid-auto-rows: 22px; */
	}
</style>
