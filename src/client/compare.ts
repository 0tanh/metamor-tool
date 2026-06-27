import { type PreferenceProfile, type ComparisonConfig, type NotesConfigType, NotesConfig, type ComparisonUnit, type ComparisonContext, type MetamorIconMap, type Preference, type UploadContext, PreferenceIcon } from '../lib/PreferenceTypes'

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
const ctx:ComparisonContext = {
    allComparisonUnits: [],
    config : config
}
/**
 * Given the comparison context, render all comparison units
 * @param ctx the current comparison context
 * @returns the rendered string
 */
function render_full(ctx: ComparisonContext): string{
    const all_units = ctx.allComparisonUnits.map((unit)=>{
        const name = unit.prefName;
        console.log(unit)
        const metamorIconMap = unit.metamorIconMap
        const singleUnitOut = `
        <h3 id="${name}ComparisonUnitPref" class="comparisonUnit">${name}</h3>
        <section id="${name}ComparisonMetamorMap">
            ${metamorIconMap.map(
                (map)=>{
                    return `
                    <p>
                    ${map.metamorName} => ${Object.keys(PreferenceIcon)[map.icon-1]}
                    </p>
                    `}
                ).join('')
            }
        </section>
        `
        return singleUnitOut
    }).join("")
    
    const output =  `
    <h2 class='comparisonSection'>Full Breakdown</h2>
    ${all_units
    }
    `
    return output
}
/**
 * Takes in the maximum acceptable misalignment and renders the misalignment
 * @param max_acceptable_misalign the maximum amount of allowed misalignment
 * @param ctx the Comparison Context
 * @returns the html to render as a string
 */
function renderMisalign(max_acceptable_misalign: number, ctx: ComparisonContext){
    const misAlign = ctx.allComparisonUnits.filter((v)=>{
        const minimum = Math.min(...v.metamorIconMap.map((m)=>m.icon.valueOf()))
        const max = Math.max(...v.metamorIconMap.map((m)=>m.icon.valueOf()))
        const diff = max - minimum;
        return diff >= max_acceptable_misalign
    }).map((compU)=>{
        const formattedMap =`
            ${compU.metamorIconMap.map((cu)=>{
                const wordForIcon = Object.keys(PreferenceIcon)[cu.icon.valueOf() -1] 
                const metaIcon = `
                    <p> ${cu.metamorName} => ${wordForIcon}</p>
                    
                    `
                return metaIcon
            }).join('')
            }
        `
        
        const formatted =`
            <h3>${compU.prefName}</h3>
            <p>${formattedMap}</p>
        `
        return formatted
    }).join('')
    
    const output = `
    <h2 class='comparisonSection'> Misalignment Breakdown</h2>
    <p>${misAlign}</p>
    
    `
    return output
}

function render_notes(notesConfig: NotesConfigType, ctx: ComparisonContext){
    const output = `
    <h2 class='comparisonSection' >Notes</h2>
    `
    return output
}
/**
 * Renders all the points where two people's beliefs are diametrically opposed
 * @param ctx Comparison context
 * @returns 
 */
function render_pain_points(ctx: ComparisonContext){
    const pain_point = ctx.allComparisonUnits.filter((compUnit)=>{
        const mapList = compUnit.metamorIconMap
        const min = mapList.filter((unit)=>{
            const min = unit.icon.valueOf() == 1
            return min
        })
        const max = mapList.filter((unit)=>{
            const max = unit.icon.valueOf() == Object.keys(PreferenceIcon).length
            return max
        })
        return min.length > 0 && max.length > 0
    }).map((compUnit)=>{
        const multiMetamor = `
        <p> These metamors are diametrically opposed on this issue </p>
            ${compUnit.metamorIconMap.map((p)=>{
                const output = `<p>${p.metamorName}</p>`
                return output
            }).join('')} 

        `
        const output = `
            <p>${compUnit.prefName}</p>
            ${compUnit.metamorIconMap.length > 2 ? multiMetamor : ''}
        `
        return output
    }).join('')
    const output=  `
        <h2 class='comparisonSection'> pain_points </h2>
        ${pain_point}

    `
    return output
}

function render_perfect_matches(ctx: ComparisonContext){
    const perfectMatches = ctx.allComparisonUnits
        .filter((cu)=>{
            const iconMapList = cu.metamorIconMap;
            const first = cu.metamorIconMap[0]?.icon.valueOf()
            const cleaned = iconMapList.filter((metamorMap)=> {return metamorMap.icon.valueOf() == first})
            return cu.metamorIconMap.length == cleaned.length
        })
        .map((cu)=>{
            const normalName = Object.keys(PreferenceIcon)[cu.metamorIconMap[0]?.icon.valueOf()]
            const formatted =`
                <p>${cu.prefName} => ${normalName}</p>
            `
            return formatted
        })
        .join('')
    const output = `
        <h2 class='comparisonSection'>perfect matches</h2>
        <p>${perfectMatches}</p>
        `
    return output
}

