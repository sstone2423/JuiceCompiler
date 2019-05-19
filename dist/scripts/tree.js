///<reference path="globals.ts" />
/**
 * tree.ts
 *
 * Defines the Tree structure and logic used by the Scope Tree, CST, and AST
 *
 * Created with the help from Kai's Kompailer. Many thanks!
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JuiceC;
(function (JuiceC) {
    var Tree = /** @class */ (function () {
        function Tree() {
            this.curr = null;
            this.root = null;
        }
        /**
         * Adds non-terminal node to tree
         * @param production
         * @param lineNum
         * @param colNum
         */
        Tree.prototype.addNTNode = function (production, lineNum, colNum) {
            var node = new NonTerminalTreeNode(production);
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
        };
        /**
         * Adds terminal node to tree AKA leaf node
         * @param token
         * @param lineNum
         * @param colNum
         */
        Tree.prototype.addTNode = function (token, lineNum, colNum) {
            var node = new TerminalTreeNode(token);
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
        };
        /**
         * Add general node
         * @param input
         */
        Tree.prototype.addNode = function (input) {
            var node = new GeneralTreeNode(input);
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
        };
        /**
         * Sets the current node as the latest child
         */
        Tree.prototype.descendTree = function () {
            if (this.curr == null) {
                return;
            }
            var latestChild = this.curr.children[this.curr.children.length - 1];
            this.curr = latestChild;
        };
        /**
         * Sets the current node as the parent of the current node
         */
        Tree.prototype.ascendTree = function () {
            this.curr = this.curr.parent;
        };
        /**
         * Prints the tree in depth-first search order for CST display
         * @param treantTree
         * @param programCounter
         */
        Tree.prototype.traverseTreeCST = function (treantTree, programCounter) {
            var tree = [];
            var level = 0;
            if (this.root != null) {
                this.DFSCST(this.root, level, tree, "", treantTree['nodeStructure'].children, programCounter);
            }
            // Return array of nodes and tree config
            var result = {
                "tree": tree,
                "treant": treantTree
            };
            return result;
        };
        /**
         * Prints the tree in dfs for AST display
         * @param treantTree
         * @param programCounter
         */
        Tree.prototype.traverseTreeAST = function (treantTree, programCounter) {
            var tree = [];
            var level = 0;
            if (this.root != null) {
                this.DFSAST(this.root, level, tree, "", treantTree['nodeStructure'].children, programCounter);
            }
            // Return array of nodes and tree config
            var result = {
                "tree": tree,
                "treant": treantTree
            };
            return result;
        };
        // 
        /**
         * Returns an array representation of depth-first search of tree
         */
        Tree.prototype.traverseTree = function () {
            var tree = [];
            if (this.root != null) {
                this.DFSTree(this.root, tree);
            }
            return tree;
        };
        /**
         * Recursively push nodes into the traverseTree() tree
         * @param node
         * @param tree
         */
        Tree.prototype.DFSTree = function (node, tree) {
            tree.push(node);
            for (var i = 0; i < node.children.length; i++) {
                this.DFSTree(node.children[i], tree);
            }
        };
        // Helper for traverseTreeCST
        Tree.prototype.DFSCST = function (node, level, tree, dash, treantTree, programCounter) {
            var child = {};
            if (node.value instanceof JuiceC.Token) {
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
            }
            else {
                var nodeValue = node.value;
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
            for (var i = 0; i < node.children.length; i++) {
                // to next call of DFS, increase level, pass the tree array, 
                // increase the dash by one dash, and pass
                // the reference to the next children array
                this.DFSCST(node.children[i], level + 1, tree, dash + "-", child['children'], programCounter);
            }
        };
        /**
         * Helper for traverseTreeAST
         * @param node
         * @param level
         * @param tree
         * @param dash
         * @param treantTree
         * @param programCounter
         */
        Tree.prototype.DFSAST = function (node, level, tree, dash, treantTree, programCounter) {
            var child = {};
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
            }
            else {
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
            for (var i = 0; i < node.children.length; i++) {
                // to next call of DFS, increase level, pass the tree array,
                // increase the dash by one dash, and pass the reference to the next children array
                this.DFSAST(node.children[i], level + 1, tree, dash + "-", child['children'], programCounter);
            }
        };
        return Tree;
    }());
    JuiceC.Tree = Tree;
    // Implementation of a TreeNode that makes up a Tree
    var TreeNode = /** @class */ (function () {
        function TreeNode(value) {
            // the children this node points to
            this.children = [];
            this.value = value;
        }
        return TreeNode;
    }());
    JuiceC.TreeNode = TreeNode;
    // A TreeNode that represents NonTerminals
    var NonTerminalTreeNode = /** @class */ (function (_super) {
        __extends(NonTerminalTreeNode, _super);
        function NonTerminalTreeNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NonTerminalTreeNode.prototype["super"] = function (value) {
            this.value = value;
        };
        return NonTerminalTreeNode;
    }(TreeNode));
    JuiceC.NonTerminalTreeNode = NonTerminalTreeNode;
    // A TreeNode that represents Terminals
    var TerminalTreeNode = /** @class */ (function (_super) {
        __extends(TerminalTreeNode, _super);
        function TerminalTreeNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TerminalTreeNode.prototype["super"] = function (value) {
            this.value = value;
        };
        return TerminalTreeNode;
    }(TreeNode));
    JuiceC.TerminalTreeNode = TerminalTreeNode;
    // A TreeNode that represents any value
    var GeneralTreeNode = /** @class */ (function (_super) {
        __extends(GeneralTreeNode, _super);
        function GeneralTreeNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GeneralTreeNode.prototype["super"] = function (value) {
            this.value = value;
        };
        return GeneralTreeNode;
    }(TreeNode));
    JuiceC.GeneralTreeNode = GeneralTreeNode;
})(JuiceC || (JuiceC = {}));
