---
title: Value at Risk
subject: risk
summary: La perte qu'un portefeuille ne dépassera pas avec probabilité α sur un horizon donné, c'est-à-dire un quantile de la distribution des pertes. Le chiffre de risque standard de l'industrie, rapide à calculer et facile à mal lire, et la raison d'être de l'expected shortfall.
difficulty: 2
interview: 4
tags: [risk, var, expected-shortfall, quantile, backtesting, basel]
prerequisites: [conditional-probability]
related: [greeks, linear-regression]
---

## Intuition

« Avec 99 % de confiance, nous ne perdrons pas plus de 2,6 % demain. » Avance depuis la gauche de la distribution de la perte de demain jusqu'à laisser 99 % de la masse derrière toi : la perte à cet endroit est $\mathrm{VaR}_{0{,}99}$. Elle donne la frontière de la queue en devise, ce qui rend comparables un book actions et un book taux. Elle ne dit rien de ce qui se trouve *au-delà* : 1 % des jours perdent plus de 1 M, mais « plus » peut valoir 1,1 M ou 50 M. Trois choix définissent toute VaR — horizon, niveau $\alpha$, modèle de perte.

## Formules clés

| Nom | Formule |
|---|---|
| Définition | $\mathrm{VaR}_\alpha(L) = \inf\{\ell : \mathbb{P}(L \le \ell) \ge \alpha\}$ |
| VaR normale | $\mu + \sigma z_\alpha$, avec $z_{0{,}99} = 2{,}326$ |
| ES normale | $\mu + \sigma\,\varphi(z_\alpha)/(1-\alpha) = \mu + 2{,}665\,\sigma$ à 99 % |
| Expected shortfall | $\mathrm{ES}_\alpha = \frac{1}{1-\alpha}\int_\alpha^1 \mathrm{VaR}_u\,du = \mathbb{E}[L \mid L \ge \mathrm{VaR}_\alpha]$ |
| Mise à l'échelle temporelle (i.i.d. normal) | $\mathrm{VaR}^{(h)} = \sqrt{h}\,\mathrm{VaR}^{(1)}$ |
| Test de Kupiec | $x \sim \mathrm{Bin}(n, 1-\alpha)$ sous $H_0$ ; $\mathrm{LR}_{\text{POF}} \sim \chi^2_1$ |

## Erreurs fréquentes

::: pitfall Lire la VaR comme le pire cas
$\mathrm{VaR}_{0{,}99}$ est le *meilleur* des 1 % pires jours. La perte attendue un mauvais jour est l'ES, qui avec des queues épaisses peut valoir le double de la VaR.
:::

::: pitfall Multiplier par $\sqrt{h}$ une VaR à queues épaisses ou autocorrélée
Exige des rendements i.i.d. normaux : l'autocorrélation la fait sous-estimer, les queues épaisses surestiment la queue à long horizon, GARCH rend le multiplicateur dépendant du régime.
:::

::: pitfall Faire confiance à un quantile à 99 % sur 250 observations
Il tient à 2 ou 3 points, avec une erreur-type comparable à sa valeur. Préfère une fenêtre plus longue avec mise à l'échelle par la volatilité, ou une queue paramétrique (Student-$t$, théorie des valeurs extrêmes).
:::

::: pitfall Additionner les VaR des desks
Avec un risque de saut concentré, la somme des VaR des desks peut être *inférieure* à la VaR de la firme. Agrège les distributions de pertes, ou utilise l'ES.
:::

## Révision en 30 secondes

La VaR au niveau $\alpha$ est le quantile d'ordre $\alpha$ de la perte sur un horizon : $\mu + \sigma z_\alpha$ dans le cas normal, sinon le quantile empirique ou simulé. Elle n'est pas sous-additive (deux obligations à 4 % de défaut : $\mathrm{VaR}_{0{,}95}$ vaut 0 pour chacune, 100 pour les deux) et aveugle au-delà du quantile ; l'expected shortfall $\mathbb{E}[L \mid L \ge \mathrm{VaR}]$ corrige les deux défauts et c'est ce que Bâle (FRTB) utilise désormais à 97,5 %. Multiplie par $\sqrt{h}$ seulement pour des rendements i.i.d. normaux. Backteste en comptant les exceptions : $\mathrm{Binomiale}(n, 1-\alpha)$ sous l'hypothèse nulle, test du rapport de vraisemblance de Kupiec.

