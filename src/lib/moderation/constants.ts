export const MODERATION_VIOLATION_MESSAGE =
  'Content violates community guidelines'

/** Place names and common false positives — checked against normalized text. */
export const TEXT_ALLOWLIST = [
  'scunthorpe',
  'penistone',
  'lightwater',
  'assumption',
  'classic',
  'passage',
  'assign',
  'assistant',
  'bass',
  'grass',
  'class',
  'massachusetts',
  'cockburn',
  'shitake'
]

/** Wraglet-specific and supplemental terms beyond the WASM dictionary. */
export const CUSTOM_BLOCKLIST = [
  'wragletspam',
  'wragletscam',
  'fuck',
  'fucking',
  'fucker',
  'shit',
  'bitch',
  'asshole',
  'cunt',
  'dick',
  'pussy',
  'whore',
  'slut',
  'nigger',
  'nigga',
  'faggot',
  'retard'
]

/** Hostnames blocked synchronously on publish. */
export const BLOCKED_HOSTNAMES = new Set([
  'pornhub.com',
  'www.pornhub.com',
  'xvideos.com',
  'www.xvideos.com',
  'xnxx.com',
  'www.xnxx.com',
  'xhamster.com',
  'www.xhamster.com',
  'redtube.com',
  'www.redtube.com',
  'youporn.com',
  'www.youporn.com',
  'chaturbate.com',
  'www.chaturbate.com',
  'onlyfans.com',
  'www.onlyfans.com'
])

export const BLOCKED_TLDS = ['.xxx', '.porn', '.adult', '.sex', '.cam']
