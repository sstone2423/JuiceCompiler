# Juice Compiler: A browser-based Compiler in Typescript

Juice your code into Machine Language!

Setup TypeScript
================

1. Install the [npm](https://www.npmjs.org/) package manager if you don't already have it.
1. Run `npm install -g typescript` to get the TypeScript Compiler. (You may need to do this as root.)


Workflow
=============

Some IDEs (e.g., Visual Studio, IntelliJ, others) natively support TypeScript-to-JavaScript compilation.
If your development environment does not then you'll need to automate the process with something like Gulp.


Setup Gulp
==========

1. `npm install gulp` to get the Gulp Task Runner.
2. `npm install gulp-tsc` to get the Gulp TypeScript plugin.


Run `gulp` at the command line in the root directory of this project.
Edit your TypeScript files in the source/scripts directory in your favorite editor.
Visual Studio and IntelliJ have some tools that make debugging, syntax highlighting, and lots more quite easy.
WebStorm looks like a nice option as well.

Gulp will automatically:

* Watch for changes in your source/scripts/ directory for changes to .ts files and run the TypeScript Compiler on them.
* Watch for changes to your source/styles/ directory for changes to .css files and copy them to the distrib/ folder if you have them there.

**Where can I get more info on TypeScript**
[Right this way!](http://www.typescriptlang.org/)
