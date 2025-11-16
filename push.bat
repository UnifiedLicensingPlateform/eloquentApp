@echo off

REM Simple helper script to add, commit, and push to origin/main

IF "%~1"=="" (
    ECHO Usage: git-push "commit message"
    EXIT /B 1
)

SET "MSG=%*"

ECHO Adding changes...
git add .

ECHO Committing with message: %MSG%
git commit -m "%MSG%"
IF ERRORLEVEL 1 (
    ECHO Commit failed. Aborting push.
    EXIT /B 1
)

ECHO Pushing to origin/main...
git push origin main