## Formulation mathématique

Soit $L = -(V_{t+h} - V_t)$ la perte sur l'horizon $h$ (positive quand on perd de l'argent), de fonction de répartition $F_L$.

::: formula Value at Risk
$$
\mathrm{VaR}_\alpha(L) = \inf\{\, \ell \in \mathbb{R} : F_L(\ell) \ge \alpha \,\} = q_\alpha(L),
$$
le quantile d'ordre $\alpha$ de la perte. De façon équivalente, $\mathbb{P}(L > \mathrm{VaR}_\alpha) \le 1 - \alpha$, avec égalité quand $L$ est continue.
:::

::: formula VaR et ES paramétriques (normales)
Si $L \sim \mathcal{N}(\mu, \sigma^2)$ et $z_\alpha = \Phi^{-1}(\alpha)$,
$$
\mathrm{VaR}_\alpha = \mu + \sigma z_\alpha, \qquad \mathrm{ES}_\alpha = \mu + \sigma\,\frac{\varphi(z_\alpha)}{1 - \alpha}.
$$
Pour $\alpha = 0{,}99$ : $z_\alpha = 2{,}326$ et $\varphi(z_\alpha)/(1-\alpha) = 2{,}665$.
:::

::: formula Expected shortfall
$$
\mathrm{ES}_\alpha(L) = \frac{1}{1-\alpha}\int_\alpha^1 \mathrm{VaR}_u(L)\,du = \mathbb{E}[L \mid L \ge \mathrm{VaR}_\alpha] \quad (\text{si } L \text{ est continue}).
$$
:::

::: formula Règle de la racine du temps
Pour des rendements i.i.d. normaux de moyenne nulle,
$$
\mathrm{VaR}_\alpha^{(h\text{ jours})} = \sqrt{h}\;\mathrm{VaR}_\alpha^{(1\text{ jour})}.
$$
:::

Trois méthodes d'estimation :

- **Paramétrique.** Estimer $\mu, \Sigma$ ; perte $\sim \mathcal{N}(-w^\top\mu,\; w^\top\Sigma w)$. Rate les queues épaisses, et linéaire, donc fausse pour les options.
- **Historique.** Rejouer les $n$ derniers jours de variations des facteurs sur le book d'aujourd'hui, prendre le quantile empirique. 250 jours ne placent que 2 à 3 points dans la queue à 1 % ; lente à réagir à un changement de régime.
- **Monte Carlo.** Simuler les facteurs, réévaluer, prendre le quantile. Risque de modèle plus erreur d'échantillonnage, et coûteux pour les exotiques.

**Cohérence** (Artzner, Delbaen, Eber et Heath, 1999) : monotone, invariante par translation, positivement homogène et **sous-additive**, $\rho(L_1 + L_2) \le \rho(L_1) + \rho(L_2)$. La VaR échoue sur la dernière ; l'ES vérifie les quatre.

## Dérivation

**VaR normale.** $L = \mu + \sigma Z$ donne $\mathbb{P}(L \le \ell) = \Phi\big((\ell - \mu)/\sigma\big) = \alpha$, donc $\ell = \mu + \sigma z_\alpha$.

**ES normale.** En utilisant $\varphi'(z) = -z\varphi(z)$,
$$
\mathbb{E}[Z \mid Z > z_\alpha] = \frac{1}{1-\alpha}\int_{z_\alpha}^{\infty} z\varphi(z)\,dz = \frac{1}{1-\alpha}\Big[-\varphi(z)\Big]_{z_\alpha}^{\infty} = \frac{\varphi(z_\alpha)}{1-\alpha},
$$
donc $\mathrm{ES}_\alpha = \mu + \sigma\,\mathbb{E}[Z \mid Z > z_\alpha]$. Pour $\mu = 0$, $\mathrm{ES}/\mathrm{VaR} = \varphi(z_\alpha)/((1-\alpha)z_\alpha) = 1{,}15$ à 99 % et tend vers 1 : la queue normale est fine.

