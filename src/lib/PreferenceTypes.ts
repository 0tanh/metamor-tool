/**
 * Non-type erased enum of different prefences!
 */
export const PreferenceIcon = {
  OFF_LIMIT: "OFF_LIMIT", 
  PREFER_NOT: "PREFER_NOT", 
  MAYBE: "MAYBE", 
  LIKE: "LIKE", 
  MUST:"MUST", 
  //for for loops
  *[Symbol.iterator]() {
    for (const value of Object.keys(this)) {
      yield value;
    }
  }
} as const

export type PreferenceIconType= typeof PreferenceIcon[keyof typeof PreferenceIcon];

/** 
 * Interface for a single preference
 * @property {string} name - the name of the current preference
 * @property {string} icon - how the current metamor feels about this preference
 * @property {[string]} note - extra notes from the metamor about how they feel about it
 */
export interface Preference {
    name:string;
    icon:string|null;
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
 */
export interface PreferenceProfile {
    metamorName: string;
    date?: string;
    metamorPrefs: Preference[]
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