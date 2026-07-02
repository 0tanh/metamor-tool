import type { AllContext, ComparisonConfig, PreferenceContext } from "../lib/PreferenceTypes"
import { render } from "./build"
import { NotesConfig } from "../lib/PreferenceTypes"
import type { NotesConfigType } from "../lib/PreferenceTypes"

/**
 * 
 * @param compareCtx Comparison context
 * @param prefCtx Preference Context
 * @returns the rendered config reader
 */
export function configRender(config: ComparisonConfig): string{   
    
    const notesButton = Object.keys(NotesConfig)
    .map((icon)=>{
      const iconString = String(icon);
      const isActive = config.notes_config === NotesConfig[icon as keyof typeof NotesConfig];
      const activeClass = isActive ? "NotesButton active" : "NotesButton";
      return `
      <button 
        class= ${activeClass}
        id="${iconString}Button" 
        >${iconString}
      </button>
    `}
    ).join("");
    
    const output = ` 
      <section id='config'>
        <h1>Config</h1>
        <label> Whats your name? <br>
            <input type='text' id='nameInput'></input>
            <button id='submitName' type='button'>Submit Name</button>
        </label>
        <br>
        <label>Maximum Acceptable Misalignment? <input id='misalignConfig' type='number' min="0" max="5"></input></label>
        <br>
        <label>Show full breakdown? <input id='showFullBreakdown'type="checkbox" ${config.show_full ? 'checked': ''}></label>
        <br>
        <label>Show pain points? <input id='showPainPoints' type="checkbox"  ${config.show_pain_points ? 'checked': ''} ></label>
        <br>
        <label>Show perfect matches? <input id='showPerfectMatches' type="checkbox"  ${config.show_perfect_matches ? 'checked': ''}></label>
        <br>
        <label>Show uncomparable? <input id='showUncomparable'type="checkbox"  ${config.show_uncomparable ? 'checked': ''}></label>
        <br>
        <label>Select what kind of notes you would like to see <br>${notesButton}</label>
      </section>
    `
    return output
}


function handleMisalignmentSelection(section: HTMLInputElement, allCtx: AllContext){
  const input = section.querySelector('#misalignConfig') as HTMLInputElement
  allCtx.comparisonContext.config.max_acceptable_misalign = input.valueAsNumber
  render(allCtx)
}

/**
 * Make the full breakdown section button work
 * @param section 
 * @param allCtx 
 */
function handleFullBreakdown(section: HTMLElement, allCtx: AllContext){
  const config = allCtx.comparisonContext.config
  const input = section.querySelector('#showFullBreakdown') as HTMLInputElement
  config.show_full = input.checked
  render(allCtx)
}
/**
 * Make the show pain points button work
 * @param section 
 * @param allCtx 
 */
function handleShowPainPoints(section: HTMLElement, allCtx: AllContext){
  const config = allCtx.comparisonContext.config
  const input = section.querySelector('#showPainPoints') as HTMLInputElement
  config.show_pain_points = input.checked
  render(allCtx)
}

/**
 * Make the perfect Matches pain points button work
 * @param section 
 * @param allCtx 
 */
function handleShowPerfectMatches(section: HTMLElement, allCtx: AllContext){
  const config = allCtx.comparisonContext.config
  const input = section.querySelector('#showPerfectMatches') as HTMLInputElement
  config.show_perfect_matches = input.checked
  render(allCtx)
}

/**
 * Make the show uncomparable button work
 * @param section 
 * @param allCtx 
 */
function handleShowUncomparable(section: HTMLElement, allCtx: AllContext){
  const config = allCtx.comparisonContext.config
  const input = section.querySelector('#showUncomparable') as HTMLInputElement
  config.show_uncomparable = input.checked
  render(allCtx)
}
/**
 * Handle the name input section
 * @param section 
 * @param allCtx 
 */
function handleName(section: HTMLElement, allCtx: AllContext){
  const ctx = allCtx.preferenceContext
  const input = section.querySelector('#nameInput') as HTMLInputElement
  ctx.currentPreferenceProfile.metamorName = input.value
  render(allCtx)
}

/**
 * The Note you have chosen is saved to the state
 * @param chosenNote The chosen icon
 * @param ctx the current preference context
 */
function handleNotes(chosenNote: NotesConfigType, allctx: AllContext){
  const ctx = allctx.comparisonContext.config
  ctx.notes_config = chosenNote
  render(allctx)
}
/**
 * Activate all the callbacks for which kinds of notes you want to see
 * @param section takes in the section where the config lives and maps functionality to all buttons
 * @param ctx the preference context
 */
export function makeNotesSelectionWork(section: HTMLElement, allCtx: AllContext){
  Object.keys(NotesConfig).forEach((icon)=>{
       
      const iconString = String(icon)
      const notesSelector = `#${iconString}Button`
      let notesText = section.querySelector(notesSelector) as HTMLInputElement
      
      const handleIconDynamic = () => {
        const chosenIconValue = NotesConfig[icon as keyof typeof NotesConfig];
        handleNotes(chosenIconValue, allCtx)
      }      
      section.querySelector(notesSelector)?.addEventListener("click", handleIconDynamic)
    })
}

export function makeConfigWork(section: HTMLElement, allCtx: AllContext){
  section.querySelector("#nameInput")?.addEventListener('keydown', ({key, preventDefault}: KeyboardEvent)=>{
    if (key ==="Enter"){
      preventDefault()
      handleName(section, allCtx)
    }
  })
  // Figure out how to access this info ??? 
  section.querySelector("#nameInput")?.addEventListener('submit', ({key, preventDefault}: KeyboardEvent)=>{
    if (key ==="Enter"){
      preventDefault()
      handleName(section, allCtx)
    }
  })
  section.querySelector("#submitName")?.addEventListener("click", () => handleName(section, allCtx))
  section.querySelector("#showFullBreakdown")?.addEventListener("change", () => handleFullBreakdown(section, allCtx))
  section.querySelector("#showPainPoints")?.addEventListener("change", () => handleShowPainPoints(section,  allCtx))
  section.querySelector("#showPerfectMatches")?.addEventListener("change", () => handleShowPerfectMatches(section, allCtx))
  section.querySelector("#showUncomparable")?.addEventListener("change", () => handleShowUncomparable(section, allCtx))
  section.querySelector("#misalignConfig")?.addEventListener("submit", ()=>handleMisalignmentSelection(section, allCtx))
  
}