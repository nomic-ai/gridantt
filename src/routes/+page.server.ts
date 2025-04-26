import americans from '$lib/americans.json?raw'

export const load = async () => {
  return {
    biographies: JSON.parse(americans)
  }
  //return {biographies: biographies.filter(d => d.born_min > 0)}
}
