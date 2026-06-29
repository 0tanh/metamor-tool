/**
 * Non-type erased enum of different prefences!
 */
export const PreferenceIcon = {
  OFF_LIMIT: 1, 
  PREFER_NOT: 2, 
  MAYBE: 3, 
  PREFER: 4, 
  MUST:5, 
  //for for loops
  *[Symbol.iterator]() {
    for (const value of Object.keys(this)) {
      yield value;
    }
  }
} as const

/**
 * A structured type version of the preference Icon Constant
 */
export type PreferenceIconType= typeof PreferenceIcon[keyof typeof PreferenceIcon];


/** 
 * Interface for a single preference
 * @property {string} name - the name of the current preference
 * @property {string} icon - how the current metamor feels about this preference
 * @property {[string]} note - extra notes from the metamor about how they feel about it
 */
export interface Preference {
    name:string;
    iconValue:PreferenceIconType|null;
    note:string;
}
/**
 * Interface that stores a category of preferences.
 */
export interface PreferenceCategory {
    categoryName: string;
    associatedPrefs: Preference[]
}

/**
 * Interface for a full profile
 * @property {string} metamorName the name of a metamor
 * @property {Preference[]} metamorPrefs an array of all preferences
 * @property {string} date when this profile was made
 * @property {PreferenceCategory[]} metamorPrefsByCategory metamorPreferences arranged by category for easier comparison
 */
export interface PreferenceProfile {
    metamorName: string;
    date?: string;
    metamorPrefs: Preference[]
    metamorPrefsByCategory?: PreferenceCategory[]
}

/**
 * Interface for the current Preference Profile
 * @property {number} prefNumber - the number of the current preference
 * @property {number} prefSize- the number of preferences currently available
 * @property {currentPrefIcon}
 * @property {string} currentPref the currentPref being selected
 * @property {PreferenceProfile} currentPreferenceProfile - the current context of the preference profile being worked on
 */
export interface PreferenceContext {
  currentPrefNumber: number;
  currentPref: Preference;
  currentPrefIcon: PreferenceIconType | null;
  prefSize: number;
  currentPreferenceProfile: PreferenceProfile
}


/**
 * Non-type erased enum different configurations of showing notes
 */
export const NotesConfig= {
  ALL_NOTES: "ALL_NOTES", //show all notes that appear regardless of match
  HIDE_PERFECT: "HIDE_PERFECT", //show all_notes except notes attached to perfect matches
  ONLY_MISALIGNED: "ONLY_MISALIGNED", //show only notes on misaligned preferences
  //for for loops
  *[Symbol.iterator]() {
    for (const value of Object.keys(this)) {
      yield value;
    }
  }
} as const

/**
 * A structured type of all the notes to be shown
 */
export type NotesConfigType= typeof NotesConfig [keyof typeof NotesConfig];

/**
 * This interface demonstrates the current configuration
 * between any number of PreferenceProfiles
 */
export interface ComparisonConfig {
  max_acceptable_misalign : number //maximum number of icon points off that two icons are allowed to be
  show_full : boolean //show all preferences compared
  notes_config : NotesConfigType 
  show_perfect_matches : boolean //show preferences that have perfectly matched icons
  show_pain_points: boolean //show preferences that are diametrically opposed
  show_uncomparable: boolean //show all preferences that could not be compared because they did not appear in all profiles
}

export interface MetamorIconMap {
  metamorName: string
  icon: PreferenceIconType
  note?: string
}

/**
 * This interface demonstrates the shape of a single preference being compared
 * 
 */
export interface ComparisonUnit {
  prefName: string
  metamorIconMaps: MetamorIconMap[]
}

/**
 * This interface encapsulates the current comparison context
 */
export interface ComparisonContext {
  allComparisonUnits: ComparisonUnit[]
  show_reanalyse? : boolean
  all_uncomparable_prefs?:{
    metamorName: string,
    unmatchedPref: Preference
  }[]
  config: ComparisonConfig
}

/**
 * This interface captures everything that is required for the upload file context
 */
 export interface UploadContext {
  currentMetamorNumber: number
  toCompare: PreferenceProfile[]
}
/**
 * Global context object to help with passing state around
 */
export interface AllContext{
  preferenceContext: PreferenceContext
  comparisonContext: ComparisonContext
  uploadContext: UploadContext
}