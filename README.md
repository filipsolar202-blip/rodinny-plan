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

Settings → Pages → Source: GitHub Actions. Push do `main` spouští testy a nasazení. Publikuje se pouze index, src a metodika. Relativní cesty fungují v podadresáři repozitáře.

## Ochrana dat a budoucí synchronizace

IndexedDB ani JSON nejsou šifrované. Zařízení a zálohy musí být chráněné. Prohlížeč může úložiště vymazat; exportujte pravidelně. Každý origin má vlastní úložiště, localhost a GitHub Pages nesdílejí případy. Přenos mezi zařízeními zatím řeší JSON.

Budoucí adaptér může zachovat rozhraní `all/put/remove` a přidat autentizaci, autorizaci každého případu, oddělení poradců, audit, šifrované zálohy a řešení konfliktů. Lokální šifrování lze řešit Web Crypto AES-GCM s klíčem odvozeným z hesla; klíč se nesmí uložit vedle dat. Synchronizace potřebuje samostatný zabezpečený backend s TLS, řízením přístupu, retenčními pravidly a obnovou. Tyto budoucí funkce v1 nepředstírá. GitHub Pages ani repozitář nesmějí sloužit jako databáze klientů.

## Vzhled

Paleta odpovídá FILIP CRM: modrá #356aa5, doplňková #4b7da3, text #234366 a modrostříbrné rámečky. Stejné písmo Fustat je vložené přímo v CSS, takže funguje i v samostatném HTML reportu bez připojení k internetu. Licence: Fustat-OFL.txt.
