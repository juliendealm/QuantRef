---
title: Volatilité
subject: risk
summary: L'écart-type des rendements, coté en annualisé. Le seul nombre qui pilote le prix des options, les limites de risque et le dimensionnement des positions — groupé en paquets, à retour à la moyenne, jamais observé et bruité à estimer.
difficulty: 2
interview: 5
tags: [volatility, realised-volatility, implied-volatility, ewma, garch, annualisation]
prerequisites: [variance]
related: [black-scholes, greeks, value-at-risk]
---

## Intuition

La volatilité est l'écart-type des rendements : la racine carrée de la [[variance]], remise dans les unités du rendement pour être lisible. « Cette action a une vol de 20 % » signifie que sur un an, sous un modèle à peu près normal, son rendement tombera à $\pm 20\,\%$ de sa moyenne environ deux fois sur trois.

Trois choses rendent la volatilité plus subtile qu'un écart-type de manuel.

**Elle est cotée en annualisé, quelle que soit la fréquence d'échantillonnage.** Des rendements quotidiens de $1\,\%$ ne sont jamais décrits ainsi ; ils deviennent « vol à 16 % », car $0{,}01\sqrt{252} \approx 0{,}159$. L'annualisation est une convention qui permet de comparer sur un même axe un chiffre de risque à un jour, une option à un mois et une swaption à cinq ans.

**Elle n'est pas constante.** Les semaines calmes suivent les semaines calmes et les journées violentes se regroupent. La volatilité est la seule caractéristique des rendements qui soit véritablement prévisible — les rendements quotidiens sont essentiellement imprévisibles, mais la volatilité de demain est bien prédite par celle d'aujourd'hui.

**Elle n'est jamais observée.** On observe des rendements ; la volatilité est un paramètre de la loi dont ils ont été tirés. Tout ce qui suit est une tentative de l'estimer : à partir des rendements passés (réalisée), à partir d'un modèle (EWMA, GARCH), ou à partir des prix d'options (implicite).

## Formulation mathématique

Notons $S_t$ le prix et $r_t = \ln(S_t/S_{t-1})$ le rendement logarithmique sur une période.

::: formula Volatilité et annualisation
$$
\sigma_{\text{période}} = \sqrt{\operatorname{Var}(r_t)}, \qquad
\sigma_{\text{ann}} = \sigma_{\text{période}}\sqrt{N},
$$
avec $N$ périodes par an : $N = 252$ en données quotidiennes, $52$ en hebdomadaire, $12$ en mensuel.
:::

**Rendements logarithmiques contre rendements simples.** Les rendements simples se composent multiplicativement, $1 + R_{0,h} = \prod_{t=1}^h (1+R_t)$, donc ils ne s'additionnent pas. Les rendements log s'additionnent exactement : $r_{0,h} = \sum_{t=1}^h r_t$. Comme la variance est additive sur des termes indépendants, les règles d'agrégation et de mise à l'échelle ci-dessous portent sur les rendements **log**. Pour de petits mouvements $r_t \approx R_t$ et la distinction est du second ordre, mais sur des horizons longs ou avec de grands mouvements elle ne l'est plus.

::: formula Règle de la racine du temps
Si les rendements sont i.i.d. (loi quelconque de variance finie), alors $\operatorname{Var}(r_{0,h}) = h\,\sigma^2$ et
$$
\sigma_h = \sigma\sqrt{h}.
$$
Avec des autocorrélations $\rho_k = \operatorname{Corr}(r_t, r_{t+k})$, le résultat exact est
$$
\sigma_h^2 = \sigma^2\Big(h + 2\sum_{k=1}^{h-1}(h-k)\rho_k\Big).
$$
:::

Une autocorrélation positive (tendance) rend le vrai $\sigma_h$ supérieur à $\sigma\sqrt{h}$ ; une autocorrélation négative (retour à la moyenne, rebond bid–ask) le rend inférieur. Seule l'hypothèse i.i.d. fait disparaître la correction.

**Volatilité réalisée.** L'estimateur simple close-to-close sur $n$ jours :

