import '../style.css'
import { NotesConfig, PreferenceIcon } from '../lib/PreferenceTypes';
import type { Preference, PreferenceProfile, PreferenceContext, PreferenceIconType, ComparisonConfig, ComparisonContext, AllContext } from '../lib/PreferenceTypes';
import { configRender, makeConfigWork, makeNotesSelectionWork } from './config';

const metamor_default_URL = "http://localhost:3000"

const defaultMetamor = await fetch(metamor_default_URL)
const data = await defaultMetamor.json();

/**
 * Initially loaded context for selecting a preference
 */
const prefCtx: PreferenceContext = {
  currentPrefNumber: 0,
  currentPref: data.prefs[0],
  currentPrefIcon: null,
  prefSize: data.prefs.length,
  currentPreferenceProfile: {
    metamorName: "",
    metamorPrefs: data.prefs.map((p: Preference)=>{
      const thisIcon = p.iconValue == "" ? null : p.iconValue
      const asPref: Preference = {name: p.name , iconValue: thisIcon, note: p.note};
      return asPref
    })
  }
}

const uploadCtx = {
    currentMetamorNumber : 0,
    toCompare : []
}

const config:ComparisonConfig = {
    max_acceptable_misalign : 2, 
    show_full: false,
    notes_config : NotesConfig.ALL_NOTES,
    show_pain_points : true, //These are points that are diametrically opposed
    show_perfect_matches : false, //These match perfectly
    show_uncomparable : false
}
const comparisonCtx:ComparisonContext = {
    allComparisonUnits: [],
    config : config
}

export const allCtx: AllContext = {
  preferenceContext : prefCtx,
  comparisonContext : comparisonCtx, 
  uploadContext : uploadCtx
}


/**
 * String is taken to kebab case
 * @param s string being kebab cased
 * @returns kebab clase string
 */
function kebabCase(s: string){
  return s.replaceAll(" ","-")
          .replaceAll("/","-")
          .replaceAll(",","-")
          .replaceAll(".","-")
          .replaceAll("(","-")
          .replaceAll(")","-")
          .replaceAll("&", "and")
          .replaceAll("'", "")
          .replaceAll("+","plus")
}

// Function to download a text file from the browser
function downloadPrefs(ctx:PreferenceContext) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ctx.currentPreferenceProfile)));
  element.setAttribute('download', ctx.currentPreferenceProfile.metamorName+`-Prefs.json`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


/**
 * This takes in a preference and wraps it in a bunch of input button so you can choose your relationship with it
 * @param pref the preference being wrapped
 * @param ctx the context of your previously selected options
 * @returns all the necessary inputs 
 */
function buttonData(pref: Preference){
  const prefButtonsFunctional = Object.keys(PreferenceIcon)
    .map((icon)=>{
      const iconString = String(icon);
      const nameKebab = kebabCase(pref.name)
      return `
      <button 
        id="${nameKebab}${iconString}Button" 
        class="prefButton" 
        >${iconString}
      </button>
    `}
    ).join("");
  const kebabName =  kebabCase(pref.name)
  const onePrefInputs  = 
  `
  <section class="preferenceInputs">
    ${prefButtonsFunctional}
    <br>
    <label> Optional personal notes on this preference <br>
      <textarea name="${kebabName}Notes" id="${kebabName}Notes" placeholder="Optional Notes"></textarea>
    </label>
    <br>
    <button id=${kebabName}NotesSubmit class="">Submit</button>
  </section>
  `;
  return onePrefInputs
}

/**
 * Takes in the current context and adds mapping for all preferences to all buttons
 * @param ctx the current context being evaluated
 */
function makeIconButtonsWork(section: HTMLElement, allctx: AllContext){
  const ctx = allctx.preferenceContext
  Object.keys(PreferenceIcon).forEach((icon)=>{
       
      const iconString = String(icon)
      const nameKebab = kebabCase(ctx.currentPref.name)
      const notesSelector = `#${nameKebab}Notes`
      let notesText = section.querySelector(notesSelector) as HTMLInputElement
      
      const fullSelector = `#${nameKebab}${iconString}Button`
      
      const notesSubmitSelector = `#${nameKebab}NotesSubmit`

      const handleSubmit = () => {
        ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].note = notesText.value;
        render(allctx)
      }
      
      const handleIconDynamic = () => {
        const chosenIconValue = PreferenceIcon[icon as keyof typeof PreferenceIcon];
        handleIcon(chosenIconValue, allctx)
      }      
      section.querySelector(fullSelector)?.addEventListener("click", handleIconDynamic)
      section.querySelector(notesSubmitSelector)?.addEventListener("click", handleSubmit)
    })
}
/**
 * Submit a note
 * @param notesValue 
 * @param allctx 
 */
