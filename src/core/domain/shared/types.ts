/** Which side (team) scored or won */
export type PointScorer = 'team1' | 'team2'

export type MatchStatus = 'not_started' | 'in_progress' | 'finished'

export type GameType = 'regular' | 'tiebreak' | 'super-tiebreak'

export type Gender = 'male' | 'female'

/** Derived from the players' count and genders. Null when teams have no players. */
export type MatchType = 'singles' | 'doubles_male' | 'doubles_female' | 'doubles_mixed'
