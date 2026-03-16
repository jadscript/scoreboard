export interface IQueryHandler<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>
}
