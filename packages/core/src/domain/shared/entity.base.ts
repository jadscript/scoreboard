export abstract class Entity<TProps> {
  private readonly _id: string
  protected readonly props: TProps

  protected constructor(props: TProps, id?: string) {
    this._id = id ?? crypto.randomUUID()
    this.props = props
  }

  get id(): string {
    return this._id
  }

  equals(other: Entity<unknown>): boolean {
    return this._id === other._id
  }
}
