import { type PreferenceProfile, type ComparisonConfig, type NotesConfigType, NotesConfig, type ComparisonUnit, type ComparisonContext, type MetamorIconMap, type Preference, type UploadContext, PreferenceIcon, type AllContext } from '../lib/PreferenceTypes'

import { allCtx } from './build'

/**
 * Given the comparison context, render all comparison units
 * @param ctx the current comparison context
 * @returns the rendered string
 */
function render_full_comparison(ctx: ComparisonContext): string{
    const all_units = ctx.allComparisonUnits.map((unit)=>{
        const name = unit.prefName;
        console.log(unit)
        const metamorIconMap = unit.metamorIconMaps
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
        const minimum = Math.min(...v.metamorIconMaps.map((m)=>m.icon.valueOf()))
        const max = Math.max(...v.metamorIconMaps.map((m)=>m.icon.valueOf()))
        const diff = max - minimum;
        return diff >= max_acceptable_misalign
    }).map((compU)=>{
        const formattedMap =`
            ${compU.metamorIconMaps.map((cu)=>{
                const wordForIcon = Object.keys(PreferenceIcon)[cu.icon.valueOf()] 
                const metaIcon = `
                    <p> ${cu.metamorName} => ${wordForIcon}</p>
                    ${cu.note !== '' ? `<p>${cu.metamorName} also added this note: </p><p>${cu.note}<p>` : ''}
                    
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


/**
 * Renders all the points where two people's beliefs are diametrically opposed
 * @param ctx Comparison context
 * @returns 
 */
function renderPainPoints(ctx: ComparisonContext){
    const pain_point = ctx.allComparisonUnits.filter((compUnit)=>{
        const mapList = compUnit.metamorIconMaps
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
            ${compUnit.metamorIconMaps.map((p)=>{
                const output = `<p>${p.metamorName}</p>`
                return output
            }).join('')} 

        `
        const output = `
            <p>${compUnit.prefName}</p>
            ${compUnit.metamorIconMaps.length > 2 ? multiMetamor : ''}
        `
        return output
    }).join('')
    const output=  `
        <h2 class='comparisonSection'> pain_points </h2>
        ${pain_point}

    `
    return output
}
/**
 * Render The perfect matches display
 * @param ctx context being taken in
 * @returns a string representing all the perfected matches
 */
function renderPerfectMatches(ctx: ComparisonContext){
    const config = ctx.config;
    const perfectMatches = ctx.allComparisonUnits
        .filter((cu)=>{
            const iconMapList = cu.metamorIconMaps;
            const first = cu.metamorIconMaps[0]?.icon.valueOf()
            const cleaned = iconMapList.filter((metamorMap)=> {return metamorMap.icon.valueOf() == first})
            return cu.metamorIconMaps.length == cleaned.length
        })
        .map((cu)=>{
            const notes = cu.metamorIconMaps.map((map)=>{
                const output = `
                    <p> ${map.metamorName} also added this note </p>
                    <br>
                    <p> ${map.note} </p>
                `
                return output
            })
            const normalName = Object.keys(PreferenceIcon)[cu.metamorIconMaps[0]?.icon.valueOf()]
            const formatted =`
                <p>${cu.prefName} => ${normalName}</p>
                
                ${config.notes_config !== 'ALL_NOTES' ? notes : ''}
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

function renderUncomparable(all_uncomparable_perfs: {metamorName :string, unmatchedPref: Preference }[], ctx: ComparisonContext){
    const output = `<h2 class='comparisonSection'>all uncomparable </h2>`
    return output
}

/**
 * Find the misaligned Preferences
 * @param max_acceptable_misalign 
 * @param ctx 
 * @returns 
 */
function findMisaligned(max_acceptable_misalign:number, ctx: ComparisonContext){
    const misAlign = ctx.allComparisonUnits.filter((v)=>{
        const minimum = Math.min(...v.metamorIconMaps.map((m)=>m.icon.valueOf()))
        const max = Math.max(...v.metamorIconMaps.map((m)=>m.icon.valueOf()))
        const diff = max - minimum;
        return diff >= max_acceptable_misalign
    })
    return misAlign
}

/**
 * Render the notes based on the selected preference.
 * @param allCtx all the current context 
 * @returns rendered notes
 */
function renderNotes(allCtx: ComparisonContext): string{
    const ctx = allCtx
    const config = ctx.config
    console.log(ctx)

    const all_notes = ctx.allComparisonUnits
        .map((cu)=>{
            const all_notes = cu.metamorIconMaps.map((map)=>{
                const formatted = `
                    <p> ${map.metamorName} added this note:
                    <br> ${map.note} </p>
                    <br>
                `
                const note_empty = map.note == '' || map.note == null || map.note == "" || map.note == " " 
                const output = note_empty ? '' : formatted
                return output
            }).join('')

            
            const wrapping = `
                <p>"${cu.prefName}" Notes</p>
                <br>
                <p> ${all_notes} </p>
                `

            return wrapping
        }).join('')
    
    const filtered = findMisaligned(config.max_acceptable_misalign, ctx)
    const misaligned_notes = filtered.map((cu) => 
        cu.metamorIconMaps.map((map)=>{
            const formatted = `
                <p> ${map.metamorName} added this note:
                <br> ${map.note} </p>
                <br>
            `
            const note_empty = map.note == '' || map.note == null || map.note == "" || map.note == " " 
            const output = note_empty ? '' : formatted
            return output
        }).join('')).join('')
    
    const perfectMatches = ctx.allComparisonUnits
        .filter((cu)=>{
            const iconMapList = cu.metamorIconMaps;
            const first = cu.metamorIconMaps[0]?.icon.valueOf()
            const cleaned = iconMapList.filter((metamorMap)=> {return metamorMap.icon.valueOf() == first})
            return cu.metamorIconMaps.length == cleaned.length
        })

    const hide_perfect = ctx.allComparisonUnits
        .filter((cu)=>!perfectMatches.includes(cu))
        .map((cu) => 
            cu.metamorIconMaps.map((map)=>{
                const formatted = `
                    <p> ${map.metamorName} added this note:
                    <br> ${map.note} </p>
                    <br>
                `
                const note_empty = map.note == '' || map.note == null || map.note == "" || map.note == " " 
                const output = note_empty ? '' : formatted
                return output
        }).join('')).join('')
    
    let which_notes = ``
    
    switch (config.notes_config){
        case 'ALL_NOTES':
            which_notes = all_notes
            break
        case 'HIDE_PERFECT':
            which_notes = hide_perfect
            break
        case 'ONLY_MISALIGNED':
            which_notes = misaligned_notes
            break
        }
        const allFormatted = ctx.allComparisonUnits.map((cu)=>{
            console.log('first map')
            
            const first_formatted = cu.metamorIconMaps.map((map)=>{
                
            const normalName = Object.keys(PreferenceIcon)[map.icon.valueOf()]
            const pref_to_name =
            `
            <p>${cu.prefName} => ${normalName}</p>
            `
            return pref_to_name
        }
        
    ).join('')
    
    const output = `
    ${first_formatted}
    ${all_notes}
    `
    return output
    }).join('')

    const output = `
    <h2 class='comparisonSection'> Just Notes </h2>
    <p> Current Note Configuration = ${ctx.config.notes_config} </p>
    <section>${allFormatted}</section>
    `
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
        
        const firstNote = pSmall.note

        const firstIconMap: MetamorIconMap = {
            metamorName: smallest.metamorName,
            icon: pSmall.iconValue,
            note: firstNote
        }

        let currentPref: ComparisonUnit = {
            prefName : currentPrefName,
            metamorIconMaps : [firstIconMap]
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
                icon : found?.iconValue,
                note: found?.note
            }
            currentPref.metamorIconMaps.push(thisMap)
            
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
 * Add the current user to the current comparison context
 * @param section 
 * @param allCtx 
 */
function addCurrentUserToComparisonContext(section: HTMLElement, allCtx: AllContext){
    const uploadCtx = allCtx.uploadContext
    const comparisonCtx = allCtx.comparisonContext
    console.log("Current User Added")
    const currentUser: PreferenceProfile = allCtx.preferenceContext.currentPreferenceProfile
    if (currentUser != undefined) {
        uploadCtx.currentMetamorNumber ++
        uploadCtx.toCompare.push(currentUser)
    }
    renderAnalyseAndReanalyseButtons(section, allCtx)
    handleAnalysis(uploadCtx, comparisonCtx)
}

//TODO seperate this function out
/**
 * Dynamically render File upload buttons
 * @param section The current section being rendered
 * @param uploadInput The file input button
 * @param uploadCtx the current upload context
 * @param comparisonCtx the current comparison context
 * @returns 
 */
function handleFileUpload(section: HTMLElement, uploadInput: HTMLInputElement, allCtx: AllContext){
    const uploadCtx = allCtx.uploadContext
    const comparisonCtx = allCtx.comparisonContext

    if (!uploadInput.files || uploadInput.files.length === 0) {
        return;
    }
    
    const file: File = uploadInput.files[0];
    console.log(`File Name: ${file.name}`);
    console.log(`File Size: ${file.size} bytes`);
    console.log(`File Type: ${file.type}`);

    const reader = new FileReader();
    
    reader.readAsText(file);
    
    // This event fires sequentially once the file reading is completely finished
    reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
            try {
                const jsonData = JSON.parse(result);
                console.log(jsonData)
                const nextProfile: PreferenceProfile = jsonData
                if (nextProfile != undefined) {
                    uploadCtx.currentMetamorNumber ++
                    uploadCtx.toCompare.push(nextProfile)
                }

                const previousId = `#upload-wrapper-${uploadCtx.currentMetamorNumber}`;
                const prev = section.querySelector(previousId)
                prev == null ? '' : prev.textContent = ''
            
                const dynamicId = `upload-metamor-${uploadCtx.currentMetamorNumber}`;
                
                const toHide = `metamor-${uploadCtx.currentMetamorNumber}-Label`
                const hide_span = section.querySelector<HTMLElement>(`#${toHide}`)
                
                
                if (hide_span) {
                    const hide = "font-size: 0px; border: 0px; display: none;";
                    const firstUpload = document.querySelector<HTMLElement>('#firstUpload')
                    hide_span.style.cssText = hide;
                    firstUpload.style.cssText = hide
                }
                
                const nextID = `metamor-${uploadCtx.currentMetamorNumber+1}-Label`
                
                const uploadAnother= `
                <section id= "${dynamicId}">
                <label class='prefsUploadLabel'> <span id="${nextID}">Upload another metamor's preferences </span>
                    <input type="file" class="prefsUpload"/>
                </label>
                </section>
                ` 
                
                const nextMetamorName = `<p>${nextProfile.metamorName}'s Preference Profile added! </p>`
                section.insertAdjacentHTML('beforeend', nextMetamorName)
                section.insertAdjacentHTML('beforeend', uploadAnother)
                
                makeFileUploadWork(section, allCtx)
                
                const buttonExists = document.querySelector('#startComparisonButton') !== null;
                
                const captureCurrentContextHTML = `
                <label>Start Comparison With Built Context <button id='captureCurrentUser'>Capture</button></label>
                `
                const captureCurrentExists = document.querySelector('#captureCurrentUser') != null
                const currentUserCompare = `
                    ${uploadCtx.toCompare.length >= 1 ? captureCurrentContextHTML: ''}
                    `
                if (uploadCtx.currentMetamorNumber >= 1 && !captureCurrentExists){
                    section.insertAdjacentHTML('afterbegin', currentUserCompare)
                    console.log(document.querySelector('#captureCurrentUser'))
                    document.querySelector('#captureCurrentUser')?.addEventListener('click', () => addCurrentUserToComparisonContext(section, allCtx))
                }

                if (uploadCtx.currentMetamorNumber >= 2 && !buttonExists) {
                    renderAnalyseAndReanalyseButtons(section, allCtx)
                }

            } catch (error){
                console.log(error)
                alert("Please upload a valid JSON")
            }

        }
    };
}
/**
 * Render the Analyse and Reanalyse Buttons, along with their associated callbacks
 * @param section 
 * @param allCtx 
 */
function renderAnalyseAndReanalyseButtons(section: HTMLElement, allCtx: AllContext){
    const uploadCtx = allCtx.uploadContext
    const comparisonCtx = allCtx.comparisonContext
    const analyseButton =`
    <label><button id='startComparisonButton'>Start Comparison</button></label>
    `
    
    const reanalyseButton = `
    <label id="ReanalyseLabel" style="display: none;">Reanalyse?<button id='ReanalyseButton'>Reanalyse</button></label>
    `
    section.insertAdjacentHTML('beforeend', reanalyseButton)
    section.querySelector('#ReanalyseButton')?.addEventListener('click', () => handleAnalysis(uploadCtx, comparisonCtx))
    
    section.insertAdjacentHTML('beforeend', analyseButton)
    section.querySelector('#startComparisonButton')?.addEventListener('click', () => handleAnalysis(uploadCtx, comparisonCtx))
}

/**
 * Add the callback functionality to all potential the file uploads
 * @param section the scope in which the file upload will have listeners added
 * @param ctx current context
 */
function makeFileUploadWork(section: HTMLElement, allCtx: AllContext){
    const fileInput = section.querySelectorAll('.prefsUpload');

    // 2. Listen for the file selection event
    fileInput.forEach(
        (e)=>{e.addEventListener('change', (event: Event) => {
            const target = event.target as HTMLInputElement;
            handleFileUpload(section, target, allCtx)})
            }
        );
}
/**
 * Given the current upload & comparison context
 * @param uploadCtx The current upload context
 * @param comparisonCtx the current comparison context
 */
function render_upload(allCtx: AllContext){
    const app = document.querySelector<HTMLDivElement>('#comparePrefs')!;
    
    const uploadCopy = `
    <label class='prefsUploadLabel'> <span id='firstUpload'> Upload a metamor's preferences </span>
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
        </section>
        `
    app.querySelectorAll(".allUploads").forEach((sec)=>{
        const section = sec as HTMLElement
        makeFileUploadWork(section, allCtx)
    })
}
/**
 * Given the current Comparison Context, Render an analysis
 * @param compCtx the comparison context being taken in to render
 */
function renderAnalysis(compCtx: ComparisonContext){
    const { 
      max_acceptable_misalign,
      show_pain_points,
      show_full,
      show_perfect_matches,
      show_uncomparable, 
    } = compCtx.config
    
    const all_uncomparable_prefs = compCtx.all_uncomparable_prefs
    const label = document.querySelector<HTMLElement>("#ReanalyseLabel")!;
    if (label != null){label.style.display = "revert"}
    const app = document.querySelector<HTMLDivElement>('#prefsAnalysis')!;
    
    app.innerHTML = `
    <section id="allComparisonSections">
    ${ renderMisalign(max_acceptable_misalign, compCtx)}
    ${ show_pain_points ? renderPainPoints(compCtx) : '' }
    ${ show_perfect_matches ? renderPerfectMatches(compCtx) : ''}
    ${ renderNotes(compCtx) }
    ${ show_uncomparable ? renderUncomparable(all_uncomparable_prefs, compCtx) : ''}
    ${ show_full ? render_full_comparison(compCtx): ''}
    </section>
    `
    const section = app.querySelector("#allComparisonSections")
}

render_upload(allCtx)

