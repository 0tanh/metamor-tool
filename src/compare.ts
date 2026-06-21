import type { PreferenceProfile } from './lib/PreferenceTypes'

let ctx = {

}

let config = {
    max_diff : 2, 
    show_full: true,
    
}

function compareContexts(toCompare: PreferenceProfile[], config: Object){

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

