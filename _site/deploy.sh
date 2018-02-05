echo "Lets deploy!"

DATE=`date '+%Y-%m-%d %H:%M:%S'`
rm -rf _site/*
JEKYLL_ENV=production jekyll build
git add -A
git commit -m "Deploy from $DATE"
git pull
git push

echo "Deploy finished!"

