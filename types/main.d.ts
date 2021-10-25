import { Node } from '../src/Node.js';

type ComparatorFunction<T> = (left: Model<T>, right: Model<T>) => number;
// type NodeVisitorFunction<T> = (visitingNode: Node<T>) => boolean;
export type Callback<T> = (model: Node<T>) => boolean;
//type Predicate<T> = (node: Node<T>) => boolean;

export type Model<T> = T & { children?: Array<Model<T>> };

export interface Config<T> {
  //childrenPropertyName: keyof Node<T>;
  modelComparatorFn?: ComparatorFunction<T>;
}

export type Strategy<T> = (callback: Callback<T>, node: Node<T>) => boolean;

export type walkStrategies<T> = Record<string, Strategy<T>>;

export type walkOptions<T> = {
  strategy: keyof walkStrategies<T>;
};

// export { Node };
