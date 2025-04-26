<script lang="ts">

  
	import GanttChart from '$lib/GanttChart.svelte';
  const { data } = $props();
  const biographies = $derived(data.biographies.map(d => ({
    ...d,
    first_letter: d.name.slice(0, 1)
  })))
  // Dumb scale written without internet.
  const colors = new Map();
  function colorScale(f) {
    if (colors.get(f)) {
      return colors.get(f)
    }
    let color = '#'
    for (const i in [1,2,3]) {
      const num = '0123456789ABCDEF'
      const x = Math.floor(Math.random() * num.length)
      color += num.slice(x, x+1)
    }    
    colors.set(f, color);
    return color;
  }

  $inspect(biographies)

	let search = $state('');

  function dFormat(date: string): Date {
    return new Date(date.replace("-00-00", "-06-06").replace("-00", "-01"))
  }
	function getMinMax(d) {
    console.log(d)
		const r = [dFormat(d.birthDate), dFormat(d.deathDate)] as [Date, Date];
		return r;
	}
</script>

<div class="search">
	<input type="text" bind:value={search} />
</div>
<div>
		<GanttChart
			data={biographies.filter((d) => d.name.match(search))}
			sort={true}
			{getMinMax}
      getColor={d => colorScale(d.gender)}
			label={(d) => d.name}
      sublabel={(d) => d.notableFor}
			groupings={[(d => d.areaOfInfluence.major), (d => d.areaOfInfluence.minor)]}
		/>
</div>

<style>
	.search {
		position: sticky;
	}
</style>
