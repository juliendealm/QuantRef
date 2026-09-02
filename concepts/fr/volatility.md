---
title: Volatilité
subject: risk
summary: L'écart-type des rendements, annualisée par convention. Le seul nombre qui pilote le prix des options, les limites de risque et le dimensionnement des positions — elle arrive en grappes, revient à sa moyenne, ne s'observe jamais directement et s'estime avec beaucoup de bruit.
difficulty: 2
interview: 5
tags: [volatility, realised-volatility, implied-volatility, ewma, garch, annualisation]
prerequisites: [variance]
related: [black-scholes, greeks, value-at-risk]
---

## Intuition

La volatilité est l'écart-type des rendements : la racine carrée de la [[variance]], remise dans les unités du rendement. « Cette action a une vol de 20 % » signifie que son rendement annuel se situe à moins de $\pm 20\,\%$ de sa moyenne environ deux fois sur trois. Trois choses la rendent plus subtile qu'un écart-type de manuel. Elle est **cotée en annualisé** quelle que soit la fréquence d'échantillonnage — $1\,\%$ par jour devient « vol à 16 % », car $0{,}01\sqrt{252} \approx 0{,}159$. Elle **n'est pas constante** : les journées calmes et les journées violentes se regroupent, ce qui rend la volatilité prévisible là où les rendements ne le sont pas. Et elle **n'est jamais observée**, seulement estimée — à partir des rendements passés, d'un modèle, ou des prix d'options.

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

## Erreurs fréquentes

