# Planning Criteria Lijst

## Algemene Regels

### 1. Weekplanning (Ma-Zo)
- [ ] Zondag wordt NOOIT gepland (dag 0) - geen enkele werknemer heeft zondag uren
- [ ] Zaterdag wordt alleen gepland als medewerker zaterdag uren heeft in "Medewerkers" module
- [ ] Weekplanning toont alleen werkdagen waarop medewerker daadwerkelijk werkt

### 2. Projectvolgorde (Chronologisch)
Stap 1: Materiaal binnen?
- [ ] Materialen moeten eerst binnen zijn voordat productie kan starten
- [ ] Check `uiterste_leverdatum_materiaal` - productie kan NIET eerder starten dan deze datum
- [ ] Check `materiaal_binnen` boolean - als false, kan productie niet starten

Stap 2: Voorbereiding
- [ ] Voorbereiding start zodra materialen binnen zijn (of op uiterste leverdatum)
- [ ] Voorbereiding kan parallel lopen met andere bewerkingen?
- [ ] Voorbereiding eindigt voordat samenstellen/aflassen start? Of mag parallel?

Stap 3: Samenstellen
- [ ] Samenstellen kan NIET starten voordat materialen binnen zijn
- [ ] Samenstellen kan NIET starten voordat voorbereiding klaar is (als voorbereiding bestaat)
- [ ] Samenstellen kan parallel lopen met aflassen? Of moet aflassen na samenstellen?
- [ ] Samenstellen eindigt voor conservering start

Stap 4: Aflassen
- [ ] Aflassen kan NOOIT eerder starten dan samenstellen
- [ ] Aflassen mag gelijk lopen met samenstellen (parallel)?
- [ ] Aflassen kan langer duren dan samenstellen (meer uren)?
- [ ] Samenstellen kan NOOIT later klaar zijn dan aflassen
- [ ] Aflassen eindigt voor conservering start

Stap 5: Conservering
- [ ] Conservering kan NOOIT starten voordat samenstellen/aflassen klaar is
- [ ] Conservering wordt ALLEEN getoond als er echt conserveringen zijn aangevinkt (`conserveringen` array gevuld)
- [ ] Conservering wordt ALLEEN getoond als `conserveringsdatum` is opgegeven OF `conservering_doorlooptijd` > 0
- [ ] Conservering doorlooptijd telt ALLEEN werkdagen (weekend wordt overgeslagen)
- [ ] Conservering mag NOOIT in gewone planning worden getoond (alleen in projectplanning)
- [ ] Conservering eindigt voor montage start

Stap 6: Montage
- [ ] Montage kan NOOIT starten voordat conservering klaar is (als conservering bestaat)
- [ ] Montage kan starten als er geen conservering is?
- [ ] Montage eindigt op leverdatum

Stap 7: Uitlevering
- [ ] Uitlevering = leverdatum (milestone)

### 3. Capaciteit & Uren
- [ ] Een medewerker kan NOOIT meer uren per dag plannen dan beschikbaar in "Medewerkers" module
- [ ] Voorbeeld: Medewerker werkt 8,5 uur per dag, dan kan project 1 (3u) + project 2 (5,5u) = 8,5u in 1 dag
- [ ] Maar project 1 (3u) + project 2 (6u) = 9u kan NIET in 1 dag (overschrijdt capaciteit)
- [ ] Weekplanning houdt rekening met dagelijkse uren per medewerker

### 4. Datums & Planning
- [ ] Productie (samenstellen/aflassen) moet 1-2 werkdagen vóór conserveringsdatum klaar zijn
- [ ] Als er geen conservering is, productie kan doorgaan tot leverdatum?
- [ ] Als er conservering is, productie kan NIET doorgaan tot leverdatum (moet ruimte voor conservering + montage)

### 5. Conservering Check
- [ ] Conservering wordt ALLEEN getoond in projectplanning als:
  - `conserveringen` array is gevuld (heeft waarden) EN
  - (`conserveringsdatum` is opgegeven OF `conservering_doorlooptijd` > 0)
- [ ] Conservering wordt NOOIT getoond in gewone planning (alleen einddatum milestone)

### 6. Duplicaten & Uniciteit
- [ ] Geen dubbele projecten per medewerker (samenstelling: ordernummer + bewerking moet uniek zijn)
- [ ] Alleen projecten tonen waar medewerker echt voor gekoppeld is (assignments bestaan)
- [ ] Als assignment meerdere keren voorkomt, combineer tot 1 project met grootste uren en breedste datum range

### 7. Dynamische Hoogte
- [ ] Projectkolom hoogte past zich aan aan aantal projecten
- [ ] Mensen zonder projecten = minimale hoogte (klein)
- [ ] Mensen met veel projecten = grotere hoogte
- [ ] Medewerker naam en planning rij moeten GELIJK TREKKEN (synced hoogte)