function render_uncomparable(all_uncomparable_perfs: {metamorName :string, unmatchedPref: Preference }[], ctx: ComparisonContext){
    const output = `<h2 class='comparisonSection'>all uncomparable </h2>`
    return output
}
/**
 * Takes in a preference profile and returns a smaller preference profile with only 
 * non null preferences
 * @param profile the profile to be reduced
 * @returns a smaller profile
 */
function reduceToNonNullPreferences(profile: PreferenceProfile){
    const reduced_profile: PreferenceProfile = {
        metamorName : profile.metamorName,
        date : profile.date,
        metamorPrefs : profile.metamorPrefs.filter((pref)=>{
            return pref.iconValue != null
        })
    }
    return reduced_profile
}
/**
 * Given the smallest Preference Profile, find all comparison units that are true across all provided profiles
 * @param smallest take in the smallest preference profile from context
 * @param cleanedCompare null cleaned Preference Profiles
 * @returns mapped comparisons across all available preferences
 */
function findAllComparisonUnits(smallest: PreferenceProfile, cleanedCompare: PreferenceProfile[]): ComparisonUnit[]{
    const outputUnits: ComparisonUnit[] = []
    // Create comparsions based on the smallest comparison available
    for (const pSmall of smallest?.metamorPrefs){
        const currentPrefName = pSmall.name;
        //Checks if this preference is in all profiles
        const available_in_all_profiles: boolean = cleanedCompare.every((profile)=>{
            return profile.metamorPrefs.some((p)=>p.name == currentPrefName)
        })
    
        //if not, coninutes early 
        if (!available_in_all_profiles){
            continue
        }
    
        const firstIconMap: MetamorIconMap = {
            metamorName: smallest.metamorName,
            icon: pSmall.iconValue
        }

        let currentPref: ComparisonUnit = {
            prefName : currentPrefName,
            metamorIconMap : [firstIconMap]
        }
        for (const profile of cleanedCompare){
            if (profile.metamorName === smallest.metamorName){
                continue
            }

            const found = profile.metamorPrefs.find((p)=>p.name == currentPrefName)
            
            if (found == undefined) {
                console.error(`filtering was imperfect. ${profile.metamorName}'s profile did not contain ${currentPrefName}`)
                continue
            }
            
            const thisMap: MetamorIconMap = {
                metamorName : profile.metamorName,
                icon : found?.iconValue
            }
            currentPref.metamorIconMap.push(thisMap)
            
        }
        outputUnits.push(currentPref)
    
    }
    return outputUnits

}

/**
 * This function takes in an array of profiles and returns out a comparison context
 * @param toCompare the arrays being compared
 * @param config the configuration of the comparion
 * @returns 
 */
function compareProfilesToContext(toCompare: PreferenceProfile[], config: ComparisonConfig): ComparisonContext{
    if (toCompare.length < 2){
        throw new Error("You need more than one profile to create a comparison")
    } else {
        const cleanedCompare = toCompare.map(reduceToNonNullPreferences)

        let smallest = cleanedCompare[0]
        let biggest = cleanedCompare[0]
        for (const p of cleanedCompare){
            biggest = p.metamorPrefs.length > biggest?.metamorPrefs.length ? p : biggest
            smallest = p.metamorPrefs.length < smallest?.metamorPrefs.length ? p : smallest
        }
        const concrete_smallest = smallest == undefined ? {} : smallest
        const compCtx:ComparisonContext = {
            allComparisonUnits: findAllComparisonUnits(concrete_smallest, cleanedCompare),
            config : config
        } 

        return compCtx
    }
}
/**
 * Run the analysis based on the current upload and comparison contexts
 * @param uploadCtx the current upload context
 * @param comparisonCtx the current comparison context
 */
function handleAnalysis(uploadCtx: UploadContext, comparisonCtx: ComparisonContext){
    const config = comparisonCtx.config
    const toCompare = uploadCtx.toCompare
    const newCtx = compareProfilesToContext(toCompare, config)
    renderAnalysis(newCtx)
}
/**
 * Dynamically render File upload buttons
 * @param section The current section being rendered
 * @param uploadInput The file input button
 * @param uploadCtx the current upload context
 * @param comparisonCtx the current comparison context
 * @returns 
 */