::: pitfall Mettre à l'échelle une volatilité conditionnelle par $\sqrt{h}$
La règle exige des rendements i.i.d. Sur une estimation GARCH ou EWMA *courante*, elle ignore le retour à la moyenne : elle surestime le chiffre à 10 jours en stress et le sous-estime en période calme. Utiliser $\mathbb{E}[\sigma_{t+k}^2\mid\mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^{k-1}(\sigma_{t+1}^2 - \sigma_\infty^2)$ et sommer sur $k$, pas un $\sqrt{10}$ plat.
:::

::: pitfall Annualiser des rendements simples comme s'ils s'additionnaient
Seuls les rendements log s'agrègent additivement. Multiplier par $\sqrt{21}$ des rendements *simples* quotidiens mélange une règle additive et une quantité multiplicative — du second ordre pour de petits mouvements, significatif pour un actif volatil sur des horizons longs.
:::

::: pitfall Lire un changement d'estimation de volatilité comme un changement de volatilité
Avec une fenêtre de 21 jours, l'erreur type relative vaut $1/\sqrt{42} \approx 15\,\%$, donc passer de $18\,\%$ à $22\,\%$ reste dans le bruit. Comparer deux fenêtres indépendantes double la variance de l'écart, donc le seuil est $2\hat\sigma/\sqrt{n}$ — $\sqrt{2}$ fois l'erreur type d'une seule estimation, et non une fois.
:::

::: pitfall Comparer implicite et réalisée sans précaution
Il faut les apparier en horizon, et se souvenir que la vol implicite est une espérance risque-neutre de *variance* sous une autre mesure. Une implicite à 30 jours de $20\,\%$ contre une réalisée glissante à 30 jours de $16\,\%$ n'est pas un mispricing : c'est la prime de risque de variance, plus le fait que l'une regarde vers l'avant et l'autre vers l'arrière.
:::

::: pitfall Faire confiance aux estimateurs de plage sur des actifs qui gappent
Parkinson et Garman–Klass ne voient que la séance. Sur une valeur qui gappe overnight — résultats, publications biotech, nouvelles programmées — ils sous-estiment le risque tout en paraissant impressionnants de précision.
:::

## Révision en 30 secondes

La volatilité vaut $\sqrt{\operatorname{Var}(r)}$, cotée en annualisé : $\sigma_{\text{ann}} = \sigma_{\text{quotidien}}\sqrt{252}$. Rendements log, parce qu'ils s'additionnent. La règle en $\sqrt{h}$ exige des rendements non corrélés à variance constante — exactement, $2\sum_k (h-k)\rho_k$ la corrige. On l'estime sur les clôtures, sur les plages (Parkinson environ $5\times$ plus efficace mais aveugle aux gaps), ou par un modèle : EWMA $\sigma_t^2 = \lambda\sigma_{t-1}^2 + (1-\lambda)r_{t-1}^2$ avec $\lambda = 0{,}94$, ou GARCH(1,1) de variance de long terme $\omega/(1-\alpha-\beta)$ et de persistance $\alpha+\beta$. Faits stylisés : regroupement, queues épaisses, effet de levier, retour à la moyenne. La vol implicite est un prix et dépasse la réalisée de la prime de risque de variance. Les estimations sont bruitées : erreur relative $\approx 1/\sqrt{2n}$, donc $10\,\%$ de précision demande 50 observations.

## Formulation mathématique

Avec $S_t$ le prix et $r_t = \ln(S_t/S_{t-1})$ le rendement logarithmique sur une période :

::: formula Volatilité et annualisation
$$
\sigma_{\text{période}} = \sqrt{\operatorname{Var}(r_t)}, \qquad
\sigma_{\text{ann}} = \sigma_{\text{période}}\sqrt{N},
$$
avec $N$ périodes par an : $N = 252$ en données quotidiennes, $52$ en hebdomadaire, $12$ en mensuel.
:::

**Rendements log contre rendements simples.** Les rendements simples se composent, $1 + R_{0,h} = \prod_{t=1}^h (1+R_t)$, donc ils ne s'additionnent pas ; les rendements log si, $r_{0,h} = \sum_{t=1}^h r_t$. La variance étant additive sur des termes indépendants, toutes les règles de mise à l'échelle ci-dessous portent sur les rendements **log**. Pour de petits mouvements $r_t \approx R_t$ ; sur des horizons longs, non.

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

Une autocorrélation positive (tendance) rend $\sigma_h$ supérieur à $\sigma\sqrt{h}$ ; négative (retour à la moyenne, rebond bid–ask), inférieur.

**Volatilité réalisée.** L'estimateur close-to-close sur $n$ jours,

$$
\hat\sigma^2 = \frac{1}{n-1}\sum_{t=1}^{n} (r_t - \bar{r})^2 ,
$$

souvent avec $\bar{r}$ forcé à $0$ : sur des fenêtres courtes la moyenne est plus petite que sa propre erreur d'estimation. **Les estimateurs de plage** utilisent le plus haut $H$, le plus bas $L$, l'ouverture $O$ et la clôture $C$, qui portent plus d'information que la seule clôture :

::: formula Parkinson et Garman–Klass
$$
\hat\sigma^2_{\text{P}} = \frac{1}{4\ln 2}\Big(\ln\frac{H}{L}\Big)^2,
\qquad
\hat\sigma^2_{\text{GK}} = \frac12\Big(\ln\frac{H}{L}\Big)^2 - (2\ln 2 - 1)\Big(\ln\frac{C}{O}\Big)^2 .
$$
:::

Les deux sont sans biais pour un [[brownian-motion|mouvement brownien]] géométrique sans dérive ; Parkinson est environ $5\times$ plus efficace que le close-to-close, Garman–Klass $7\times$.

**Modèles de variance conditionnelle.** Avec $\sigma_t^2$ la variance de $r_t$ sachant l'information jusqu'à $t-1$ :

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

$\alpha + \beta$ est la **persistance**, la fraction d'un choc de variance qui survit un jour. Sur actions, les estimations typiques $\alpha \approx 0{,}05$–$0{,}10$ et $\beta \approx 0{,}88$–$0{,}92$ donnent $\alpha + \beta \approx 0{,}95$–$0{,}99$ : les chocs s'amortissent sur quelques semaines. L'EWMA est le cas limite $\omega = 0$, $\alpha + \beta = 1$ — persistance infinie, aucun niveau de long terme ; pour $\lambda = 0{,}94$, la demi-vie vaut $\ln(0{,}5)/\ln(0{,}94) \approx 11$ jours.

## Dérivation

**Pourquoi $\sqrt{h}$.** Pour des rendements log, $r_{0,h} = \sum_{t=1}^{h} r_t$, donc
$$
\operatorname{Var}(r_{0,h}) = \sum_{t}\operatorname{Var}(r_t) + 2\sum_{t<u}\operatorname{Cov}(r_t, r_u).
$$
Avec des rendements non corrélés de variance commune $\sigma^2$, la seconde somme s'annule et la première vaut $h\sigma^2$. Ce qui n'est *pas* requis : ni la normalité ni l'indépendance — seulement l'absence d'autocorrélation et une variance constante. En comptant $h - k$ paires au retard $k$ on obtient la formule générale ; du jour à l'année, c'est le même énoncé avec $h = N$.

**Le regroupement ne casse pas directement la règle en $\sqrt{h}$.** Si $\sigma_t$ varie mais que les rendements restent non corrélés, $\operatorname{Var}(r_{0,h}) = \sum_t \mathbb{E}[\sigma_t^2]$ reste vrai pour la variance *inconditionnelle*. Ce que le regroupement casse, c'est l'application de la règle à une estimation *conditionnelle* : multiplier par $\sqrt{10}$ un $\sigma_t$ aujourd'hui élevé ignore le retour à la moyenne. La prévision GARCH le rend explicite :
$$
\mathbb{E}[\sigma_{t+k}^2 \mid \mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^{k-1}\big(\sigma_{t+1}^2 - \sigma_\infty^2\big), \qquad k \ge 1,
$$
qui ramène vers $\sigma_\infty^2$ à la vitesse $\alpha + \beta$. Ce n'est que si $\alpha + \beta = 1$ (EWMA) que l'extrapolation plate en $\sqrt{h}$ est cohérente.

**À quel point une estimation est-elle bruitée ?** Pour $n$ rendements normaux i.i.d., $(n-1)\hat\sigma^2/\sigma^2 \sim \chi^2_{n-1}$, donc $\operatorname{Var}(\hat\sigma^2) = 2\sigma^4/(n-1)$ ; la méthode delta avec $g(x) = \sqrt{x}$, $g'(\sigma^2) = 1/(2\sigma)$, donne

::: formula Erreur type d'une estimation de volatilité
$$
\operatorname{sd}(\hat\sigma) \approx \frac{\sigma}{\sqrt{2n}}, \qquad \text{erreur relative } \frac{\operatorname{sd}(\hat\sigma)}{\sigma} \approx \frac{1}{\sqrt{2n}} .
$$
:::

Une erreur relative de $10\,\%$ demande $n = 1/(2 \cdot 0{,}01) = 50$ jours ; $1\,\%$ en demande $5000$, vingt ans, pendant lesquels la volatilité a certainement changé. D'où la tension centrale : une fenêtre longue est précise sur un paramètre qui ne s'applique plus, une fenêtre courte est actuelle et bruitée. Une vol réalisée à 21 jours porte une erreur type relative de $\pm 15\,\%$ ; un affichage à $22\,\%$ ne se distingue pas de $19\,\%$.

## Hypothèses et cas limites

- **Les estimateurs de plage ratent les gaps overnight.** Ils ne mesurent que la séance, donc une valeur qui gappe sur ses résultats est gravement sous-estimée. Ils supposent aussi une dérive nulle et une observation continue : une forte tendance les biaise, et l'échantillonnage discret place le plus haut et le plus bas observés à l'intérieur des vrais, ce qui les biaise **vers le bas** ($-1\,\%$ à $-3\,\%$ sur des valeurs liquides, bien plus sur des titres peu liquides).
- **Le raccourci de moyenne nulle.** Forcer $\bar{r} = 0$ est un compromis biais–variance. Sur 21 jours, l'erreur d'estimation de la moyenne domine la dérive, donc l'estimateur contraint gagne ; sur des fenêtres pluriannuelles, il faut retrancher la moyenne.
- **Prix non synchrones ou figés.** Les actifs illiquides affichent volatilité et corrélation artificiellement basses parce que les prix ne se mettent pas à jour. Le rebond bid–ask fait l'inverse en haute fréquence : autocorrélation négative et variance réalisée gonflée — d'où les estimateurs robustes au bruit de microstructure.
- **$\alpha + \beta \ge 1$.** La variance inconditionnelle GARCH $\omega/(1-\alpha-\beta)$ n'existe que si $\alpha + \beta < 1$. Une persistance estimée très proche de $1$ est fréquente et signale d'ordinaire une rupture structurelle non modélisée, pas une racine unitaire dans la variance.
- **Volatilité de quoi ?** Rendements de prix, spread, taux (vol en points de base) et série de futures ajustée des rolls donnent des nombres différents. Coter une vol sans nommer la série est aussi incomplet qu'une VaR sans horizon.

## Exemple détaillé

On simule une série GARCH(1,1) où la vraie volatilité conditionnelle est connue, puis on compare une fenêtre glissante de 21 jours à une EWMA. Les deux sont de véritables prévisions : chaque $\sigma_t$ n'utilise que les rendements jusqu'à $t-1$.

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

L'erreur de l'EWMA est environ $42\,\%$ plus faible : la fenêtre glissante pondère un rendement vieux de 21 jours comme celui d'hier et laisse tomber les observations brutalement, si bien qu'un grand mouvement entre, reste à plat 21 jours, puis sort en créant une chute fantôme, alors que l'EWMA s'amortit en douceur avec une demi-vie de $11$ jours. La volatilité inconditionnelle réalisée ($15{,}6\,\%$) est proche du niveau de long terme ($15{,}9\,\%$) sans l'atteindre : même 4000 jours laissent une erreur d'échantillonnage, cohérente avec $1/\sqrt{2n} \approx 1{,}1\,\%$.

## Pourquoi c'est important en finance quantitative

- **Le seul paramètre libre de [[black-scholes]].** Le spot, le strike, l'échéance et les taux sont observables ; la volatilité ne l'est pas, donc le pricing d'options est *entièrement* un problème de prévision de volatilité, et coter en unités de vol évacue tout le reste.
- **La volatilité implicite est un prix, pas une prévision.** Elle dépasse systématiquement la volatilité réalisée ultérieure — la **prime de risque de variance**, environ 1 à 3 points de vol sur les options d'indice — parce que les vendeurs exigent une compensation pour être short gamma dans les krachs. Qu'elle varie avec le strike et l'échéance (le smile) dit que le modèle à vol constante est faux.
- **La volatilité se négocie.** Le P&L d'une option delta-couverte vaut $\tfrac12 \sum \Gamma S^2(r_t^2 - \sigma_{\text{impl}}^2 \Delta t)$, variance réalisée contre implicite (voir [[greeks]]). Un **variance swap** paie $N(\sigma_R^2 - K^2)$ : c'est la *variance*, non la volatilité, que des options pondérées en $1/K^2$ plus une couverture delta dynamique répliquent exactement (l'argument du log-contract). Un volatility swap paie $\sqrt{\text{variance}}$, fonction concave, il exige donc un ajustement de convexité et aucune réplication statique n'existe.
- **Limites de risque et dimensionnement.** La volatilité est le $\sigma$ de la [[value-at-risk]] paramétrique, le facteur d'échelle des stratégies à volatilité cible ($w_t \propto 1/\hat\sigma_t$), et le dénominateur de tout ratio de Sharpe.
- **Les faits stylisés dictent le choix de modèle.** La volatilité se **regroupe** (ce que capture GARCH) ; les rendements ont des **queues épaisses** même après conditionnement ; l'**effet de levier** fait qu'un rendement négatif augmente plus la volatilité future qu'un rendement positif (d'où GJR-GARCH et le skew actions) ; et la volatilité **revient à sa moyenne**. Elle est bien plus prévisible que les rendements : un $R^2$ proche de $0$ est normal pour les rendements, tandis que $0{,}3$–$0{,}5$ pour la variance du lendemain est courant *lorsque la cible est un estimateur de variance réalisée construit sur des données intrajournalières*. Face au carré du rendement quotidien, le $R^2$ reste sous $0{,}05$, cette cible étant elle-même très bruitée.

## Questions d'entretien

::: question Les rendements quotidiens ont un écart-type de $1{,}2\,\%$. Quelle est la volatilité annualisée, et qu'as-tu supposé ?
::: hint
Multiplie par $\sqrt{N}$ avec $N$ jours de bourse.
:::
::: answer
$0{,}012\sqrt{252} = 0{,}012 \times 15{,}87 \approx 19{,}0\,\%$. Supposé : rendements non corrélés et de variance constante (i.i.d. suffit mais est plus fort que nécessaire), rendements log pour qu'ils s'additionnent, et $252$ jours de bourse — une convention en jours calendaires ($\sqrt{365}$) donne $22{,}9\,\%$, donc il faut la préciser. Raccourci : $\sqrt{252} \approx 16$, donc vol quotidienne $\times 16 =$ vol annuelle, et $16\,\%$ annuel correspond à un mouvement quotidien de $1\,\%$.
:::
:::

::: question Pourquoi le marché cote-t-il des variance swaps plutôt que des volatility swaps ?
::: hint
Laquelle, de la variance ou de la volatilité, est une fonction linéaire du payoff constructible avec un portefeuille statique d'options ?
:::
::: answer
La **variance** réalisée admet une réplication statique exacte : des options sur tous les strikes pondérées en $1/K^2$ (un log-contract) plus une couverture delta dynamique reproduisent $\sum r_t^2$ indépendamment du modèle, donc le strike d'un variance swap est une vraie quantité de non-arbitrage — le prix du strip répliquant. La volatilité est $\sqrt{\text{variance}}$, strictement concave, donc par Jensen $\mathbb{E}[\sqrt{V}] < \sqrt{\mathbb{E}[V]}$ : le strike du vol swap est en dessous, de l'écart d'un **ajustement de convexité** qui dépend de la vol-de-vol, donc d'un modèle. Les dealers cotent et couvrent la variance et en déduisent les vol swaps. Cette même convexité explique qu'un variance swap paie bien plus dans un krach : il est long vol-de-vol.
:::
:::

::: question Tu disposes de 60 jours de rendements et tu estimes une volatilité annualisée de $25\,\%$. Donne un intervalle de confiance approximatif, et dis ce qui change avec 250 jours.
::: hint
Utilise $\operatorname{sd}(\hat\sigma) \approx \sigma/\sqrt{2n}$.
:::
::: answer
Erreur type relative $= 1/\sqrt{120} \approx 9{,}1\,\%$, donc $\operatorname{sd}(\hat\sigma) \approx 2{,}3$ points de vol et un intervalle à $95\,\%$ approximatif vaut $25\,\% \pm 4{,}6\,\%$ : à peu près de $20\,\%$ à $30\,\%$, une bande large autour de ce qui semblait précis. Avec 250 jours l'erreur relative tombe à $1/\sqrt{500} \approx 4{,}5\,\%$, soit $\pm 2{,}2$ points — mais cette fenêtre moyenne sur une année pendant laquelle la vraie volatilité a presque certainement bougé : la précision s'achète au prix de la pertinence. Cela suppose en outre normalité et variance constante ; avec des queues épaisses et du regroupement, la taille effective d'échantillon est plus petite que $n$ et l'intervalle plus large.
:::
:::

::: question Un trader dit : « la vol réalisée est à 15 %, l'option à un mois est implicite à 19 %, donc je devrais vendre l'option. » Qu'est-ce qui cloche dans ce raisonnement ?
::: hint
Réfléchis à ce que compensent ces 4 points d'écart, et à la forme du P&L de la position qui en résulte.
:::
::: answer
**L'écart est attendu.** L'implicite dépasse en moyenne la réalisée ultérieure — la prime de risque de variance, 1 à 3 points sur les indices actions, davantage sur les ailes. Elle rémunère un risque : le vendeur est short gamma et perd exactement quand les marchés krachent et que le reste de son portefeuille souffre aussi. Petits gains réguliers, pertes très lourdes occasionnelles ; pas un arbitrage.

**Passé contre futur.** La vol réalisée glissante estime le *passé*, avec du bruit ; l'implicite est une espérance risque-neutre sur le *mois à venir*. À 21 jours, un affichage à $15\,\%$ se distingue à peine de $17\,\%$, et un événement connu dans la fenêtre doit relever la vol réalisée future.

**Quelle implicite ?** Un seul nombre masque le smile. Le P&L d'une position short delta-couverte vaut $\tfrac12\sum \Gamma S^2 (r_t^2 - \sigma_{\text{impl}}^2\Delta t)$, pondéré par le gamma, il dépend donc de l'*endroit* où le sous-jacent passe son temps : vendre à $19\,\%$ et réaliser $16\,\%$ peut quand même perdre.
:::
:::
