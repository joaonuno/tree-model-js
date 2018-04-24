import TreeModel = require("tree-model");

interface TestModel {
    name: string;
}

const tree = new TreeModel({});

const root = tree.parse<TestModel>({ name: 'a', children: [{ name: 'b' }, { name: 'c' }] });

// $ExpectType boolean
root.isRoot();
// $ExpectType boolean
root.hasChildren();
{
    root.first(); // $ExpectError
    root.first((node) => node); // $ExpectError

    const tmpNodeB = root.first((node) => node.name === 'b');
    const tmpNodeC = root.first((node) => node.name === 'c');
    if (typeof tmpNodeB !== "undefined" && typeof tmpNodeC !== "undefined") {
        const nodeB = tmpNodeB;
        const nodeC = tmpNodeC;

        type Node = typeof nodeB;

        root.addChild({}); // $ExpectError
        root.addChild(nodeC); // $ExpectType Node<TestModel>

        root.addChildAtIndex(nodeC); // $ExpectError
        root.addChildAtIndex(nodeC, 0); // $ExpectType Node<TestModel>

        nodeB.setIndex("first"); // $ExpectError
        nodeB.setIndex(0); // $ExpectType Node<TestModel>
        const arrPath: Node[] = nodeB.getPath();
        const nodeIndex: number = nodeB.getIndex();

        const opt = { strategy: <'post' | 'pre'> 'post' };
        const visitorFn = (tm: Node) => true;
        const ctxObject = {};

        // Test Node.walk with different overloads no return type
        {
            {
                nodeB.walk(opt, visitorFn, ctxObject); // $ExpectType void
            }
            {
                nodeB.walk(opt, visitorFn); // $ExpectType void
            }
            {
                nodeB.walk(visitorFn, ctxObject); // $ExpectType void
            }
        }

        // Test Node.all with different overloads and their return type
        {
            {
                const nodeArr: Node[] = nodeB.all(opt, visitorFn, ctxObject);
            }
            {
                const nodeArr: Node[] = nodeB.all(opt, visitorFn);
            }
            {
                const nodeArr: Node[] = nodeB.all(visitorFn, ctxObject);
            }
        }

        // Test Node.first with different overloads and their return type
        {
            {
                const nodeReturned: Node | undefined = nodeB.first(opt, visitorFn, ctxObject);
            }
            {
                const nodeReturned: Node | undefined = nodeB.first(opt, visitorFn);
            }
            {
                const nodeReturned: Node | undefined = nodeB.first(visitorFn, ctxObject);
            }
        }

        nodeC.drop(nodeC); // $ExpectError
        nodeC.drop(); // $ExpectType Node<TestModel>
    }
}
