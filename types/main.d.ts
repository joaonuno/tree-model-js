import { Node } from '../src/Node.js';

type ComparatorFunction<T extends Record<string, unknown>, Key extends string = 'children'> = (
  left: Model<T, Key>,
  right: Model<T, Key>
) => number;
// type NodeVisitorFunction<T> = (visitingNode: Node<T>) => boolean;
export type Callback<T extends Record<string, unknown>, Key extends string = 'children'> = (
  model: Node<T, Key>
) => boolean;
//type Predicate<T> = (node: Node<T>) => boolean;

export type Model<T extends Record<string, unknown>, Key extends string = 'children'> = T & {
  [K in Key]?: Array<Model<T, Key>>;
};

// type A = Model<{ a: 1 }, 'deps'>;
// type B = A['deps'][number]['a'];
// type D = Model<{ b: 2 }>;
// type E = D['children'][number]['b'];

export interface Config<T extends Record<string, unknown>, Key extends string = 'children'> {
  childrenPropertyName: Key;
  modelComparatorFn?: ComparatorFunction<T, Key>;
}

export type Strategy<T extends Record<string, unknown>, Key extends string = 'children'> = (
  callback: Callback<T, Key>,
  node: Node<T, Key>
) => boolean | void;

export type walkStrategies<
  T extends Record<string, unknown>,
  Key extends string = 'children'
> = Record<string, Strategy<T, Key>>;

export type walkOptions<T extends Record<string, unknown>, Key extends string = 'children'> = {
  strategy: keyof walkStrategies<T, Key>;
};

// export { Node };
