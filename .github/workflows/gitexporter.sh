#!/usr/bin/env bash
set -eo pipefail

export TARGET=git@github.com:open-condo-software/open-condo-platform.git
export SOURCE=git@github.com:open-condo-software/condo.git

SOURCE_FOLDER=ignore.gitexporter.source
TARGET_FOLDER=ignore.gitexporter.target

echo "[SOURCE/CLONE/PULL]"
if [ -d ${SOURCE_FOLDER} ]; then git -C ${SOURCE_FOLDER} pull origin master; else git clone ${SOURCE} ${SOURCE_FOLDER}; fi
echo "[SOURCE/STATS]"
git -C ${SOURCE_FOLDER} rev-parse HEAD
git -C ${SOURCE_FOLDER} status

echo "[TARGET/CLONE/PULL]"
if [ -d ${TARGET_FOLDER} ]; then git -C ${TARGET_FOLDER} pull origin master; else git clone ${TARGET} ${TARGET_FOLDER}; fi
echo "[TARGET/STATS]"
git -C ${TARGET_FOLDER} rev-parse HEAD
git -C ${TARGET_FOLDER} status

echo "[GITEXPORTER]"
cat > ${SOURCE_FOLDER}.config.json <<EOF
{
  "forceReCreateRepo": false,
  "followByNumberOfCommits": true,
  "syncAllFilesOnLastFollowCommit": true,
  "logFilePath": "${SOURCE_FOLDER}.log.json",
  "targetRepoPath": "${TARGET_FOLDER}",
  "commitTransformer": "./${SOURCE_FOLDER}.transformer.js",
  "sourceRepoPath": "${SOURCE_FOLDER}",
  "allowedPaths": [
    ".github/*",
    "apps/__demo/*",
    "apps/_demo/*",
    "apps/_back*",
    "apps/_front*",
    "apps/_ex*",
    "apps/_example*",
    "apps/_mobile*",
    "apps/_realtime*",
    "apps/condo/*",
    "packages/*",
    "bin/*",
    "docs/*",
    ".dockerignore",
    ".env.example",
    ".eslintignore",
    ".gitignore",
    ".husky/commit-msg",
    ".husky/pre-commit",
    ".prettierignore",
    ".prettierrc.json",
    "commitlint.config.js",
    "defaults.json",
    "docker-compose.yml",
    "Dockerfile",
    "LICENSE",
    "package.json",
    "prettierrc.json",
    "renovate.json",
    "yarn.lock",
    "README.md"
  ],
  "ignoredPaths": [
    ".gitexporter.*",
    ".env.build",
    "_api_tests/*",
    "_config.yml",
    "admin-ui/*",
    "apps/_compability_app/*",
    "apps/_pomodoro_app/*",
    "apps/amocrm/*",
    "apps/asterix_bot/*",
    "apps/callcenter/*",
    "apps/condorb/*",
    "apps/eps/*",
    "apps/notification_bot/*",
    "apps/condo/public/20210804225402-0034_classifiers_import_20210803_1654.js",
    "apps/condo/public/20210805171639-0035_classifiers_import_20210803_1654.js",
    "apps/condo/public/20210805182921-0036_classifiers_import_20210803_1654.js",
    "apps/condo/report.20210627.215319.44165.0.001.json",
    "apps/sberhack/*",
    ".github/workflows/deploy_*",
    "package-lock.json",
    "werf-giterminism.yaml",
    "werf.yaml",
    ".helm",
    ".github/workflows/cleanup.yaml",
    ".github/workflows/gitexporter*"
  ]
}
EOF
cat > ${SOURCE_FOLDER}.transformer.js <<EOF
module.exports = function (commit) {
    commit.message = commit.message.replace(/sberhack/ig, 'hackathon')
    commit.message = commit.message.replace(/sbercloud/ig, 'cloud')
    commit.message = commit.message.replace(/sberbank[.]ru/ig, 'doma.ai')
    commit.message = commit.message.replace(/(sber)(\w+)/ig, '$2')
    commit.message = commit.message.replace(/sber/ig, 'doma')
}
EOF

npx gitexporter ${SOURCE_FOLDER}.config.json

echo "[TARGET/SETUP]"
cd ${TARGET_FOLDER}
git branch -D master || echo "no branch master"
echo "[TARGET/STATS]"
git rev-parse HEAD
git status
echo "[TARGET/CHECKOUT]"
COMMIT=$(git rev-parse HEAD)
git checkout -B master ${COMMIT}
echo "[TARGET/PUSH]"
git push origin master
cd -
echo "[END]"
