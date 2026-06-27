import type { ComparisonConfig, PreferenceContext } from "../lib/PreferenceTypes"
import { render } from "./build"
import { NotesConfig } from "../lib/PreferenceTypes"
import type { NotesConfigType } from "../lib/PreferenceTypes"



function configRender(compareCtx: ComparisonConfig, prefCtx: PreferenceContext): string{  
    const output = ` 
      <section id='config'>
        <h1>Config</h1>
        <label> Whats your name? <br>
        <input type='text' id='nameInput'></input>
        <button id='submitName' type='button'>Submit Name</button>
      </label>
    `
    return output
}

function handleName(section: HTMLElement, ctx: PreferenceContext){
  const input = section.querySelector('#nameInput') as HTMLInputElement
  ctx.currentPreferenceProfile.metamorName = input.value
  render(ctx)
}

function makeConfigWork(section: HTMLElement, ctx: PreferenceContext){
  section.querySelector("#submitName")?.addEventListener("click", () => handleName(section, ctx))
  
  section.querySelector("#submitName")?.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default browser actions if needed
      handleName(section, ctx);
    }
  });
}