**Racine du temps.** Des rendements quotidiens i.i.d. $\mathcal{N}(0, \sigma^2)$ donnent un rendement à $h$ jours $\mathcal{N}(0, h\sigma^2)$ — la croissance linéaire de la variance d'un [[brownian-motion|mouvement brownien]]. L'indépendance donne la variance ; la normalité conserve la *forme*, donc le quantile suit l'écart-type. Avec une dérive, $-\mu h + \sigma\sqrt{h}\,z_\alpha$.

**Pourquoi la VaR n'est pas sous-additive.** Deux obligations indépendantes perdant chacune 100 avec probabilité 4 %, à $\alpha = 95\,\%$ : seule, $\mathbb{P}(L \ge 100) = 4\,\% < 5\,\%$ donc $\mathrm{VaR}_{0{,}95} = 0$ ; ensemble, $1 - 0{,}96^2 = 7{,}84\,\% > 5\,\%$ donc $\mathrm{VaR}_{0{,}95} = 100 > 0 + 0$. L'ES répare cela : $\frac{0{,}04 \times 100}{0{,}05} = 80$ par obligation, et pour la paire la perte vaut 100 avec probabilité $2 \times 0{,}04 \times 0{,}96 = 7{,}68\,\%$, 200 avec probabilité $0{,}04^2 = 0{,}16\,\%$, donc
$$
\mathrm{ES}_{0{,}95}(A + B) = \frac{(0{,}9984 - 0{,}95)\times 100 + 0{,}0016 \times 200}{0{,}05} = 103{,}2 \le 80 + 80.
$$

**Backtesting (Kupiec, 1995).** Les exceptions $x$ sur $n$ jours vérifient $x \sim \mathrm{Binomiale}(n, p)$, $p = 1 - \alpha$, et
$$
\mathrm{LR}_{\text{POF}} = -2\ln\frac{(1-p)^{\,n-x}\,p^{\,x}}{(1 - x/n)^{\,n-x}\,(x/n)^{\,x}} \;\sim\; \chi^2_1 \quad \text{sous } H_0
$$
rejette un taux trop élevé *ou* trop faible (trop faible gaspille du capital). Avec $n = 250$, $\alpha = 0{,}99$ : on attend 2,5 exceptions, rejet à $x \ge 7$ (et à $x = 0$, $p$-valeur 0,025). Christoffersen ajoute un test de non-regroupement des exceptions.

## Hypothèses et cas limites

- **La racine du temps** exige des rendements i.i.d. normaux : l'autocorrélation rend la vraie VaR à $h$ jours plus grande, le retour à la moyenne plus petite, GARCH dépendante du régime. Avec des queues épaisses, le théorème central limite tire la somme à $h$ jours vers la normale, donc $\sqrt{h}$ *surestime*. Les books d'options sont non linéaires ([[greeks]]) : réévalue à l'horizon.
- **Pas sous-additive** pour des pertes discrètes ou à queues lourdes (obligations, digitales, CDS), mais sous-additive pour des facteurs conjointement elliptiques et des positions linéaires — d'où le fait que le monde variance–covariance ne remarque jamais le problème.
- **Aveugle au-delà d'elle-même.** Deux portefeuilles de même VaR peuvent avoir des ES dans un rapport de dix ; vendre des options très en dehors de la monnaie abaisse la VaR tout en rendant la queue catastrophique.
- **Fenêtres historiques.** Une fenêtre d'un an à 99 % repose sur les 2 à 3 pires jours et saute quand l'un d'eux sort ; la simulation historique filtrée remet à l'échelle les rendements passés par la volatilité courante.
- **L'erreur d'estimation** d'un quantile à 99 % sur 250 points est énorme, et plus grande encore pour l'ES, qui moyenne encore moins de points.

## Exemple détaillé

2 000 rendements quotidiens selon une Student-$t$ à $\nu = 3$ mise à l'échelle pour un écart-type quotidien de 1 % ; VaR et ES à 99 % de trois façons.

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(7)
n, nu, sigma, alpha = 2000, 3, 0.01, 0.99      # 8 years of daily returns, fat tails
scale = sigma / np.sqrt(nu / (nu - 2))          # Student-t scaled to daily std = sigma
r = scale * rng.standard_t(nu, n)
loss = -r

