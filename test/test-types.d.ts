import { Node } from '../src/Node.js';

type IdNode = Node<{ id: number }>;
type IdNodeDeps = Node<{ id: number, deps: [] }, 'deps'>;
