[![Build Status](https://travis-ci.org/felixcatto/project-lvl2-s169.svg?branch=master)](https://travis-ci.org/felixcatto/project-lvl2-s169)

## Description
Command line util for computing differences in files. Supported file types `.json, .ini, .yml`. Supported output formats `'object', 'plain', 'json'`.

## Installation
```sudo npm install -g iproject-lvl2```

## Usage

```
gendiff --format=<type> <firstConfig> <secondConfig>
gendiff before.json after.json
gendiff --format=plain before.json after.json
```