# Parametric (variance-covariance) VaR and ES: assume losses are normal
mu, sd = loss.mean(), loss.std(ddof=1)
z = stats.norm.ppf(alpha)
var_norm = mu + sd * z
es_norm = mu + sd * stats.norm.pdf(z) / (1 - alpha)

# Historical VaR and ES: empirical quantile and tail average
var_hist = np.quantile(loss, alpha)
es_hist = loss[loss >= var_hist].mean()

# True values for the Student-t that generated the data
tq = stats.t.ppf(alpha, nu)
var_true = scale * tq
es_true = scale * stats.t.pdf(tq, nu) / (1 - alpha) * (nu + tq**2) / (nu - 1)

print(f"{'method':<12}{'VaR 99%':>10}{'ES 99%':>10}")
for name, v, e in [("normal", var_norm, es_norm), ("historical", var_hist, es_hist), ("true t(3)", var_true, es_true)]:
    print(f"{name:<12}{100*v:>9.2f}%{100*e:>9.2f}%")

# Backtest the normal VaR in-sample: Kupiec proportion-of-failures test
x = np.sum(loss > var_norm)
p = 1 - alpha
lr = -2 * ((n - x) * np.log(1 - p) + x * np.log(p)) + 2 * ((n - x) * np.log(1 - x / n) + x * np.log(x / n))
print(f"exceptions: expected {n * p:.0f}, observed {x}, Kupiec p-value {stats.chi2.sf(lr, 1):.4f}")
```

::: output
```
method         VaR 99%    ES 99%
normal           2.11%     2.41%
historical       2.47%     3.20%
true t(3)        2.62%     4.04%
exceptions: expected 20, observed 34, Kupiec p-value 0.0042
```
:::

À écart-type égal, l'ajustement normal donne $2{,}1\,\%$ contre un vrai $2{,}62\,\%$, et une ES normale moitié de la vraie $4{,}04\,\%$. L'historique est proche pour la VaR, loin pour l'ES : 20 points de queue ne cernent pas une queue de $t_3$. Kupiec rejette le modèle normal, 34 exceptions contre 20. Cet écart, c'est 2008 en une ligne : la frontière de la queue à peu près juste, sa *profondeur* complètement fausse.

## Pourquoi c'est important en finance quantitative

- **Capital et limites.** Chaque desk opère sous une limite de VaR, et le capital réglementaire au titre du risque de marché en découle.
- **Bâle.** L'amendement de 1996 sur le risque de marché a autorisé une VaR interne à 10 jours et 99 % multipliée par au moins 3, le multiplicateur étant fixé par un backtest sur 250 jours (feu tricolore : vert jusqu'à 4 exceptions, jaune de 5 à 9, rouge à 10 et plus). Bâle 2.5 a ajouté une *VaR stressée* ; FRTB (2019) a remplacé la VaR par une expected shortfall à 97,5 % sur des horizons de liquidité de 10 à 120 jours, parce que la VaR n'est pas cohérente — tout en backtestant toujours les exceptions de VaR à 97,5 % et 99 %, une exception d'ES n'étant pas observable.
- **L'ES est une espérance conditionnelle** par l'événement de queue, voir [[conditional-probability]] ; la décomposition d'Euler $\mathrm{ES}(L) = \sum_i \mathbb{E}[L_i \mid L \ge \mathrm{VaR}_\alpha]$ attribue la queue aux positions.
- **Books d'options.** La VaR delta-normale vaut $z_\alpha\sqrt{\delta^\top \Sigma\, \delta}$ ([[greeks]]), la version delta-gamma ajoute le terme du second ordre ; les deux cassent pour de grands mouvements, donc le Monte Carlo avec réévaluation complète ([[black-scholes]]) est l'alternative honnête.
- **VaR factorielle.** Projeter les positions sur des facteurs par [[linear-regression|régression linéaire]] transforme un book de 5 000 instruments en une matrice de covariance à 50 facteurs.
- **Queues épaisses.** Les vrais rendements quotidiens sont plus proches d'une $t_4$ que d'une normale ; remets à l'échelle les rendements historiques par une volatilité GARCH ou EWMA avant de prendre le quantile.

## Questions d'entretien

::: question Le P&L quotidien d'un portefeuille est normal, de moyenne nulle et d'écart-type 2 M. Quelles sont ses VaR à 99 % à 1 jour et à 10 jours ?
::: hint
$z_{0{,}99} = 2{,}326$, et réfléchis à la façon dont la variance croît avec l'horizon.
:::
::: answer
$2{,}326 \times 2 = 4{,}65$ M à 1 jour. Sous normalité i.i.d., l'écart-type à 10 jours vaut $\sqrt{10} \times 2$ M, donc $\sqrt{10} \times 4{,}65 = 14{,}7$ M. La relance : « quand est-ce que $\sqrt{10}$ est faux ? » — autocorrélation, clustering de volatilité, queues épaisses, positions non linéaires, une dérive qui compte à long horizon.
:::
:::

::: question Pourquoi la VaR n'est-elle pas une mesure de risque cohérente ? Donne un exemple concret.
::: hint
Lequel des quatre axiomes échoue ? Construis un portefeuille où la diversification a l'air mauvaise.
:::
::: answer
La sous-additivité. Deux obligations indépendantes perdant chacune 100 avec probabilité 4 % : seule, $\mathrm{VaR}_{0{,}95} = 0$, puisqu'un événement à 4 % tient dans la queue à 5 % ; ensemble, au moins 100 avec probabilité $1 - 0{,}96^2 = 7{,}84\,\% > 5\,\%$, donc $\mathrm{VaR}_{0{,}95} = 100 > 0 + 0$. L'ES est sous-additive : 80 chacune, 103,2 pour la paire.
:::
:::

::: question Tu backtestes une VaR à 99 % à 1 jour sur 250 jours de bourse et tu observes 6 exceptions. Le modèle est-il rejeté ? Que fait le régulateur ?
::: hint
Le nombre d'exceptions attendu est $250 \times 0{,}01 = 2{,}5$. Calcule le rapport de vraisemblance de Kupiec et compare-le à un $\chi^2_1$.
:::
::: answer
$\mathrm{LR}_{\text{POF}} = -2\big[244\ln 0{,}99 + 6\ln 0{,}01\big] + 2\big[244\ln 0{,}976 + 6\ln 0{,}024\big] \approx 3{,}56$, sous la valeur critique à 5 % de 3,84 ($p \approx 0{,}06$) : non rejeté, mais de justesse — 7 rejetteraient. Feu tricolore bâlois : 6 exceptions, c'est la zone jaune, le multiplicateur passe de 3 à 3,5 et la banque doit les expliquer.
:::
:::

::: question Dérive le rapport $\mathrm{ES}_\alpha / \mathrm{VaR}_\alpha$ pour une perte normale et pour une perte de Student-$t$ quand $\alpha \to 1$. Que dit la comparaison sur le choix du modèle ?
::: hint
Pour la normale, utilise $\varphi(z)/(1 - \Phi(z)) \approx z$ pour $z$ grand. Pour la $t_\nu$, la queue est une loi de puissance d'indice $\nu$.
:::
::: answer
Normale : $\mathrm{ES}/\mathrm{VaR} = \varphi(z_\alpha)/\big((1-\alpha) z_\alpha\big)$, et comme $1 - \Phi(z) \sim \varphi(z)/z$, le rapport tend vers 1 — 1,15 à 99 %, 1,09 à 99,9 %. Student-$t_\nu$ : la queue décroît comme $\ell^{-\nu}$, donc au-delà d'un quantile élevé la perte est approximativement de Pareto et $\mathrm{ES}/\mathrm{VaR} \to \nu/(\nu - 1)$ : 1,5 pour $\nu = 3$ (1,54 à 99 %), 1,33 pour $\nu = 4$. Borné loin de 1, donc un modèle normal sous-estime l'ES bien plus que la VaR — d'où le passage des régulateurs à l'ES, et le fait que le modèle de queue compte plus que le niveau de confiance.
:::
:::
