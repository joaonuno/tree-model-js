// Project: https://github.com/joaonuno/tree-model-js
// Definitions by: Abhas Bhattacharya <https://github.com/bendtherules>
// TypeScript Version: 2.2

export = TreeModel;

declare class TreeModel {
    constructor(config?: TreeModel.Config);

    private config: TreeModel.Config;

    parse(model: TreeModel.Model): TreeModel.Node;
}

declare namespace TreeModel {
    class Node {
        constructor(config: any, model: Model);

        isRoot(): boolean;
        hasChildren(): boolean;
        addChild(child: Node): Node;
        addChildAtIndex(child: Node, index: number): Node;
        setIndex(index: number): Node;
        getPath(): Node[];
        getIndex(): number;

        walk(options: Options, fn: NodeVisitorFunction, ctx?: object): void;
        walk(fn: NodeVisitorFunction, ctx?: object): void;

        all(options: Options, fn: NodeVisitorFunction, ctx?: object): Node[];
        all(fn: NodeVisitorFunction, ctx?: object): Node[];

        first(options: Options, fn: NodeVisitorFunction, ctx?: object): Node | undefined;
        first(fn: NodeVisitorFunction, ctx?: object): Node | undefined;

        drop(): Node;

        [propName: string]: any;
    }

    interface Config {
        /**
         * The name for the children array property. Default is "children".
         */
        childrenPropertyName?: string;
        modelComparatorFn?: ComparatorFunction;
        [propName: string]: any;
    }

    interface Options {
        strategy: StrategyName;
    }

    type StrategyName = "pre" | "post" | "breadth";

    type ComparatorFunction = (left: any, right: any) => boolean;
    type NodeVisitorFunction = (visitingNode: Node) => boolean;

    interface Model {
        /**
         * Children array property name is set from `config.childrenPropertyName`(default: "children")
         *
         * config is passed in `TreeModel` constructor
         */
        children?: Model[];
        [propName: string]: any;
    }
}