### 8. Milestones & Eindmarkers
- [ ] Einddatum milestone (✓ Eind) moet dezelfde hoogte hebben als projectbalk waar het bij hoort
- [ ] Einddatum milestone wordt alleen getoond op leverdatum
- [ ] Geen conservering milestones in gewone planning (alleen in projectplanning)

### 9. Projectplanning Specifiek
- [ ] Samenstellen en aflassen worden gecombineerd tot "Productie" bar
- [ ] Productie start = vroegste van samenstellen/aflassen start
- [ ] Productie eind = laatste van samenstellen/aflassen eind
- [ ] Productie kan NIET doorgaan tot leverdatum als er conservering tussen moet

---

## Uitsluitende Regels (Mutually Exclusive)

### Uitsluiting 1: Zondag Planning
- ❌ Zondag plannen is NIET mogelijk (geen enkele medewerker heeft zondag uren)
- ✅ Weekplanning werkt alleen Ma-Za (zaterdag alleen als medewerker zaterdag uren heeft)

### Uitsluiting 2: Conservering vs. Geen Conservering
- ❌ Conservering kan NIET getoond worden zonder aangevinkte conserveringen
- ❌ Conservering kan NIET in gewone planning (alleen projectplanning)
- ✅ Als geen conservering, productie kan direct naar montage (of leverdatum)

### Uitsluiting 3: Samenstellen vs. Aflassen
- ❌ Aflassen kan NOOIT eerder starten dan samenstellen
- ❌ Samenstellen kan NOOIT later klaar zijn dan aflassen
- ✅ Aflassen kan gelijk lopen met samenstellen (parallel, zelfde start)
- ✅ Aflassen kan langer duren dan samenstellen (meer uren = meer dagen)

### Uitsluiting 4: Productie vs. Conservering
- ❌ Productie kan NIET doorgaan tot leverdatum als er conservering tussen moet
- ❌ Productie moet 1-2 werkdagen vóór conservering klaar zijn
- ✅ Als geen conservering, productie kan dichter bij leverdatum

### Uitsluiting 5: Materiaal vs. Productie
- ❌ Productie kan NIET starten voordat materialen binnen zijn
- ❌ Productie kan NIET starten voordat `uiterste_leverdatum_materiaal` is bereikt
- ✅ Productie start op uiterste leverdatum materiaal (of eerder als materialen al binnen zijn)

---

## Vragen voor Verduidelijking

1. **Voorbereiding vs. Samenstellen/Aflassen:**
   - Kan voorbereiding parallel lopen met samenstellen/aflassen?
   - Of moet voorbereiding eerst klaar zijn voordat samenstellen/aflassen start?

2. **Capaciteit Planning:**
   - Hoe wordt de capaciteit precies berekend? Per dag? Per week?
   - Als een project meer uren heeft dan 1 dag, hoe wordt dit verdeeld?
   - Kan een project over meerdere dagen worden verdeeld als capaciteit beperkt is?

3. **Conservering Logica:**
   - Als er een `conserveringsdatum` is opgegeven maar GEEN conserveringen zijn aangevinkt, wat dan?
   - Moet conservering ALTIJD tussen productie en montage, of alleen als aangevinkt?

4. **Montage zonder Conservering:**
   - Kan montage direct starten na productie als er geen conservering is?
   - Of moet er altijd ruimte zijn tussen productie en montage?

5. **Projectplanning vs. Gewone Planning:**
   - In projectplanning: worden samenstellen en aflassen ALTIJD gecombineerd tot "Productie"?
   - Of alleen als beide bestaan voor hetzelfde project?

6. **Dynamische Hoogte:**
   - Moet de hoogte per project item exact overeenkomen met de hoogte van de planning rij?
   - Of mag er verschil zijn tussen hoogte projectkolom en hoogte planningbalk?

---

## Interactieve Functie Ideeën

1. **Drag & Drop Planning:**
   - Projectbalken kunnen worden versleept om planning aan te passen
   - System automatisch valideert of nieuwe positie logisch is (capaciteit, datums, etc.)

2. **Automatische Conflict Detectie:**
   - System detecteert automatisch conflicten (bijv. te weinig tijd tussen productie en conservering)
   - Toont waarschuwingen en stelt alternatieven voor

3. **Slimme Planning Suggesties:**
   - AI functie die voorstelt hoe projecten het beste gepland kunnen worden
   - Gebaseerd op capaciteit, datums, en prioriteiten

4. **Capaciteit Overzicht:**
   - Per medewerker overzicht van beschikbare capaciteit
   - Waarschuwing als capaciteit overschreden wordt

5. **Project Dependencies Visualisatie:**
   - Grafische weergave van afhankelijkheden tussen projecten
   - Bijvoorbeeld: project B kan niet starten voordat project A klaar is

