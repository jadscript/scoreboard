export interface ICommandHandler<TInput, TOutput = void> {
  execute(input: TInput): Promise<TOutput>
}
