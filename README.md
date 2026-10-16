# Rodinný krizový a dědický plán

Česká statická aplikace pro pracovní finanční analýzu rodiny. Bez backendu, analytických služeb a externě načítaných knihoven či fontů. Písmo Fustat je přibalené pod licencí SIL OFL 1.1. Klientské případy zůstávají v IndexedDB. Ve zdrojovém kódu je pouze smyšlená ukázka.

## Spuštění a testy

`python3 -m http.server 4173` — poté otevřete http://localhost:4173 . ES moduly a úložiště potřebují HTTP(S), ne `file://`.

Node.js 22+: `npm test`. Instalace balíčků není potřeba.

## Použití

1. Otevřete ukázkovou rodinu nebo založte nový případ.
2. Doplňte osoby, právní rodiče, manželství s daty a relevantní domácnosti.
3. Zadejte majetek a závazky. Podíly musí dát 100 %. SJM 50/50 je zjednodušený finanční model, který se samostatně potvrzuje.
4. Ve správě případu potvrďte úplnost relevantních dat. Neznámá skutečnost není automaticky nepřítomná skutečnost.
5. Ve scénářích vyberte osobu. A/B počítají zákonný model. C eviduje dokumenty a vyžaduje notáře. D/E porovnávají hypotetické hodnotové varianty. F vytvoří kopii s převodem majetku. G přenáší modelové podíly do další události v pracovní kopii, původní případ nemění.
6. Vyplňte finanční ochranu a krizový manuál. Formuláře ukládejte tlačítkem.
7. Stáhněte JSON zálohu. Report lze stáhnout jako HTML nebo přes dialog tisku uložit do PDF.

## Právní rozsah

Viz [metodika](docs/METODIKA.md). Kontrola veřejných zdrojů 15. 10. 2026 není odborným právním ověřením. Před klientským použitím musí model a jeho rozsah schválit kvalifikovaný český právník nebo notář.

Automatizován je pracovní model šesti zákonných tříd, běžné reprezentace, povinných dílů dle věku a výslovně zvoleného vypořádání SJM. Nejasné vlastnictví, cizí měny, upravené SJM, dary k započtení, právní výjimky, osvojení, partnerství se zvláštními účinky, zahraničí, předlužení a platnost závětí/smluv vyžadují individuální posouzení; přesný výsledek je blokován. Aplikace nerozhoduje o dluhové odpovědnosti a nezaměňuje podíl za hotovostní nárok.

Pátá a šestá třída vyžadují evidenci obou rodičů a čtyř prarodičů včetně zemřelých. Úplnost dalších relevantních vazeb potvrzuje uživatel. Právo osvojených osob není popíráno: automatický výpočet je blokován kvůli různým právním účinkům osvojení.

## Architektura

- `src/engine.js`: čisté výpočty a validace bez DOM a úložiště.
- `src/data.js`: schéma v1, číselníky a smyšlená ukázka.
- `src/storage.js`: rozhraní CaseRepository pro ukládání a import.
- `src/rules.js`, `docs/METODIKA.md`: pravidla a právní rozsah.
- `src/app.js`, `src/style.css`: formuláře, strom a report.
- `tests/engine.test.js`: regresní výpočetní testy.
- `.github/workflows/pages.yml`: testy před nasazením na GitHub Pages.

## Nasazení

Settings → Pages → Source: GitHub Actions. Push do `main` spouští testy a nasazení. Publikuje se obsah sestavení `dist`: aplikace, dotazník, vložené písmo s licencí a metodika. Žádná klientská data. Relativní cesty fungují v podadresáři repozitáře.

## Ochrana dat a budoucí synchronizace

IndexedDB ani JSON nejsou šifrované. Zařízení a zálohy musí být chráněné. Prohlížeč může úložiště vymazat; exportujte pravidelně. Každý origin má vlastní úložiště, localhost a GitHub Pages nesdílejí případy. Přenos mezi zařízeními zatím řeší JSON.

Budoucí adaptér může zachovat rozhraní `all/put/remove` a přidat autentizaci, autorizaci každého případu, oddělení poradců, audit, šifrované zálohy a řešení konfliktů. Lokální šifrování lze řešit Web Crypto AES-GCM s klíčem odvozeným z hesla; klíč se nesmí uložit vedle dat. Synchronizace potřebuje samostatný zabezpečený backend s TLS, řízením přístupu, retenčními pravidly a obnovou. Tyto budoucí funkce v1 nepředstírá. GitHub Pages ani repozitář nesmějí sloužit jako databáze klientů.

## Vzhled

Paleta odpovídá FILIP CRM: modrá #356aa5, doplňková #4b7da3, text #234366 a modrostříbrné rámečky. Stejné písmo Fustat je vložené přímo v CSS, takže funguje i v samostatném HTML reportu bez připojení k internetu. Licence: Fustat-OFL.txt.

## Dotazník a prezentace

1. V přehledu zkopírujte odkaz na `dotaznik.html` nebo stáhněte samostatný HTML soubor. Soubor funguje i bez připojení; příjemce jej musí otevřít v prohlížeči (náhled přílohy nemusí spouštět formulář).
2. Klient projde sedm kroků, může uložit rozpracovaný JSON a později pokračovat. Důležité otázky mají povinnou odpověď, včetně výslovného „Nevím“.
3. V posledním kroku stáhne `odpovedi-rodinny-plan.json` a předá jej poradci dohodnutým kanálem. Formulář nic automaticky neposílá.
4. Tlačítko „Nahrát odpovědi / zálohu“ vytvoří nový případ; existující nepřepíše. Rozpracovaný či neúplný dotazník odmítne. Neznámé hodnoty zůstávají označené a výpočet je blokovaný do kontroly.
5. V části Dotazník klienta doplňte skutečné údaje v rodině, majetku a financích. Každý kontrolní bod vyžaduje popis zjištění a potvrzení. Majetek musí mít ověřené hodnoty i vlastnictví. Poté potvrďte úplnost ve správě případu. Kontrola poradcem nenahrazuje právní revizi modelu.
6. Klientský report je prezentace s postavami, grafickými podíly, navigací a rozbalovacím vysvětlením. HTML obsahuje vzhled i písmo a lze je předat samostatně.
7. Tisk / PDF: A4 na šířku, 100 %, vypnutá záhlaví a zápatí prohlížeče. Každé téma má vlastní stránku; dlouhý manuál se dělí na pokračování. Tisk zahrnuje všechny stránky i rozbalovací vysvětlení.

Sestavení: `npm run build`; pro kompletní místní náhled spusťte server v `dist`. `npm test` ověřuje výpočty, povinné odpovědi, import a bezpečné generování prezentace. `node scripts/sample-report.mjs` vytvoří pouze smyšlené kontrolní HTML v ignorované složce `output/pdf`. Tato složka se na GitHub Pages neposílá.
