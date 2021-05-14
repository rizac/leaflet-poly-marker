# Script using terser to minify the javascript. Requirements:
# npm (brew install npm or apt-get counterpart in Ubuntu)
# terser (npm install terser -g. See https://docs.npmjs.com/cli/v7/commands/npm-install)
# and setting the node path specifically (see https://stackoverflow.com/a/15849375)
NODE_PATH="/usr/local/lib/node_modules"
OUTFILE="./polymarker.min.js"
echo "// (c) R. Zaccarelli (rizac@github.com)" > $OUTFILE
terser ./polymarker.js >> $OUTFILE
echo "Minified polymarker.min.js"