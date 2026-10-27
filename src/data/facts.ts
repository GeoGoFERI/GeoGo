import type { Fact } from '../core/item';

// hand-written facts: Slovenian, one or two sentences, a cause or a link where possible, no
// numbers. None of them has been checked by a person, so every fact is `reviewed: false`; a
// teacher should review them before release.
const SEED = 'Curriculum list seed; Slovenian wording machine-drafted; not reviewed';
const GENERAL = 'General geography knowledge; machine-drafted; not reviewed';

const seed = (textSl: string): Fact => ({ textSl, source: SEED, reviewed: false });
const general = (textSl: string): Fact => ({ textSl, source: GENERAL, reviewed: false });

export const FACTS: Readonly<Record<string, Fact>> = {
  // Level 1: continents
  'continent-evropa': general(
    'Evropa in Azija sta en sam velik kos kopnega, ki mu pravimo Evrazija.',
  ),
  'continent-azija': seed('Azija je največja celina na Zemlji.'),
  'continent-afrika': general(
    'Skozi Afriko poteka ekvator, zato ima velik del celine vroče podnebje.',
  ),
  'continent-severna-amerika': general(
    'Severno in Južno Ameriko povezuje ozek pas kopnega v Srednji Ameriki.',
  ),
  'continent-juzna-amerika': general('Ob zahodni obali Južne Amerike se vleče dolgo gorstvo Andi.'),
  'continent-avstralija': general(
    'Avstralija je najmanjša celina in jo z vseh strani obdaja morje.',
  ),
  'continent-antarktika': seed(
    'Na Antarktiki ni stalnih prebivalcev, živijo le raziskovalci na raziskovalnih postajah.',
  ),

  // Level 1 (and 4): oceans
  'ocean-atlantski': seed(
    'Atlantski ocean leži med Evropo in Afriko na eni ter Amerikama na drugi strani. Topel morski tok v njem blaži podnebje zahodne Evrope.',
  ),
  'ocean-tihi': seed('Tihi ocean je največji in najgloblji ocean na Zemlji.'),
  'ocean-indijski': general(
    'Indijski ocean leži med Afriko, Azijo in Avstralijo; na severu ga zapira azijska celina.',
  ),
  'ocean-arkticni': seed(
    'Arktični ocean leži severno od Evrope in ga večinoma prekriva morski led.',
  ),
  'ocean-juzni': seed('Južni ocean obdaja Antarktiko.'),

  // Level 2
  'line-ekvator': seed(
    'Ekvator deli Zemljo na severno in južno poloblo. Prečka Afriko, Južno Ameriko in Azijo.',
  ),
  'line-zacetni-poldnevnik': seed(
    'Začetni poldnevnik poteka skozi Greenwich pri Londonu in deli Zemljo na vzhodno in zahodno poloblo.',
  ),
  'pole-severni': general('Severni pol leži sredi Arktičnega oceana, na zamrznjenem morju.'),
  'pole-juzni': general('Južni pol leži sredi Antarktike.'),

  // Level 4
  'peninsula-skandinavski': seed(
    'Ledeniki so ob norveški obali izdolbli globoke doline, ki jih je pozneje zalilo morje. Tako so nastali fjordi.',
  ),
  'peninsula-pirenejski': seed(
    'Na Pirenejskem polotoku ležita Španija in Portugalska. Od preostale Evrope ga ločijo Pireneji.',
  ),
  'peninsula-apeninski': seed(
    'Apeninski polotok ima obliko škornja; na njem leži večji del Italije.',
  ),
  'peninsula-balkanski': seed(
    'Balkanski polotok je razgiban in gorat, na njem pa leži veliko držav.',
  ),
  'islands-britansko-otocje': seed(
    'Britansko otočje sestavljata velika otoka Velika Britanija in Irska ter množica manjših otokov.',
  ),
  'island-islandija': seed(
    'Islandija leži na meji med litosferskima ploščama, zato ima veliko ognjenikov in gejzirjev.',
  ),
  'island-korzika': seed(
    'Korzika je otok v zahodnem delu Sredozemskega morja, severno od Sardinije.',
  ),
  'island-sardinija': seed(
    'Sardinija je otok v zahodnem delu Sredozemskega morja, južno od Korzike.',
  ),
  'island-sicilija': seed(
    'Sicilija je največji otok v Sredozemskem morju. Na njej je delujoči ognjenik Etna.',
  ),
  'island-kreta': seed('Kreta je največji grški otok.'),
  'mountain-pireneji': seed('Pireneji so gorska meja med Francijo in Španijo.'),
  'mountain-alpe': seed(
    'Alpe so mlado nagubano gorstvo. Nastale so, ko sta trčili litosferski plošči.',
  ),
  'mountain-apenini': seed('Apenini so gorska hrbtenica Apeninskega polotoka.'),
  'mountain-karpati': seed(
    'Karpati se v velikem loku vlečejo čez Slovaško, Poljsko, Ukrajino in Romunijo.',
  ),
  'mountain-dinarsko-gorstvo': seed(
    'Dinarsko gorstvo poteka ob Jadranskem morju. Po njegovi apnenčasti pokrajini je svet dobil besedo kras.',
  ),
  'mountain-skandinavsko-gorstvo': seed(
    'Skandinavsko gorstvo je staro nagubano gorstvo, ki so ga preoblikovali ledeniki.',
  ),
  'mountain-ural': seed('Ural velja za dogovorjeno mejo med Evropo in Azijo.'),
  'mountain-evropska-sredogorja': seed(
    'Evropska sredogorja so nižja gorstva v srednji Evropi, severno od Alp.',
  ),
  'lowland-panonska': seed(
    'Panonska nižina se razprostira ob Donavi in Tisi ter sega do severovzhodne Slovenije.',
  ),
  'lowland-vzhodnoevropsko': seed(
    'Vzhodnoevropsko nižavje je ogromna ravnina, ki se razteza od Poljske do Urala.',
  ),
  'river-ren': seed(
    'Ren izvira v Alpah in teče v Severno morje. Je ena najpomembnejših plovnih poti v Evropi.',
  ),
  'river-donava': seed('Donava teče skozi veliko držav in se izliva v Črno morje.'),
  'river-volga': seed('Volga je najdaljša reka v Evropi in se izliva v Kaspijsko jezero.'),
  'sea-sredozemsko': seed(
    'Sredozemsko morje je z Atlantskim oceanom povezano skozi Gibraltarska vrata.',
  ),
  'sea-jadransko': seed(
    'Jadransko morje je del Sredozemskega morja. Slovenska obala leži na njegovem severnem koncu.',
  ),
  'sea-crno': seed('Črno morje je s Sredozemskim morjem povezano skozi ožino Bospor.'),
};
