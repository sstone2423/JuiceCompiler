///<reference path="globals.ts" />
/**
 * tree.ts 
 * 
 * Defines the Tree structure and logic used by the Scope Tree, CST, and AST
 * 
 * Created with the help from Kai's Kompailer. Many thanks!
 */

module JuiceC {
    export interface TreantResult {
        tree: Array <string>;
        treant: any;
    }

    export class Tree {
        // Root of the tree
        root: TreeNode;
        // Current parent node we are looking at
        curr: TreeNode;

        constructor() {
            this.curr = null;
            this.root = null;
        }

        /**
         * Adds non-terminal node to tree
         * @param production 
         * @param lineNum 
         * @param colNum 
         */
        addNTNode(production: Production, lineNum: number, colNum: number): void {
            const node = new NonTerminalTreeNode(production);
            node.lineNum = lineNum;
            node.colNum = colNum;
            if (this.root == null) {
                this.root = node;
                this.curr = node;

                return;
            }
            // Set parent node
            node.parent = this.curr;
            // Add to children of curr node
            this.curr.children.push(node);
            this.descendTree();
        }

        /**
         * Adds terminal node to tree AKA leaf node
         * @param token 
         * @param lineNum 
         * @param colNum 
         */
        addTNode(token: Token, lineNum: number, colNum: number): void {
            const node = new TerminalTreeNode(token);
            node.lineNum = lineNum;
            node.colNum = colNum;
            if (this.root == null) {
                this.root = node;
                this.curr = node;

                return;
            }
            // Set parent node
            node.parent = this.curr;
            // Add to children of curr node
            this.curr.children.push(node);
        }

        /**
         * Add general node
         * @param input 
         */
        addNode(input: any): void {
            const node = new GeneralTreeNode(input);
            if (this.root == null) {
                this.root = node;
                this.curr = node;

                return;
            }
            // Set parent node
            node.parent = this.curr;
            // Add to children of curr node
            this.curr.children.push(node);
            this.descendTree();
        }

        /**
         * Sets the current node as the latest child
         */
        descendTree(): void {
            if (this.curr == null) {
                return;
            }
            const latestChild = this.curr.children[this.curr.children.length - 1];
            this.curr = latestChild;
        }

        /**
         * Sets the current node as the parent of the current node
         */
        ascendTree(): void {
            this.curr = this.curr.parent;
        }

        /**
         * Prints the tree in depth-first search order for CST display
         * @param treantTree 
         * @param programCounter 
         */
        traverseTreeCST(treantTree, programCounter: number): TreantResult {
            const tree: Array <string> = [];
            const level = 0;
            if (this.root != null) {
                this.DFSCST(
                    this.root, level, tree, "",
                    treantTree['nodeStructure'].children, programCounter);
            }
            // Return array of nodes and tree config
            const result: TreantResult = {
                "tree": tree,
                "treant": treantTree
            };

            return result;
        }

        /**
         * Prints the tree in dfs for AST display
         * @param treantTree 
         * @param programCounter 
         */
        traverseTreeAST(treantTree, programCounter: number): TreantResult {
            const tree: Array <string> = [];
            const level = 0;
            if (this.root != null) {
                this.DFSAST(this.root, level, tree, "",
                    treantTree['nodeStructure'].children, programCounter);
            }
            // Return array of nodes and tree config
            const result: TreantResult = {
                "tree": tree,
                "treant": treantTree
            };

            return result;
        }

        // 
        /**
         * Returns an array representation of depth-first search of tree
         */
        traverseTree() {
            const tree: Array<TreeNode> = [];
            if (this.root != null) {
                this.DFSTree(this.root, tree);
            }

            return tree;
        }

        /**
         * Recursively push nodes into the traverseTree() tree
         * @param node 
         * @param tree 
         */
        DFSTree(node, tree) {
            tree.push(node);
            for (let i = 0; i < node.children.length; i++) {
                this.DFSTree(node.children[i], tree);
            }
        }

        // Helper for traverseTreeCST
        private DFSCST(node, level, tree, dash, treantTree, programCounter) {
            let child = {};
            if (node.value instanceof Token) {
                tree.push(dash + "[ " + node.value.value + " ]");
                // Add new node to children array passed
                // Pass reference to new children array to next call
                child = {
                    text: {
                        name: "[ " + node.value.value + " ]"
                    },
                    children: []
                };
                treantTree.push(child);
            } else {
                let nodeValue = node.value;
                // if node value is Program, put what program number it is
                if (nodeValue == "Program") {
                    nodeValue = nodeValue + "" + programCounter;
                }
                tree.push(dash + "< " + nodeValue + " >");
                // Add new node to children array passed
                // Pass reference to new children array to next call
                child = {
                    text: {
                        name: "< " + nodeValue + " >"
                    },
                    children: []
                };
                treantTree.push(child);
            }
            for (let i = 0; i < node.children.length; i++) {
                // to next call of DFS, increase level, pass the tree array, 
                // increase the dash by one dash, and pass
                // the reference to the next children array
                this.DFSCST(node.children[i], level + 1,
                    tree, dash + "-", child['children'], programCounter);
            }
        }

        /**
         * Helper for traverseTreeAST
         * @param node 
         * @param level 
         * @param tree 
         * @param dash 
         * @param treantTree 
         * @param programCounter 
         */
        private DFSAST(node, level: number, tree, dash: string, treantTree, programCounter: number) {
            let child = {};
            // Check if null to find appropriate value to place in tree
            // Add new node to children array passed
            // Pass reference to new children array to next call
            if (node.value.value != null) {
                var nodeValue = node.value.value;
                // if node value is Block, put what program number it is
                if (nodeValue == "Block" && level == 0) {
                    nodeValue = "Block" + "(Program" + programCounter + ")";
                }
                tree.push(dash + nodeValue);
                child = {
                    text: {
                        name: nodeValue + " "
                    },
                    children: []
                };
            } else {
                var nodeValue = node.value;
                // if node value is Block, put what program number it is
                if (nodeValue == "Block" && level == 0) {
                    nodeValue = "Block" + "(Program" + programCounter + ")";
                }
                tree.push(dash + nodeValue);
                child = {
                    text: {
                        name: nodeValue + " "
                    },
                    children: []
                };
            }
            treantTree.push(child);
            for (let i = 0; i < node.children.length; i++) {
                // to next call of DFS, increase level, pass the tree array,
                // increase the dash by one dash, and pass the reference to the next children array
                this.DFSAST(node.children[i], level + 1,
                    tree, dash + "-", child['children'], programCounter);
            }
        }
    }

    // Implementation of a TreeNode that makes up a Tree
    export abstract class TreeNode {
        value: any;
        // pointer to parent of this node
        parent: TreeNode;
        // the children this node points to
        children = [];
        constructor(value: any) {
            this.value = value;
        }
    }

    // A TreeNode that represents NonTerminals
    export class NonTerminalTreeNode extends TreeNode {
        value: Production;
        lineNum: number;
        colNum: number;
        super(value: Production) {
            this.value = value;
        }
    }

    // A TreeNode that represents Terminals
    export class TerminalTreeNode extends TreeNode {
        value: Token;
        lineNum: number;
        colNum: number;
        super(value: Token) {
            this.value = value;
        }
    }

    // A TreeNode that represents any value
    export class GeneralTreeNode extends TreeNode {
        value: any;
        super(value: any) {
            this.value = value;
        }
    }

}
