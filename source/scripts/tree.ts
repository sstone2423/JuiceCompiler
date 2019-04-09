///<reference path="globals.ts" />
/* 
    tree.ts  
*/

module JuiceC {

        export class Tree {
            // Root of the tree
            root: TreeNode;
            // Current parent node we are looking at
            curr: TreeNode;
    
            constructor() {
                this.curr = null;
                this.root = null;
            }

            // Adds non-terminal node to tree
            public addNTNode(production: Production, lineNum: number, colNum: number) {
                let node = new NonTerminalTreeNode(production);
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

            // Adds terminal node to tree AKA leaf node
            public addTNode(token: Token, lineNum: number, colNum: number) {
                let node = new TerminalTreeNode(token);
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

            // Add general node
            public addNode(input: any) {
                let node = new GeneralTreeNode(input);
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

            // Sets the current node as the latest child
            public descendTree() {
                if (this.curr == null) {
                    return;
                }
                let latestChild = this.curr.children[this.curr.children.length - 1];
                this.curr = latestChild;
            }

            // Sets the current node as the parent of the current node
            public ascendTree() {
                this.curr = this.curr.parent;
            }

            // Prints the tree in depth-first search order for CST display
            public traverseTreeCST(treantTree, programCounter) {
                let tree: Array<string> = [];
                let level: number = 0;
                if (this.root != null) {
                    this.DFSCST(this.root, level, tree, "", treantTree['nodeStructure'].children, programCounter);
                }
                // Return array of nodes and tree config
                return {"tree": tree, "treant": treantTree};
            }

            /**
             * Prints the tree in dfs for AST display
             */
            public traverseTreeAST(treantTree, programCounter) {
                let tree: Array<string> = [];
                let level: number = 0;
                if (this.root != null) {
                    this.DFSAST(this.root, level, tree, "", treantTree['nodeStructure'].children, programCounter);
                }
                // Return array of nodes and tree config
                return {"tree": tree, "treant": treantTree};
            }

            // Returns an array representation of depth-first search of tree
            public traverseTree() {
                let tree: Array<TreeNode> = [];
                if (this.root != null) {
                    this.DFSTree(this.root, tree);
                }
                return tree;
            }

            // Recursively push nodes into the traverseTree() tree
            public DFSTree(node, tree) {
                tree.push(node);
                for (let i = 0; i < node.children.length; i++) {
                    this.DFSTree(node.children[i], tree);
                }
            }
            
            // Helper for traverseTreeCST
            private DFSCST(node, level, tree, dash, treantTree, programCounter) {
                let child = {};
                if (node.value instanceof Token) {
                    tree.push(dash + "[ " + node.value.value + " ]")
                    // Add new node to children array passed
                    // Pass reference to new children array to next call
                    child = {
                        text: { name: "[ " + node.value.value + " ]" },
                        children: []
                    }
                    treantTree.push(child);
                } else {
                    let nodeValue = node.value;
                    // if node value is Program, put what program number it is
                    if (nodeValue == "Program") {
                        nodeValue = nodeValue + "" + programCounter;
                    }
                    tree.push(dash + "< " + nodeValue + " >")
                    // Add new node to children array passed
                    // Pass reference to new children array to next call
                    child = {
                        text: { name: "< " + nodeValue + " >" },
                        children: []
                    }
                    treantTree.push(child);
                }
                for (let i = 0; i < node.children.length; i++) {
                    // to next call of DFS, increase level, pass the tree array, increase the dash by one dash, and pass
                    // the reference to the next children array
                    this.DFSCST(node.children[i], level + 1, tree, dash + "-", child['children'], programCounter);
                }
            }

            /**
             * Helper for traverseTreeAST
             */
            private DFSAST(node, level, tree, dash, treantTree, programCounter) {
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
                        text: { name: nodeValue + " " },
                        children: []
                    }
                } else {
                    var nodeValue = node.value;
                    // if node value is Block, put what program number it is
                    if(nodeValue == "Block" && level == 0){
                        nodeValue = "Block" + "(Program" + programCounter + ")";
                    }
                    tree.push(dash + nodeValue);
                    child = {
                        text: { name: nodeValue + " " },
                        children: []
                    }
                }
                treantTree.push(child);
                for (let i = 0; i < node.children.length; i++) {
                    // to next call of DFS, increase level, pass the tree array, increase the dash by one dash, and pass
                    // the reference to the next children array
                    this.DFSAST(node.children[i], level + 1, tree, dash + "-", child['children'], programCounter);
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
            constructor(value: any){
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
            super(value: any){
                this.value = value;
            }
        }

}