function handleNotesSubmit(notesValue: string, allctx: AllContext){
  const ctx = allctx.preferenceContext
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].note = notesValue;
  render(allctx)
}
/**
 * The Icon You have chosen is saved to the state
 * @param chosenIcon The chosen icon
 * @param ctx the current preference context
 */
function handleIcon(chosenIcon: PreferenceIconType, allctx: AllContext){
  const ctx = allctx.preferenceContext
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].iconValue = chosenIcon;
  render(allctx)
}

/**
 * Adds context specific functionality for navigating between inputs
 * @param preferenceWithInputs the preference you have picked with its associated inputs
 */
function preferenceMeta(preferenceWithInputs:string,){
  const onePrefInputs  = 
  `
  ${preferenceWithInputs}
  <section>
  <section>
  <button class="prefBackNav"> Back </button>
  <button class="prefClear"> Clear </button>
  <button class="prefForwardNav"> Next </button>
  `;  
  return onePrefInputs
}
/**
 * Takes in the current context and rerenders the context for the previous page
 * @param ctx the scoped context
 */
function handleBack(allctx: AllContext){
  const ctx = allctx.preferenceContext
  ctx.currentPrefNumber =  ctx.currentPrefNumber <= 0 ? 0: ctx.currentPrefNumber - 1
  render(allctx)
}

/**
 * Takes in the current context and rerenders the context for the next page
 * @param ctx the scoped context
 */
function handleForward(allctx: AllContext){
  const ctx = allctx.preferenceContext
  ctx.currentPrefNumber = ctx.currentPrefNumber <= ctx.prefSize ? ctx.currentPrefNumber + 1 : ctx.currentPrefNumber
  render(allctx)
}
/**
 * The current preference context for the option that the user is on is cleared
 * @param ctx the scoped context
 */
function handleClear(allctx: AllContext){
  const ctx = allctx.preferenceContext
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].iconValue = null;
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].note = ""
  render(allctx)
}

/**
 * Add callbacks to the buttons required for navigation in the scope of the current interface
 * @param ctx current Preference context
 */
function makeNavButtonsWork(section: HTMLElement, ctx: AllContext){
  
  section.querySelector(".prefClear")?.addEventListener("click", () => handleClear(ctx))  
  
  section.querySelector(".prefBackNav")?.addEventListener("click", () => handleBack(ctx))  
  
  section.querySelector(".prefForwardNav")?.addEventListener("click", () => handleForward(ctx))
}

/**
 * This binds global shortcuts for interacting with this webbed site
 * @param ctx the preference context of everything else
 */
function globalShortcuts(ctx: AllContext){
  document.addEventListener("keydown", function (e) {
    const event = e as KeyboardEvent
    switch (event.key){
      case "ArrowUp": 
      case "ArrowLeft": 
        handleBack(ctx)
        break
      
      case "ArrowDown": 
      case "ArrowRight": 
        handleForward(ctx)
        break
      
      case "Enter":
        const nameKebab = kebabCase(ctx.preferenceContext.currentPref.name)
        const notesSelector = `#${nameKebab}Notes`
        let notesText = document.querySelector(notesSelector) as HTMLInputElement
        handleNotesSubmit(notesText.value, ctx)
        break

      case "0":
        handleClear(ctx)
        break
      case "1":
        handleIcon(PreferenceIcon.OFF_LIMIT, ctx)
        break 
      case "2":
        handleIcon(PreferenceIcon.PREFER_NOT, ctx)
        break 
      case "3":
        handleIcon(PreferenceIcon.MAYBE, ctx)
        break
      case "4":
        handleIcon(PreferenceIcon.PREFER, ctx)
        break
      case "5":
        handleIcon(PreferenceIcon.MUST, ctx)
        break
      default : console.log(event.key);
    }
  })    
}

