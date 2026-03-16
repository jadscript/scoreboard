export interface CreateMatchInput {
  team1Name: string
  team2Name: string
  /** IDs of 1 or 2 players for team 1. When provided, player validation rules apply. */
  team1PlayerIds?: string[]
  /** IDs of 1 or 2 players for team 2. When provided, player validation rules apply. */
  team2PlayerIds?: string[]
  config?: {
    bestOf?: 1 | 3 | 5
    noAd?: boolean
    finalSetSuperTiebreak?: boolean
  }
}