$$
\hat\sigma^2 = \frac{1}{n-1}\sum_{t=1}^{n} (r_t - \bar{r})^2 ,
$$

souvent avec $\bar{r}$ forcé à $0$, car sur des fenêtres courtes la moyenne est plus petite que sa propre erreur d'estimation.

**Les estimateurs de plage** utilisent le plus haut $H$, le plus bas $L$, l'ouverture $O$ et la clôture $C$ de la séance, qui portent plus d'information que la seule clôture :

::: formula Parkinson et Garman–Klass
$$
\hat\sigma^2_{\text{P}} = \frac{1}{4\ln 2}\Big(\ln\frac{H}{L}\Big)^2,
\qquad
\hat\sigma^2_{\text{GK}} = \frac12\Big(\ln\frac{H}{L}\Big)^2 - (2\ln 2 - 1)\Big(\ln\frac{C}{O}\Big)^2 .
$$
:::

Les deux sont sans biais pour un [[brownian-motion|mouvement brownien]] géométrique sans dérive. Parkinson a environ $5\times$ l'efficacité de l'estimateur close-to-close (un jour de plages vaut à peu près cinq jours de clôtures), Garman–Klass environ $7\times$.

**Modèles de variance conditionnelle.** Soit $\sigma_t^2$ la variance de $r_t$ sachant l'information jusqu'à $t-1$ :

::: formula EWMA et GARCH(1,1)
$$
\text{EWMA : } \sigma_t^2 = \lambda\,\sigma_{t-1}^2 + (1-\lambda)\,r_{t-1}^2, \qquad \lambda = 0{,}94 \text{ (RiskMetrics, quotidien)},
$$
$$
\text{GARCH(1,1) : } \sigma_t^2 = \omega + \alpha\,r_{t-1}^2 + \beta\,\sigma_{t-1}^2,
\qquad
\sigma_\infty^2 = \frac{\omega}{1 - \alpha - \beta}\ \ (\alpha + \beta < 1).
$$
:::

$\alpha + \beta$ est la **persistance** : la fraction d'un choc de variance qui survit un jour. Sur actions, les estimations typiques sont $\alpha \approx 0{,}05$–$0{,}10$ et $\beta \approx 0{,}85$–$0{,}92$, donc $\alpha + \beta \approx 0{,}95$–$0{,}99$ et les chocs s'amortissent avec une demi-vie de quelques semaines. L'EWMA est exactement le cas limite $\omega = 0$, $\alpha + \beta = 1$ : persistance infinie, aucun niveau de long terme vers lequel revenir. Pour $\lambda = 0{,}94$, la demi-vie vaut $\ln(0{,}5)/\ln(0{,}94) \approx 11$ jours.

## Dérivation

**Pourquoi $\sqrt{h}$.** Pour des rendements log, $r_{0,h} = \sum_{t=1}^{h} r_t$, donc par la formule de la variance d'une somme,
$$
\operatorname{Var}(r_{0,h}) = \sum_{t}\operatorname{Var}(r_t) + 2\sum_{t<u}\operatorname{Cov}(r_t, r_u).
$$
Si les rendements sont non corrélés et de variance commune $\sigma^2$, la seconde somme s'annule et la première vaut $h\sigma^2$. Notons ce qui n'est *pas* requis : ni la normalité ni l'indépendance, seulement l'absence d'autocorrélation et une variance constante. En comptant les paires à chaque retard ($h - k$ paires au retard $k$), on obtient la formule générale ci-dessus.

Passer du jour à l'année, c'est le même énoncé avec $h = N$ ; le $\sqrt{252}$ omniprésent ne fait que compter les jours de bourse.

