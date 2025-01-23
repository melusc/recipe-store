export type ReadonlyDate = Readonly<Omit<Date, `set${string}`>>;
