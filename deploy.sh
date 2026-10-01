#!/bin/sh
echo Building Vue project...
npm run build

cd dist || exit
echo Initializing temporary Git repo in dist...
git init
git remote add origin https://github.com/FabianKopetzky/shakespeare.git

echo Switching to gh-pages branch...
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages

git add .
git commit -m "Deploy to gh-pages"

echo Pushing to gh-pages branch...
git push --force origin gh-pages

cd ..
rm -rf dist/.git
echo Deployment complete.