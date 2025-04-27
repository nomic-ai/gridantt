<script lang="ts">

  
	import GanttChart from '$lib/GanttChart.svelte';
	import { range } from 'd3-array';
  const { data } = $props();

  let yearCutoff = $state("1600");
	let search = $state('');


  let biographies = $derived(data.biographies.map(d => ({
    ...d,
    first_letter: d.name.slice(0, 1)
  })).filter(d => d.birthDate > yearCutoff).map(d => ({
    ...d,
    area: d.areaOfInfluence.major,
    minor: d.areaOfInfluence.minor
  })))
  // Dumb scale written without internet.
  const colors = new Map();
  const scheme = [
    "#6C8EBF",  // Soft Blue
    "#A3C586",  // Gentle Green
    "#F4C27A",  // Muted Orange
    "#E2908A",  // Soft Red
    "#B58EBF",  // Dusty Purple
    "#89C7B6",  // Misty Teal
    "#F2E394",  // Pale Yellow
    "#C1C1C1"   // Light Gray
  ]

  function colorScale(f) {
    if (colors.get(f)) {
      return colors.get(f)
    }
    const color = scheme[colors.size % scheme.length]
    colors.set(f, color);
    return color;
  }

  function dFormat(date: string): Date {
    return new Date(date.replace("-00-00", "-06-06").replace("-00", "-01"))
  }
	function getMinMax(d) {
		const r = [dFormat(d.birthDate), dFormat(d.deathDate)] as [Date, Date];
		return r;
	}
  let color = $state<'gender' | 'race' | 'area'>('gender');

  function match(d: string | object | null | undefined, search: string): boolean {
    if (!d) {
      return false
    }
    if (typeof d === 'string') {
      return d.toLowerCase().includes(search.toLowerCase())
    }
    if (typeof d === 'object') {
      return Object.values(d).some(v => match(v, search))
    }
    return false
  }

  let groupings = $state<string[]>(['area', 'minor'])


</script>
<div class="header" style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
  <span>People identified in <a href="https://trumpwhitehouse.archives.gov/presidential-actions/executive-order-building-national-garden-american-heroes/">Executive Order 13978</a>
  to have lifesize statues in the "National Garden of American Heroes."</span>
  <div style="display: flex; gap: 1rem; align-items: center; justify-content: space-between;">
  <div class="search">
    <label for="search">Filter by text</label>
    <input id="search" type="text" bind:value={search} />
  </div>
  <div class="year">
    <form>
      <label for="min-year">Minimum Year</label>
      <input id="min-year" type="string" bind:value={yearCutoff} />
    </form>
  </div>
  <div class="color">
    <label for="color">Color by</label>
    <select id="color" bind:value={color}>
      <option value="gender">Gender</option>
      <option value="race">Race</option>
      <option value="area">Area of Influence</option>
    </select>
  </div>
<div style="display: flex; flex-direction: row; gap: 0.2rem; align-items: center;">
  <span>Group by</span>
    <div class="groupings" style="display: flex; flex-direction: column; gap: 0.2rem; align-items: center;">
    {#each range(groupings.length) as i}
      <div style="display: flex; gap: 0.2rem; align-items: center;">
        <select bind:value={groupings[i]}>
          <option value="gender">Gender</option>
        <option value="race">Race</option>
        <option value="area">Area of Influence</option>
          <option value="minor">Secondary Area of Influence</option>
        </select>
        <button on:click={() => groupings = groupings.filter((g, j) => j !== i)}>X</button>
      </div>
    {/each}
    <button on:click={() => groupings.push(groupings[groupings.length - 1])}>Add</button>
  </div>
</div>
</div>
</div>
<div class="content"> 
<div>
		<GanttChart
			data={biographies.filter((d) => match(d, search))}
			sort={true}
			{getMinMax}
      getColor={d => colorScale(d[color])}
			label={(d) => d.name}
      sublabel={(d) => (d.birthDate.slice(0, 4) + "–" + d.deathDate.slice(0, 4) + ". " + d.notableFor)}
			groupings={groupings.map(g => ((d) => d[g]))}
		/>
	</div>
</div>

<style>
  .header {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 100;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .content {
    padding-top: 1rem;
  }
</style>
