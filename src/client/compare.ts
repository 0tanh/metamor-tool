import { type PreferenceProfile, type ComparisonConfig, type NotesConfigType, NotesConfig, type ComparisonUnit, type ComparisonContext, type MetamorIconMap, type Preference } from '../lib/PreferenceTypes'

let ctx = {

}

const config:ComparisonConfig = {
    max_acceptable_misalign : 2, 
    show_full: true,
    notes_config : NotesConfig.ALL_NOTES,
    show_pain_points : true, //These are points that are diametrically opposed
    show_perfect_matches : true, //These match perfectly
    show_uncomparable : true
}

function show_notes(notesConfig: NotesConfigType){

}

function show_pain_points(){

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
            return pref.icon != null
        })
    }
    return reduced_profile
}

function findAllComparisonUnits(smallest: PreferenceProfile, cleanedCompare: PreferenceProfile[]): ComparisonUnit[]{
    // Create comparsions based on the smallest comparison available
    for (const pSmall of smallest?.metamorPrefs){
        const currentPrefName = pSmall.name;
        //Checks if this preference is in all profiles
        const available_in_all_profiles: boolean = cleanedCompare.every((profile)=>{
            return profile.metamorPrefs.some((p)=>p.name == currentPrefName)
        })
    
        //if not, exits early 
        if (!available_in_all_profiles){
            continue
        }
    
        const firstIconMap: MetamorIconMap = {
            metamorName: smallest.metamorName,
            icon: pSmall.icon
        }
        let currentPref: ComparisonUnit = {
            prefName : currentPrefName,
            metamorIconMap : [firstIconMap]
        }
        for (const profile of cleanedCompare){
            const found = profile.metamorPrefs.find((p)=>{p.name == currentPrefName})
            
            if (found == undefined) {
                console.error(`filtering was imperfect. ${profile.metamorName}'s profile did not contain ${currentPrefName}`)
                continue
            }
            
            const thisMap: MetamorIconMap = {
                metamorName : profile.metamorName,
                icon : found?.icon
            }
            currentPref.metamorIconMap.push(thisMap)
            
        }
    
    }
    return []

}

/**
 * This function takes in an array of profiles and returns out a comparison context
 * @param toCompare the arrays being compared
 * @param config the configuration of the comparion
 * @returns 
 */
function compareProfiles(toCompare: PreferenceProfile[], config: ComparisonConfig){
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
            allComparisonUnits: findAllComparisonUnits(concrete_smallest, cleanedCompare)
        } 

        return 0
    }


}

function handleFileUpload(section: HTMLElement, target: HTMLInputElement, ctx: Object){
    // const outputDiv = section.querySelector<HTMLDivElement>('output');
    
    // Check if any files were selected
    if (!target.files || target.files.length === 0) {
        return;
    }

    // 3. Extract basic file metadata
    const file: File = target.files[0];
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

        }
    };
}

/**
 * Add the callback functionality to all potential the file uploads
 * @param section the scope in which the file upload will have listeners added
 * @param ctx current context
 */
function makeFileUploadWork(section: HTMLElement, ctx: Object){
    const fileInput = section.querySelectorAll('.prefsUpload');

    // 2. Listen for the file selection event
    fileInput.forEach(
        (e)=>{e.addEventListener('change', (event: Event) => {
            const target = event.target as HTMLInputElement;
            handleFileUpload(section, target, ctx)
    })});
}

function renderAnalysis(ctx: Object){
  const app = document.querySelector<HTMLDivElement>('#comparePrefs')!;
  app.innerHTML = `
  <section id='prefComparisonPanel'>
    <h1>Compare</h1>
    <section class="allUploads"> 
        <label> Upload a metamor's preferences <br>
            <input type="file" class="prefsUpload"/>
        </label>
    </section> 
  </section>
  `
  app.querySelectorAll(".allUploads").forEach((sec)=>{
    const section = sec as HTMLElement
    makeFileUploadWork(section, ctx)
  })

}

renderAnalysis(ctx)

