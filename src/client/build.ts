import '../style.css'
import { PreferenceIcon } from '../lib/PreferenceTypes';
import type { Preference, PreferenceProfile, PreferenceContext, PreferenceIconType } from '../lib/PreferenceTypes';
const metamor_default_URL = "http://localhost:3000"

const defaultMetamor = await fetch(metamor_default_URL)
const data = await defaultMetamor.json();

/**
 * Initially loaded context for selecting a preference
 */
let ctx: PreferenceContext = {
  currentPrefNumber: 0,
  currentPref: data.prefs[0],
  currentPrefIcon: null,
  prefSize: data.prefs.length,
  currentPreferenceProfile: {
    metamorName: "foobar",
    metamorPrefs: data.prefs.map((p: Preference)=>{
      const thisIcon = p.iconValue == "" ? null : p.iconValue
      const category = p.category == null ? "": p.category
      const asPref: Preference = {name: p.name , iconValue: thisIcon, note: p.note, category};
      return asPref
    })
  }
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
function makeIconButtonsWork(section: HTMLElement, ctx: PreferenceContext){
    Object.keys(PreferenceIcon).forEach((icon)=>{
      
      const iconString = String(icon)
      const nameKebab = kebabCase(ctx.currentPref.name)
      const notesSelector = `#${nameKebab}Notes`
      let notesText = section.querySelector(notesSelector) as HTMLInputElement
      
      const fullSelector = `#${nameKebab}${iconString}Button`
      
      const notesSubmitSelector = `#${nameKebab}NotesSubmit`

      const handleSubmit = () => {
        ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].note = notesText.value;
        render(ctx)
      }
      
      const handleIconDynamic = () => {
        const chosenIconValue = PreferenceIcon[icon as keyof typeof PreferenceIcon];
        handleIcon(chosenIconValue, ctx)
      }      
      section.querySelector(fullSelector)?.addEventListener("click", handleIconDynamic)
      section.querySelector(notesSubmitSelector)?.addEventListener("click", handleSubmit)
    })
}

function handleSubmit(notesValue: string, ctx: PreferenceContext){
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].note = notesValue;
  render(ctx)
}
/**
 * The Icon You have chosen is saved to the state
 * @param chosenIcon The chosen icon
 * @param ctx the current preference context
 */
function handleIcon(chosenIcon: PreferenceIconType, ctx: PreferenceContext){
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].iconValue = chosenIcon;
  render(ctx)
}

/**
 * Adds context specific functionality for navigating between inputs
 * @param preferenceWithInputs the preference you have picked with its associated inputs
 */
function preferenceMeta(preferenceWithInputs:string){
  const onePrefInputs  = 
  `
  ${preferenceWithInputs}
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
function handleBack(ctx: PreferenceContext){
  ctx.currentPrefNumber =  ctx.currentPrefNumber <= 0 ? 0: ctx.currentPrefNumber - 1
  render(ctx)
}

/**
 * Takes in the current context and rerenders the context for the next page
 * @param ctx the scoped context
 */
function handleForward(ctx: PreferenceContext){
  ctx.currentPrefNumber = ctx.currentPrefNumber <= ctx.prefSize ? ctx.currentPrefNumber + 1 : ctx.currentPrefNumber
  render(ctx)
}
/**
 * The current preference context for the option that the user is on is cleared
 * @param ctx the scoped context
 */
function handleClear(ctx: PreferenceContext){
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].iconValue = null;
  ctx.currentPreferenceProfile.metamorPrefs[ctx.currentPrefNumber].note = ""
  render(ctx)
}

/**
 * Add callbacks to the buttons required for navigation in the scope of the current interface
 * @param ctx current Preference context
 */
function makeNavButtonsWork(section: HTMLElement, ctx: PreferenceContext){
  
  section.querySelector(".prefClear")?.addEventListener("click", () => handleClear(ctx))  
  
  section.querySelector(".prefBackNav")?.addEventListener("click", () => handleBack(ctx))  
  
  section.querySelector(".prefForwardNav")?.addEventListener("click", () => handleForward(ctx))
}

/**
 * This binds global shortcuts for interacting with this webbed site
 * @param ctx the preference context of everything else
 */
function globalShortcuts(ctx: PreferenceContext){
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
        const nameKebab = kebabCase(ctx.currentPref.name)
        const notesSelector = `#${nameKebab}Notes`
        let notesText = document.querySelector(notesSelector) as HTMLInputElement
        handleSubmit(notesText.value, ctx)
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
 * Takes in the current context of a preferenceSelection and loads it in
 * @param ctx the context in which the selection is being loaded in
 */
function render(ctx: PreferenceContext){
  
  const prefs: Preference[] = ctx.currentPreferenceProfile.metamorPrefs;
  ctx.currentPref = prefs[ctx.currentPrefNumber]
  
  const prefList = prefs.map((p: Preference)=>{
    const nameKebab = p.name.replaceAll(" ", "-")
    return `
      <section class="preferenceCard" id="${nameKebab}Card">
      <p id="plainTextPref">${p.name}</p>
      ${preferenceMeta(buttonData(p))}
      </section>
    `})
  
  const current: Preference = prefs[ctx.currentPrefNumber]
  const currentMatch = current.iconValue == null ?`You have not selected a preference for this yet` : `${current.name} has an icon of ${Object.keys(PreferenceIcon)[current.iconValue-1]}`
  const notes = `${current.note}`
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  app.innerHTML = 
    `<section id='prefSelectionPanel'>
      <h1>Build</h1>
      <section id="preferenceSelection">
        ${prefList[ctx.currentPrefNumber]}
      </section>
      <sub>${currentMatch}</sub>

      ${notes == ''?'':`<br><sub>You added this comment: <br> <span> ${notes} </span> </sub>`}
      
      <br>
      
      <button id=downloadPrefs>Download your prefs</button>
      <sub>${ctx.currentPrefNumber +1}/${ctx.prefSize}</sub>
    </section>
    `;

  app.querySelectorAll<HTMLElement>(".preferenceCard").forEach((section)=>{
    makeNavButtonsWork(section, ctx)
    makeIconButtonsWork(section, ctx)
  })

  app.querySelector('#downloadPrefs')?.addEventListener("click", () => downloadPrefs(ctx))
}
globalShortcuts(ctx)
render(ctx)
