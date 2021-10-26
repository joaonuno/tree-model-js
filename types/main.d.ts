import { Node } from '../src/Node.js';

type ComparatorFunction<T extends Record<string, unknown>> = (left: Model<T>, right: Model<T>) => number;
// type NodeVisitorFunction<T> = (visitingNode: Node<T>) => boolean;
export type Callback<T extends Record<string, unknown>> = (model: Node<T>) => boolean;
//type Predicate<T> = (node: Node<T>) => boolean;

export type Model<T extends Record<string, unknown>> = T & { children?: Array<Model<T>> };

export interface Config<T extends Record<string, unknown>> {
  //childrenPropertyName: keyof Node<T>;
  modelComparatorFn?: ComparatorFunction<T>;
}

export type Strategy<T extends Record<string, unknown>> = (callback: Callback<T>, node: Node<T>) => boolean;

export type walkStrategies<T extends Record<string, unknown>> = Record<string, Strategy<T>>;

export type walkOptions<T extends Record<string, unknown>> = {
  strategy: keyof walkStrategies<T>;
};

// export { Node };
