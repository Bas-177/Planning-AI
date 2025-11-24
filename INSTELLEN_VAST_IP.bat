@echo off
REM Script om netwerk informatie te verzamelen voor vast IP-adres instellen
setlocal enabledelayedexpansion

echo ============================================================
echo Planning Industrie AI - Netwerk Informatie
echo ============================================================
echo.
echo Dit script verzamelt je huidige netwerk informatie.
echo Gebruik deze informatie om een vast IP-adres in te stellen.
echo.

REM Verzamel netwerk informatie
echo Verzamelen van netwerk informatie...
echo.

REM Haal IPv4 adres op
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i /c:"IPv4"') do (
    set CURRENT_IP=%%a
    set CURRENT_IP=!CURRENT_IP: =!
    goto :ip_found
)
:ip_found

REM Haal Gateway op
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i /c:"Gateway"') do (
    set GATEWAY=%%a
    set GATEWAY=!GATEWAY: =!
    goto :gateway_found
)
:gateway_found

REM Haal Subnet Mask op
for /f "tokens=2 delims=:" %%a in ('ipconfig /all ^| findstr /i /c:"Subnet Mask"') do (
    set SUBNET=%%a
    set SUBNET=!SUBNET: =!
    goto :subnet_found
)
:subnet_found

REM Haal MAC adres op (eerste actieve adapter)
for /f "tokens=2 delims=:" %%a in ('ipconfig /all ^| findstr /i /c:"Physical Address"') do (
    set MAC=%%a
    set MAC=!MAC: =!
    goto :mac_found
)
:mac_found

echo ============================================================
echo HUIDIGE NETWERK CONFIGURATIE
echo ============================================================
echo.
echo IPv4 Adres: !CURRENT_IP!
echo Gateway: !GATEWAY!
echo Subnet Mask: !SUBNET!
echo MAC Adres: !MAC!
echo.

REM Check of informatie is gevonden
if "!CURRENT_IP!"=="" (
    echo FOUT: Kon IP-adres niet vinden.
    echo.
    echo Probeer handmatig via:
    echo 1. Instellingen ^> Netwerk en Internet ^> Ethernet/Wi-Fi
    echo 2. Klik op je verbinding
    echo 3. Klik op "Bewerken" bij IP-instellingen
    echo 4. Selecteer "Handmatig"
    echo 5. Vul de gegevens in
    echo.
    echo Zie STAPPENPLAN_VAST_IP.md voor gedetailleerde instructies.
    pause
    exit /b 1
)

echo ============================================================
echo WIL JE EEN VAST IP-ADRES INSTELLEN VIA WINDOWS?
echo ============================================================
echo.
echo Dit script kan je helpen met het instellen van een vast IP-adres.
echo.
echo LET OP: Je moet Administrator rechten hebben!
echo.
set /p SET_IP="Wil je nu een vast IP-adres instellen? (J/N): "

if /i not "!SET_IP!"=="J" (
    echo.
    echo Geannuleerd. Geen wijzigingen doorgevoerd.
    echo.
    echo Zie STAPPENPLAN_VAST_IP.md voor handmatige instructies.
    echo.
    echo AANBEVELING: Gebruik DHCP Reservation in je router (Methode 1)
    echo Dit is veel eenvoudiger en veiliger!
    echo.
    pause
    exit /b 0
)

echo.
echo ============================================================
echo VAST IP-ADRES INSTELLEN
echo ============================================================
echo.
echo Huidig IP-adres: !CURRENT_IP!
echo.
echo Je kunt hetzelfde IP-adres gebruiken, of een ander kiezen.
echo.
set /p USE_CURRENT="Wil je het huidige IP-adres (!CURRENT_IP!) behouden? (J/N): "

if /i "!USE_CURRENT!"=="J" (
    set NEW_IP=!CURRENT_IP!
    echo.
    echo Je behoudt het huidige IP-adres: !NEW_IP!
) else (
    echo.
    set /p NEW_IP="Voer het gewenste IP-adres in (bijv. 192.168.1.121): "
    if "!NEW_IP!"=="" (
        echo FOUT: Geen IP-adres ingevoerd.
        pause
        exit /b 1
    )
)

echo.
echo Gateway gevonden: !GATEWAY!
if "!GATEWAY!"=="" (
    set /p GATEWAY="Gateway niet gevonden. Voer gateway IP in (meestal 192.168.1.1): "
) else (
    set /p CONFIRM_GATEWAY="Klopt dit? (J/N): "
    if /i not "!CONFIRM_GATEWAY!"=="J" (
        set /p GATEWAY="Voer gateway IP in: "
    )
)

if "!GATEWAY!"=="" (
    echo FOUT: Gateway is verplicht.
    pause
    exit /b 1
)

