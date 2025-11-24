@echo off
REM Script om netwerk informatie te verzamelen voor vast IP-adres instellen
echo ============================================================
echo Planning Industrie AI - Netwerk Informatie
echo ============================================================
echo.
echo Dit script verzamelt je huidige netwerk informatie.
echo Gebruik deze informatie om een vast IP-adres in te stellen.
echo.
pause

echo.
echo ============================================================
echo HUIDIGE NETWERK CONFIGURATIE
echo ============================================================
echo.

echo --- IPv4 Adres ---
ipconfig | findstr /i "IPv4"
echo.

echo --- MAC Adres (Physical Address) ---
ipconfig /all | findstr /i "Physical"
echo.

echo --- Gateway (Router IP) ---
ipconfig | findstr /i "Gateway"
echo.

echo --- Subnet Mask ---
ipconfig /all | findstr /i "Subnet"
echo.

echo --- DNS Servers ---
ipconfig /all | findstr /i "DNS"
echo.

echo.
echo ============================================================
echo INFORMATIE VERZAMELD
echo ============================================================
echo.
echo Noteer deze informatie:
echo - IPv4 Adres: (bijv. 192.168.1.121)
echo - Physical Address: (bijv. 00-1B-44-11-3A-B7)
echo - Gateway: (bijv. 192.168.1.1)
echo - Subnet Mask: (meestal 255.255.255.0)
echo.
echo Gebruik deze informatie om VAST_IP_ADRES.md te volgen
echo of gebruik de automatische Windows instellingen hieronder.
echo.
pause

echo.
echo ============================================================
echo WIL JE EEN VAST IP-ADRES INSTELLEN VIA WINDOWS?
echo ============================================================
echo.
echo Dit script kan je helpen met het instellen van een vast IP-adres.
echo.
echo LET OP: Je moet Administrator rechten hebben!
echo.
set /p SET_IP="Wil je nu een vast IP-adres instellen? (J/N): "

if /i "%SET_IP%"=="J" (
    echo.
    echo ============================================================
    echo VAST IP-ADRES INSTELLEN
    echo ============================================================
    echo.
    echo Dit script zal je door het proces leiden.
    echo.
    
    REM Haal huidige configuratie op
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do set CURRENT_IP=%%a
    set CURRENT_IP=%CURRENT_IP: =%
    
    echo Huidig IP-adres: %CURRENT_IP%
    echo.
    set /p NEW_IP="Voer het gewenste IP-adres in (bijv. 192.168.1.121): "
    
    REM Haal gateway op
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "Gateway"') do set GATEWAY=%%a
    set GATEWAY=%GATEWAY: =%
    
    echo.
    echo Gateway gevonden: %GATEWAY%
    set /p CONFIRM_GATEWAY="Klopt dit? (J/N, of voer handmatig in): "
    
    if /i not "%CONFIRM_GATEWAY%"=="J" (
        set /p GATEWAY="Voer gateway IP in: "
    )
    
    echo.
    set /p SUBNET="Voer subnet mask in (meestal 255.255.255.0): "
    if "%SUBNET%"=="" set SUBNET=255.255.255.0
    
    echo.
    set /p DNS1="Voer eerste DNS server in (meestal %GATEWAY% of 8.8.8.8): "
    if "%DNS1%"=="" set DNS1=8.8.8.8
    
    echo.
    set /p DNS2="Voer tweede DNS server in (meestal 8.8.4.4): "
    if "%DNS2%"=="" set DNS2=8.8.4.4
    
    echo.
    echo ============================================================
    echo SAMENVATTING
    echo ============================================================
    echo IP-adres: %NEW_IP%
    echo Subnet Mask: %SUBNET%
    echo Gateway: %GATEWAY%
    echo DNS 1: %DNS1%
    echo DNS 2: %DNS2%
    echo.
    set /p CONFIRM="Klopt dit allemaal? (J/N): "
    
    if /i "%CONFIRM%"=="J" (
        echo.
        echo Instellen van vast IP-adres...
        echo.
        
        REM Vind de actieve netwerk adapter naam
        for /f "tokens=*" %%a in ('netsh interface show interface ^| findstr /i "Connected"') do (
            for /f "tokens=3*" %%b in ("%%a") do set ADAPTER_NAME=%%c
        )
        
        if "%ADAPTER_NAME%"=="" (
            echo FOUT: Kon netwerk adapter niet vinden.
            echo.
            echo Probeer handmatig via:
            echo 1. Instellingen ^> Netwerk en Internet ^> Ethernet/Wi-Fi
            echo 2. Klik op je verbinding
            echo 3. Klik op "Bewerken" bij IP-instellingen
            echo 4. Selecteer "Handmatig"
            echo 5. Vul de gegevens in
            pause
            exit /b 1
        )
        
        echo Netwerk adapter gevonden: %ADAPTER_NAME%
        echo.
        echo Instellen van IP-configuratie...
        echo.
        
        REM Stel statisch IP in
        netsh interface ip set address name="%ADAPTER_NAME%" static %NEW_IP% %SUBNET% %GATEWAY%
        
        if %errorLevel% equ 0 (
            echo IP-adres ingesteld!
        ) else (
            echo FOUT bij instellen IP-adres. Probeer handmatig.
            pause
            exit /b 1
        )
        
        REM Stel DNS in
        netsh interface ip set dns name="%ADAPTER_NAME%" static %DNS1% primary
        netsh interface ip add dns name="%ADAPTER_NAME%" %DNS2% index=2
        
        if %errorLevel% equ 0 (
            echo DNS servers ingesteld!
        ) else (
            echo Waarschuwing: DNS kon niet automatisch worden ingesteld.
            echo Stel handmatig in via netwerk instellingen.
        )
        
        echo.
        echo ============================================================
        echo KLAAR!
        echo ============================================================
        echo.
        echo Je IP-adres is nu vast ingesteld op: %NEW_IP%
        echo.
        echo Test je internet verbinding:
        ping -n 2 8.8.8.8
        echo.
        echo Als ping werkt, is alles goed ingesteld!
        echo.
        echo Start nu de server met: python run.py
        echo Je IP-adres zal nu altijd %NEW_IP% zijn.
        echo.
    ) else (
        echo.
        echo Geannuleerd. Geen wijzigingen doorgevoerd.
        echo.
    )
) else (
    echo.
    echo Geannuleerd. Geen wijzigingen doorgevoerd.
    echo.
    echo Zie VAST_IP_ADRES.md voor handmatige instructies.
    echo.
)

pause

