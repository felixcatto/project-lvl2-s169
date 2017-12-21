install:
	npm install


start:
	npm run babel-node './src/bin/gendiff.js'


build:
	rm -rf dist
	npm run build


lint:
	npm run eslint --silent src
	npm run eslint --silent __tests__


publish:
	npm publish


test:
	npm run test --silent