/**
 * Clear the current context 
 * @param prefCtx the current preference context
 */
function clearAllPrefs(allCtx: AllContext){
  const prefCtx = allCtx.preferenceContext;
  const old_prof = prefCtx.currentPreferenceProfile
  const emptyPrefs = old_prof.metamorPrefs.map((pref)=>{
    const nex_p: Preference = {
      iconValue: null,
      name: pref.name,
      note: pref.note
    }
    return nex_p
  })

  const empty_profile: PreferenceProfile = {
    metamorName: old_prof.metamorName,
    metamorPrefs: emptyPrefs,
    metamorPrefsByCategory : old_prof.metamorPrefsByCategory,
    date: old_prof.date
  }
  
  const empty_ctx: PreferenceContext = {
    currentPref : prefCtx.currentPref,
    currentPreferenceProfile : empty_profile,
    currentPrefIcon : null,
    currentPrefNumber : prefCtx.currentPrefNumber,
    prefSize : prefCtx.prefSize
  }
  allCtx.preferenceContext = empty_ctx
  console.log(allCtx)
  render(allCtx)
}

/**
 * Takes in the current context of a preferenceSelection and loads it in
 * @param prefCtx the context in which the selection is being loaded in
 */
export function render(ctx: AllContext){
  const prefCtx = ctx.preferenceContext;
  const compCtx = ctx.comparisonContext;

  const prefs: Preference[] = prefCtx.currentPreferenceProfile.metamorPrefs;
  prefCtx.currentPref = prefs[prefCtx.currentPrefNumber]
  
  const prefList = prefs.map((p: Preference)=>{
    const nameKebab = p.name.replaceAll(" ", "-")
    return `
      <section class="preferenceCard" id="${nameKebab}Card">
      <p id="plainTextPref${nameKebab}">${p.name}</p>
      ${preferenceMeta(buttonData(p))}
      </section>
    `})
  
  const current: Preference = prefs[prefCtx.currentPrefNumber]
  const currentMatch = current.iconValue == null ?`You have not selected a preference for this yet` : `${current.name} has an icon of ${Object.keys(PreferenceIcon)[current.iconValue-1]}`
  const notes = `${current.note}`
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  app.innerHTML = `
      ${configRender(compCtx.config, prefCtx)}
      <section id='prefSelectionPanel'>
      <h1>Build</h1>
      ${prefCtx.currentPreferenceProfile.metamorName == '' ? '' :"<h2>"+prefCtx.currentPreferenceProfile.metamorName+"'s preference Profile: </h2>"}
      <section id="preferenceSelection">
        ${prefList[prefCtx.currentPrefNumber]}
      </section>
      <sub>${currentMatch}</sub>

      ${notes == ''?'':`<br><sub>You added this comment: <br> <span> ${notes} </span> </sub>`}
      
      <br>
      <button id=clearAllPrefs>Clear all prefs</button>      
      <button id=downloadPrefs>Download your prefs</button>
      <sub>${prefCtx.currentPrefNumber +1}/${prefCtx.prefSize}</sub>
    </section>
    `;

  app.querySelectorAll<HTMLElement>(".preferenceCard").forEach((section)=>{
    makeNavButtonsWork(section, ctx)
    makeIconButtonsWork(section, ctx)
  })
  makeConfigWork(app, ctx)
  makeNotesSelectionWork(app, ctx)
  app.querySelector('#downloadPrefs')?.addEventListener("click", () => downloadPrefs(prefCtx))
  app.querySelector('#clearAllPrefs')?.addEventListener("click", () => clearAllPrefs(ctx))
}
globalShortcuts(allCtx)
render(allCtx)