**Le regroupement de volatilité ne casse pas directement la règle en $\sqrt{h}$.** Si $\sigma_t$ varie mais que les rendements restent non corrélés, $\operatorname{Var}(r_{0,h}) = \sum_t \mathbb{E}[\sigma_t^2]$ reste vrai — la règle va bien pour la variance *inconditionnelle*. Ce que le regroupement casse, c'est l'application de la règle à une estimation *conditionnelle* : mettre à l'échelle par $\sqrt{10}$ un $\sigma_t$ aujourd'hui élevé ignore le retour à la moyenne et surestime le risque à dix jours. La prévision GARCH le rend explicite : la variance conditionnelle à $k$ pas vaut
$$
\mathbb{E}[\sigma_{t+k}^2 \mid \mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^{k}\big(\sigma_{t+1}^2 - \sigma_\infty^2\big),
$$
qui ramène vers $\sigma_\infty^2$ à la vitesse $\alpha + \beta$. Ce n'est que lorsque $\alpha + \beta = 1$ (EWMA) que l'extrapolation plate en $\sqrt{h}$ est cohérente avec elle-même.

**À quel point une estimation de volatilité est-elle bruitée ?** Pour $n$ rendements normaux i.i.d., $(n-1)\hat\sigma^2/\sigma^2 \sim \chi^2_{n-1}$, donc $\operatorname{Var}(\hat\sigma^2) = 2\sigma^4/(n-1)$. La méthode delta avec $g(x) = \sqrt{x}$ et $g'(\sigma^2) = 1/(2\sigma)$ donne

::: formula Erreur type d'une estimation de volatilité
$$
\operatorname{sd}(\hat\sigma) \approx \frac{\sigma}{\sqrt{2n}}, \qquad \text{erreur relative } \frac{\operatorname{sd}(\hat\sigma)}{\sigma} \approx \frac{1}{\sqrt{2n}} .
$$
:::

Si on fixe l'erreur relative à $10\,\%$ : $n = 1/(2 \cdot 0{,}01) = 50$ jours. Pour $1\,\%$ il faut $n = 5000$ jours, environ vingt ans — pendant lesquels la volatilité a certainement changé. C'est la tension centrale de l'estimation de volatilité : une fenêtre longue est précise sur un paramètre qui ne s'applique plus, une fenêtre courte est actuelle et bruitée. Une vol réalisée à un mois (21 jours) porte une erreur type relative de $\pm 15\,\%$ ; un affichage à $22\,\%$ ne se distingue pas d'un affichage à $19\,\%$.

## Hypothèses et cas limites

- **Les estimateurs de plage ratent les gaps overnight.** Parkinson et Garman–Klass ne mesurent que la séance. Pour une action qui gappe sur ses résultats, ils peuvent gravement sous-estimer le vrai risque close-to-close. Ils supposent aussi une dérive nulle et une observation continue : avec une forte tendance ils sont biaisés, et l'échantillonnage discret fait que le plus haut et le plus bas observés sont à l'intérieur des vrais, ce qui les biaise **vers le bas** (de l'ordre de $-1\,\%$ à $-3\,\%$ sur des valeurs liquides, bien plus sur des titres étroits).
- **Le raccourci de moyenne nulle.** Forcer $\bar{r} = 0$ est un arbitrage biais–variance. Sur une fenêtre de 21 jours, l'erreur d'estimation de la moyenne domine la dérive elle-même, donc l'estimateur contraint est généralement meilleur ; sur des fenêtres pluriannuelles, il faut retrancher la moyenne.
- **Prix non synchrones ou figés.** Les actifs illiquides affichent une volatilité et une corrélation artificiellement basses parce que les prix ne se mettent pas à jour. Le rebond bid–ask fait l'inverse en haute fréquence : il crée de l'autocorrélation négative et gonfle la variance réalisée haute fréquence — d'où les estimateurs robustes au bruit de microstructure.
- **$\alpha + \beta \ge 1$.** La variance inconditionnelle GARCH $\omega/(1-\alpha-\beta)$ n'existe que si $\alpha + \beta < 1$. Une persistance estimée très proche de $1$ est fréquente et signale souvent une rupture structurelle non modélisée plutôt qu'une véritable racine unitaire dans la variance.
- **Volatilité de quoi ?** La volatilité de rendements de prix, d'un spread, d'un taux (vol en points de base) et d'une série de futures ajustée des rolls sont des nombres différents. Coter une vol sans dire de quelle série elle vient est aussi incomplet que coter une VaR sans horizon.

## Exemple détaillé

On simule une série de rendements GARCH(1,1) où la vraie volatilité conditionnelle est connue, puis on compare une fenêtre glissante de 21 jours à une EWMA. Les deux sont de véritables prévisions : chaque estimation de $\sigma_t$ n'utilise que les rendements jusqu'à $t-1$.

```python
import numpy as np

rng = np.random.default_rng(11)
n = 4000
omega, alpha, beta = 2.0e-6, 0.08, 0.90   # long-run var = omega/(1-a-b)

# Simulate GARCH(1,1): r_t = sigma_t z_t, sigma_t known before r_t.
r = np.zeros(n)
s2 = np.zeros(n)
s2[0] = omega / (1 - alpha - beta)
z = rng.standard_normal(n)
for t in range(n):
    if t > 0:
        s2[t] = omega + alpha * r[t - 1] ** 2 + beta * s2[t - 1]
    r[t] = np.sqrt(s2[t]) * z[t]
true_vol = np.sqrt(s2)

# Forecast sigma_t using information up to t-1 only.
win = 21
roll = np.full(n, np.nan)
for t in range(win, n):
    roll[t] = r[t - win:t].std(ddof=1)

lam = 0.94
ewma = np.zeros(n)
ewma[0] = s2[0]
for t in range(1, n):
    ewma[t] = lam * ewma[t - 1] + (1 - lam) * r[t - 1] ** 2
ewma = np.sqrt(ewma)

m = ~np.isnan(roll)
rmse = lambda x: np.sqrt(np.mean((x[m] - true_vol[m]) ** 2))
print(f"long-run vol (annualised)  = {np.sqrt(omega / (1 - alpha - beta) * 252):.4f}")
print(f"realised   vol (annualised) = {r.std(ddof=1) * np.sqrt(252):.4f}")
print(f"RMSE 21-day rolling (daily) = {rmse(roll):.6f}")
print(f"RMSE EWMA lambda=0.94       = {rmse(ewma):.6f}")
print(f"persistence alpha+beta      = {alpha + beta:.2f}")
```

::: output
```
long-run vol (annualised)  = 0.1587
realised   vol (annualised) = 0.1563
RMSE 21-day rolling (daily) = 0.001141
RMSE EWMA lambda=0.94       = 0.000660
persistence alpha+beta      = 0.98
```
:::

L'erreur de l'EWMA est environ $42\,\%$ plus faible que celle de la fenêtre glissante. Deux raisons : la fenêtre glissante pondère un rendement vieux de 21 jours exactement comme celui d'hier, et elle laisse tomber les observations brutalement, si bien qu'un unique grand mouvement entre dans la fenêtre, y reste à plat 21 jours, puis en sort en créant une chute fantôme de l'estimation. L'EWMA s'amortit en douceur avec une demi-vie de $11$ jours et réagit immédiatement. Notons aussi que la volatilité inconditionnelle réalisée ($15{,}6\,\%$) est proche du niveau de long terme du modèle ($15{,}9\,\%$) sans l'atteindre : même 4000 jours laissent une erreur d'échantillonnage, cohérente avec l'erreur type relative $1/\sqrt{2n} \approx 1{,}1\,\%$.

## Pourquoi c'est important en finance quantitative

- **C'est le seul paramètre libre de [[black-scholes]].** Le spot, le strike, l'échéance et les taux sont observables ; la volatilité ne l'est pas. Le pricing d'options est donc *entièrement* un problème de prévision de volatilité, et coter un prix en unités de vol plutôt qu'en devise est la façon qu'a le marché d'évacuer tout le reste.
- **La volatilité implicite est un prix, pas une prévision.** Inverser [[black-scholes]] pour trouver le $\sigma$ qui reproduit un prix de marché donne la vol implicite. Elle dépasse systématiquement la volatilité réalisée ultérieure — la **prime de risque de variance**, environ 1 à 3 points de vol sur les options d'indice — parce que les vendeurs d'options exigent une compensation pour être short gamma dans les krachs. L'implicite varie aussi avec le strike et l'échéance (le smile), ce qui affirme directement que le modèle à vol constante est faux.
- **La volatilité se négocie pour elle-même.** Le P&L d'une option delta-couverte vaut $\tfrac12 \sum \Gamma S^2(r_t^2 - \sigma_{\text{imp}}^2 \Delta t)$ — variance réalisée contre variance implicite (voir [[greeks]]). Un **variance swap** paie $N(\sigma_R^2 - K^2)$ et en est l'instrument naturel, car c'est la *variance*, et non la volatilité, qu'un portefeuille statique d'options pondérées en $1/K^2$ plus une couverture delta dynamique réplique exactement (l'argument du log-contract). Un volatility swap paie $\sqrt{\text{variance}}$, fonction concave, et exige donc un ajustement de convexité sans réplication statique possible — c'est pourquoi le marché cote des variance swaps et en déduit les vol swaps.
- **Limites de risque et dimensionnement.** La volatilité est le $\sigma$ de la [[value-at-risk]] paramétrique, le facteur d'échelle des stratégies à volatilité cible ($w_t \propto 1/\hat\sigma_t$), et le dénominateur de tout ratio de Sharpe.
- **Les faits stylisés dictent le choix de modèle.** La volatilité se **regroupe** (les grands mouvements suivent les grands mouvements — c'est ce que capture GARCH) ; les rendements ont des **queues épaisses** même après conditionnement ; l'**effet de levier** fait qu'un rendement négatif augmente plus la volatilité future qu'un rendement positif de même taille (d'où les modèles asymétriques comme GJR-GARCH et le skew actions) ; et la volatilité **revient à sa moyenne**. Surtout, elle est bien plus prévisible que les rendements : un $R^2$ proche de $0$ pour la prévision de rendement est normal, tandis que $0{,}3$–$0{,}5$ pour la variance du lendemain est courant.

## Erreurs fréquentes

::: pitfall Mettre à l'échelle une volatilité conditionnelle par $\sqrt{h}$
La règle exige des rendements i.i.d. Appliquée à une estimation GARCH ou EWMA *courante* pendant un épisode de stress, elle ignore le retour à la moyenne et surestime le chiffre à 10 jours ; appliquée en période calme, elle le sous-estime. Il faut utiliser $\mathbb{E}[\sigma_{t+k}^2\mid\mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^k(\sigma_{t+1}^2 - \sigma_\infty^2)$ et sommer sur $k$, pas un $\sqrt{10}$ plat.
:::

::: pitfall Annualiser des rendements simples comme s'ils s'additionnaient
Seuls les rendements log s'agrègent additivement. Construire une volatilité mensuelle en multipliant par $\sqrt{21}$ des rendements *simples* quotidiens mélange une règle additive et une quantité multiplicative. L'erreur est du second ordre pour de petits mouvements et matérielle pour un actif volatil (crypto, options mono-sous-jacent) sur des horizons longs.
:::

::: pitfall Lire un changement d'estimation de volatilité comme un changement de volatilité
Avec une fenêtre de 21 jours, l'erreur type relative vaut $1/\sqrt{42} \approx 15\,\%$. Une vol réalisée passant de $18\,\%$ à $22\,\%$ reste largement dans le bruit — avant de crier au changement de régime, demande-toi si le mouvement dépasse environ $2\hat\sigma/\sqrt{2n}$.
:::

::: pitfall Comparer implicite et réalisée sans précaution
Il faut les apparier en horizon et, plus subtilement, la vol implicite est une espérance risque-neutre de *variance* sous une autre mesure. Une implicite à 30 jours de $20\,\%$ contre une réalisée glissante à 30 jours de $16\,\%$ n'est pas un mispricing : c'est la prime de risque de variance, plus le fait que l'une regarde vers l'avant et l'autre vers l'arrière.
:::

::: pitfall Faire confiance aux estimateurs de plage sur des actifs qui gappent
Parkinson et Garman–Klass ne voient que la séance. Sur une valeur qui gappe overnight — résultats, publications biotech, tout ce qui a des nouvelles programmées — ils peuvent sous-estimer sérieusement le risque tout en paraissant impressionnants de précision.
:::

## Révision en 30 secondes

La volatilité vaut $\sqrt{\operatorname{Var}(r)}$, cotée en annualisé : $\sigma_{\text{ann}} = \sigma_{\text{quotidien}}\sqrt{252}$. Rendements log, parce qu'ils s'additionnent. La règle en $\sqrt{h}$ exige des rendements non corrélés à variance constante — la version exacte porte $2\sum_k (h-k)\rho_k$. On l'estime sur les clôtures, sur les plages (Parkinson environ $5\times$ plus efficace mais aveugle aux gaps), ou par un modèle : EWMA $\sigma_t^2 = \lambda\sigma_{t-1}^2 + (1-\lambda)r_{t-1}^2$ avec $\lambda = 0{,}94$, ou GARCH(1,1) de variance de long terme $\omega/(1-\alpha-\beta)$ et de persistance $\alpha+\beta$. Faits stylisés : regroupement, queues épaisses, effet de levier, retour à la moyenne, et la vol est bien plus prévisible que les rendements. La vol implicite est le prix du marché en unités de vol et dépasse la réalisée de la prime de risque de variance. Les estimations sont bruitées : erreur relative $\approx 1/\sqrt{2n}$, donc $10\,\%$ de précision demande 50 observations.

## Formules clés

| Nom | Formule |
|---|---|
| Annualisation | $\sigma_{\text{ann}} = \sigma_{\text{période}}\sqrt{N}$, $N = 252$ en quotidien |
| Racine du temps | $\sigma_h = \sigma\sqrt{h}$ (rendements i.i.d.) |
| Avec autocorrélation | $\sigma_h^2 = \sigma^2\big(h + 2\sum_{k=1}^{h-1}(h-k)\rho_k\big)$ |
| Close-to-close | $\hat\sigma^2 = \frac{1}{n-1}\sum_t (r_t - \bar r)^2$ |
| Parkinson | $\hat\sigma_{\text{P}}^2 = \frac{1}{4\ln 2}\big(\ln (H/L)\big)^2$ |
| Garman–Klass | $\hat\sigma_{\text{GK}}^2 = \frac12\big(\ln (H/L)\big)^2 - (2\ln 2 - 1)\big(\ln (C/O)\big)^2$ |
| EWMA | $\sigma_t^2 = \lambda\sigma_{t-1}^2 + (1-\lambda)r_{t-1}^2$, $\lambda = 0{,}94$ |
| GARCH(1,1) | $\sigma_t^2 = \omega + \alpha r_{t-1}^2 + \beta\sigma_{t-1}^2$, $\sigma_\infty^2 = \omega/(1-\alpha-\beta)$ |
| Bruit d'estimation | $\operatorname{sd}(\hat\sigma)/\sigma \approx 1/\sqrt{2n}$ |

## Questions d'entretien

::: question Les rendements quotidiens ont un écart-type de $1{,}2\,\%$. Quelle est la volatilité annualisée, et qu'as-tu supposé ?
::: hint
Multiplie par $\sqrt{N}$ avec $N$ jours de bourse.
:::
::: answer
$0{,}012\sqrt{252} = 0{,}012 \times 15{,}87 \approx 19{,}0\,\%$.

Hypothèses : rendements non corrélés d'un jour à l'autre et de variance constante (i.i.d. suffit mais est plus fort que nécessaire), rendements log pour que l'agrégation soit additive, et $252$ jours de bourse par an — une convention en jours calendaires ($\sqrt{365}$) donnerait $22{,}9\,\%$, donc la convention doit être précisée. À retenir comme raccourci mental : $\sqrt{252} \approx 16$, donc vol quotidienne $\times 16 =$ vol annuelle, et une vol annuelle de $16\,\%$ correspond à un mouvement quotidien de $1\,\%$.
:::
:::

::: question Pourquoi le marché cote-t-il des variance swaps plutôt que des volatility swaps ?
::: hint
Laquelle, de la variance ou de la volatilité, est une fonction linéaire du payoff constructible avec un portefeuille statique d'options ?
:::
::: answer
La **variance** réalisée admet une réplication statique exacte : un portefeuille d'options européennes sur tous les strikes, pondérées en $1/K^2$ (un log-contract), plus une couverture delta dynamique dans le sous-jacent, reproduit $\sum r_t^2$ indépendamment du modèle — aucun modèle de volatilité requis. Le strike d'un variance swap est donc une vraie quantité de non-arbitrage, le prix du strip d'options répliquant.

La volatilité est $\sqrt{\text{variance}}$, fonction strictement concave, donc par Jensen $\mathbb{E}[\sqrt{V}] < \sqrt{\mathbb{E}[V]}$ : le strike du vol swap est en dessous de celui du variance swap, de l'écart d'un **ajustement de convexité** qui dépend de la vol-de-vol, donc d'un modèle. Les dealers cotent et couvrent donc la variance et en déduisent les vol swaps. Cette même convexité explique pourquoi un variance swap a un payoff bien plus gras dans un krach : il est long vol-de-vol.
:::
:::

::: question Tu disposes de 60 jours de rendements et tu estimes une volatilité annualisée de $25\,\%$. Donne un intervalle de confiance approximatif, et dis ce qui change avec 250 jours.
::: hint
Utilise $\operatorname{sd}(\hat\sigma) \approx \sigma/\sqrt{2n}$.
:::
::: answer
Erreur type relative $= 1/\sqrt{2 \times 60} = 1/\sqrt{120} \approx 9{,}1\,\%$, donc $\operatorname{sd}(\hat\sigma) \approx 0{,}091 \times 25\,\% = 2{,}3$ points de vol. Un intervalle à $95\,\%$ approximatif vaut $25\,\% \pm 4{,}6\,\%$, soit à peu près de $20\,\%$ à $30\,\%$ — une bande large autour de ce qui ressemblait à un nombre précis.

Avec 250 jours, l'erreur relative tombe à $1/\sqrt{500} \approx 4{,}5\,\%$, soit $\pm 2{,}2$ points. Mais l'arbitrage mord : une fenêtre de 250 jours moyenne sur une année pendant laquelle la vraie volatilité a presque certainement bougé, si bien que ce qu'on gagne en précision statistique on le perd en pertinence. L'intervalle n'est en outre valable que sous normalité et variance constante ; avec des queues épaisses et du regroupement, la taille effective d'échantillon est plus petite que $n$ et le vrai intervalle est plus large.
:::
:::

::: question Un trader dit : « la vol réalisée est à 15 %, l'option à un mois est implicite à 19 %, donc je devrais vendre l'option. » Qu'est-ce qui cloche dans ce raisonnement ?
::: hint
Réfléchis à ce que compensent ces 4 points d'écart, et à la forme du P&L de la position qui en résulte.
:::
::: answer
Trois problèmes.

**L'écart est attendu.** La vol implicite dépasse en moyenne la vol réalisée ultérieure — c'est la prime de risque de variance, historiquement de 1 à 3 points sur les indices actions et davantage sur les ailes. C'est la rémunération d'un risque, pas un repas gratuit : le vendeur de vol est short gamma et perd lourdement exactement quand les marchés krachent et que le reste de son portefeuille souffre aussi. La capter est une stratégie légitime au profil de gain connu et désagréable (petits gains réguliers, pertes très lourdes occasionnelles), pas un arbitrage.

**Passé contre futur.** La vol réalisée glissante est une estimation bruitée du *passé* ; l'implicite est une espérance risque-neutre sur le *mois à venir*. Avec une erreur type relative de $\pm 15\,\%$ à 21 jours, un affichage à $15\,\%$ se distingue à peine de $17\,\%$. Et s'il y a un événement connu dans la fenêtre (résultats, réunion de banque centrale), la vol réalisée future devrait être plus élevée que la vol passée.

**Quelle implicite ?** Un seul nombre masque le smile. Ces $19\,\%$ valent pour un strike ; le P&L d'une position short delta-couverte vaut $\tfrac12\sum \Gamma S^2 (r_t^2 - \sigma_{\text{imp}}^2\Delta t)$, pondéré par le gamma, il dépend donc de l'*endroit* où le sous-jacent passe son temps, pas seulement de la variance réalisée moyenne. Vendre une option à $19\,\%$ et réaliser $16\,\%$ peut quand même perdre de l'argent si les mouvements se produisent là où le gamma est concentré.
:::
:::