function handleFileUpload(section: HTMLElement, uploadInput: HTMLInputElement, uploadCtx: UploadContext, comparisonCtx: ComparisonContext){
    
    // Check if any files were selected
    if (!uploadInput.files || uploadInput.files.length === 0) {
        return;
    }

    // 3. Extract basic file metadata
    const file: File = uploadInput.files[0];
    console.log(`File Name: ${file.name}`);
    console.log(`File Size: ${file.size} bytes`);
    console.log(`File Type: ${file.type}`);

    // 4. Extract internal file content using FileReader
    const reader = new FileReader();
    // Trigger the reader to extract text data
    reader.readAsText(file);

    // This event fires sequentially once the file reading is completely finished
    reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
            const jsonData = JSON.parse(result);
            
            console.log(jsonData)
            const nextProfile: PreferenceProfile = jsonData
            
            if (nextProfile != undefined) {
                uploadCtx.currentMetamorNumber ++
                uploadCtx.toCompare.push(nextProfile)
            }
            
            const nextMetamorName = `<p>${nextProfile.metamorName}'s Preference Profile</p>`
                section.insertAdjacentHTML('beforebegin', nextMetamorName)
            
            const dynamicId = `upload-wrapper-${uploadCtx.currentMetamorNumber}`;
            
            const uploadAnother= `
            <br>
            <div id= "${dynamicId}">
            <label class='prefsUploadLabel'> Upload another metamor's preferences <br>
                <input type="file" class="prefsUpload"/>
            </label>
            </div>
            ` 
            section.insertAdjacentHTML('beforeend', uploadAnother)
            
            const newFieldContainer = section.querySelector<HTMLElement>(`#${dynamicId}`)!;
            makeFileUploadWork(newFieldContainer, uploadCtx, comparisonCtx)
            
            const analyseButton =`
                <button id='startComparisonButton'>Start Comparison</button>
            `
            const buttonExists = document.querySelector('#startComparisonButton') !== null;
            
            if (uploadCtx.currentMetamorNumber >= 2 && !buttonExists) {
                section.insertAdjacentHTML('beforeend', analyseButton)
                section.querySelector('#startComparisonButton')?.addEventListener('click', () => handleAnalysis(uploadCtx, comparisonCtx))
            }
        }
    };
}

/**
 * Add the callback functionality to all potential the file uploads
 * @param section the scope in which the file upload will have listeners added
 * @param ctx current context
 */
function makeFileUploadWork(section: HTMLElement, uploadCtx: Object, ctx: ComparisonContext){
    const fileInput = section.querySelectorAll('.prefsUpload');

    // 2. Listen for the file selection event
    fileInput.forEach(
        (e)=>{e.addEventListener('change', (event: Event) => {
            const target = event.target as HTMLInputElement;
            handleFileUpload(section, target, uploadCtx, ctx)})
            }
        );
}
/**
 * Given the current upload & comparison context
 * @param uploadCtx The current upload context
 * @param comparisonCtx the current comparison context
 */
function renderUpload(uploadCtx: Object, comparisonCtx: ComparisonContext){
    const app = document.querySelector<HTMLDivElement>('#comparePrefs')!;
    const uploadCopy = `
    <label class='prefsUploadLabel'> Upload a metamor's preferences <br>
        <input type="file" class="prefsUpload"/>
    </label>
    ` 
    app.innerHTML = `
        <section id='prefComparisonPanel'>
           <h1>Compare</h1>
        <section class="allUploads"> 
            ${uploadCopy}
        </section>
        <section id="prefsAnalysis"></section>
        `
    app.querySelectorAll(".allUploads").forEach((sec)=>{
        const section = sec as HTMLElement
        makeFileUploadWork(section, uploadCtx, comparisonCtx)
    })
}
/**
 * Given the current Comparison Context, Render an analysis
 * @param ctx the comparison context being taken in to render
 */
function renderAnalysis(ctx: ComparisonContext){
    const { 
      max_acceptable_misalign,
      show_pain_points,
      show_full,
      notes_config,
      show_perfect_matches,
      show_uncomparable, 
    } = ctx.config
    
    const all_uncomparable_prefs = ctx.all_uncomparable_prefs
    
    const app = document.querySelector<HTMLDivElement>('#prefsAnalysis')!;
    
    app.innerHTML = `
        <section id="allComparisonSections">
        ${ renderMisalign(max_acceptable_misalign, ctx)}
        ${ show_pain_points ? render_pain_points(ctx) : '' }
        ${ show_perfect_matches ? render_perfect_matches(ctx) : ''}
        ${ render_notes(notes_config, ctx) }
        ${ show_uncomparable ? render_uncomparable(all_uncomparable_prefs, ctx) : ''}
        ${ show_full ? render_full(ctx): ''}
        </section>
    `
}

renderUpload(uploadCtx, ctx)

