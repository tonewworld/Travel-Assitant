@echo off
echo installing requirements.txt  ...
python -m pip install --upgrade pip
python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt > install.log 2>&1
if %errorlevel%==0 (
    echo Finished！Check install.log
) else (
    echo Error，Check install.log
)
pause