echo.
if "!SUBNET!"=="" (
    set SUBNET=255.255.255.0
    echo Subnet mask niet gevonden. Gebruik standaard: !SUBNET!
) else (
    echo Subnet mask gevonden: !SUBNET!
    set /p CONFIRM_SUBNET="Klopt dit? (J/N): "
    if /i not "!CONFIRM_SUBNET!"=="J" (
        set /p SUBNET="Voer subnet mask in (meestal 255.255.255.0): "
        if "!SUBNET!"=="" set SUBNET=255.255.255.0
    )
)

echo.
set DNS1=8.8.8.8
set DNS2=8.8.4.4
echo DNS servers:
echo   DNS 1: !DNS1! (Google DNS)
echo   DNS 2: !DNS2! (Google DNS)
set /p USE_DNS="Wil je deze DNS servers gebruiken? (J/N): "

if /i not "!USE_DNS!"=="J" (
    set /p DNS1="Voer eerste DNS server in (meestal !GATEWAY! of 8.8.8.8): "
    if "!DNS1!"=="" set DNS1=8.8.8.8
    
    set /p DNS2="Voer tweede DNS server in (meestal 8.8.4.4): "
    if "!DNS2!"=="" set DNS2=8.8.4.4
)

echo.
echo ============================================================
echo SAMENVATTING
echo ============================================================
echo.
echo IP-adres: !NEW_IP!
echo Subnet Mask: !SUBNET!
echo Gateway: !GATEWAY!
echo DNS 1: !DNS1!
echo DNS 2: !DNS2!
echo.
set /p CONFIRM="Klopt dit allemaal? (J/N): "

if /i not "!CONFIRM!"=="J" (
    echo.
    echo Geannuleerd. Geen wijzigingen doorgevoerd.
    echo.
    pause
    exit /b 0
)

echo.
echo ============================================================
echo INSTELLEN VAN VAST IP-ADRES
echo ============================================================
echo.

REM Vind de actieve netwerk adapter naam
echo Zoeken naar actieve netwerk adapter...
set ADAPTER_NAME=
for /f "skip=3 tokens=*" %%a in ('netsh interface show interface') do (
    set LINE=%%a
    set LINE=!LINE: =!
    echo !LINE! | findstr /i "Connected" >nul
    if !errorLevel! equ 0 (
        for /f "tokens=3*" %%b in ("%%a") do (
            set ADAPTER_NAME=%%c
            goto :adapter_found
        )
    )
)
:adapter_found

if "!ADAPTER_NAME!"=="" (
    echo.
    echo FOUT: Kon netwerk adapter niet automatisch vinden.
    echo.
    echo Probeer handmatig via:
    echo 1. Instellingen ^> Netwerk en Internet ^> Ethernet/Wi-Fi
    echo 2. Klik op je verbinding
    echo 3. Klik op "Bewerken" bij IP-instellingen
    echo 4. Selecteer "Handmatig"
    echo 5. Vul de gegevens in:
    echo    - IP-adres: !NEW_IP!
    echo    - Subnet mask: !SUBNET!
    echo    - Gateway: !GATEWAY!
    echo    - DNS 1: !DNS1!
    echo    - DNS 2: !DNS2!
    echo.
    pause
    exit /b 1
)

echo Netwerk adapter gevonden: !ADAPTER_NAME!
echo.
echo Instellen van IP-configuratie...
echo.

REM Stel statisch IP in
echo Stel IP-adres in...
netsh interface ip set address name="!ADAPTER_NAME!" static !NEW_IP! !SUBNET! !GATEWAY!

if !errorLevel! neq 0 (
    echo.
    echo FOUT bij instellen IP-adres.
    echo.
    echo Probeer handmatig via Windows Instellingen (zie hierboven).
    pause
    exit /b 1
)

echo IP-adres ingesteld!
echo.

REM Stel DNS in
echo Stel DNS servers in...
netsh interface ip set dns name="!ADAPTER_NAME!" static !DNS1! primary

if !errorLevel! neq 0 (
    echo Waarschuwing: Primaire DNS kon niet worden ingesteld.
) else (
    echo Primaire DNS ingesteld.
)

netsh interface ip add dns name="!ADAPTER_NAME!" !DNS2! index=2

if !errorLevel! neq 0 (
    echo Waarschuwing: Secundaire DNS kon niet worden ingesteld.
) else (
    echo Secundaire DNS ingesteld.
)

echo.
echo ============================================================
echo KLAAR!
echo ============================================================
echo.
echo Je IP-adres is nu vast ingesteld op: !NEW_IP!
echo.
echo Test je internet verbinding...
ping -n 2 8.8.8.8 >nul 2>&1

if !errorLevel! equ 0 (
    echo Internet verbinding werkt!
) else (
    echo WAARSCHUWING: Internet verbinding werkt mogelijk niet.
    echo Controleer je instellingen of ga terug naar "Automatisch (DHCP)".
)

echo.
echo ============================================================
echo VOLGENDE STAPPEN
echo ============================================================
echo.
echo 1. Start de server met: python run.py
echo 2. Je IP-adres zal nu altijd !NEW_IP! zijn
echo 3. Anderen kunnen de applicatie openen via:
echo    http://!NEW_IP!:8000
echo.
echo ============================================================
echo.

pause
