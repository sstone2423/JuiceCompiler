#!/bin/sh
tsc --version
tsc --rootDir source/ --outDir dist/ source/scripts/*.ts
