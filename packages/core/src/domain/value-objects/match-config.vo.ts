interface MatchConfigProps {
  /** Total number of sets in the match (winner is whoever wins the majority) */
  bestOf: 1 | 3 | 5
  /**
   * No-advantage rule: at deuce (40-40), the next point wins the game.
   * Default in official beach tennis.
   */
  noAd: boolean
  /**
   * Replaces the deciding set with a super tiebreak (first to 10, win by 2).
   * Only applies when bestOf > 1.
   */
  finalSetSuperTiebreak: boolean
}

export class MatchConfig {
  private readonly props: MatchConfigProps

  private constructor(props: MatchConfigProps) {
    this.props = props
  }

  static create(params: Partial<MatchConfigProps> = {}): MatchConfig {
    return new MatchConfig({
      bestOf: params.bestOf ?? 3,
      noAd: params.noAd ?? true, // no-ad is the default in beach tennis
      finalSetSuperTiebreak: params.finalSetSuperTiebreak ?? true,
    })
  }

  get bestOf(): 1 | 3 | 5 {
    return this.props.bestOf
  }

  get noAd(): boolean {
    return this.props.noAd
  }

  get finalSetSuperTiebreak(): boolean {
    return this.props.finalSetSuperTiebreak
  }

  /** Number of sets required to win the match */
  get setsToWin(): number {
    return Math.ceil(this.props.bestOf / 2)
  }
}
