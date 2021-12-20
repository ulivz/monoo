export type TChangelogProcessorOptions = object;

export type TChangelogProcessor<
  T extends TChangelogProcessorOptions = TChangelogProcessorOptions,
> = (cwd: string, input: string, options: T) => string;

export type TChangelogProcessorTuple = [
  TChangelogProcessor,
  TChangelogProcessorOptions,
];

export class ChangelogProcessor {
  constructor(private cwd: string, private input: string) {}

  private processorsTuple: TChangelogProcessorTuple[] = [];

  /**
   * Add a processor
   */
  addProcessor<T extends TChangelogProcessor>(
    processor: T,
    options: Parameters<T>['2'],
  ) {
    this.processorsTuple.push([processor, options]);
  }

  /**
   * Process and get final result
   */
  process() {
    const { cwd, input } = this;
    return this.processorsTuple.reduce<string>((memo, current) => {
      memo = current[0](cwd, memo, current[1]);
      return memo;
    }, input);
  }
}
