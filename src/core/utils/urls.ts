/** URL patterns for hpoi.net page types */
export const urlPatterns = {
  /** Individual hobby item page, e.g. /hobby/12345/ */
  hobbyItem: /hpoi\.net\/hobby\/\d+/,
  /** User profile page, e.g. /user/username/ */
  userProfile: /hpoi\.net\/user\//,
  /** Search results page */
  search: /hpoi\.net\/search\//,
  /** Homepage */
  home: /hpoi\.net\/(index)?$/,
  /** Any page on hpoi.net */
  all: /hpoi\.net/,
} as const

export type UrlPatternKey = keyof typeof urlPatterns
