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

« Avec 99 % de confiance, nous ne perdrons pas plus de 2,6 % demain. » Cette phrase est une Value at Risk. Trace la distribution de la perte de demain et avance depuis la gauche jusqu'à laisser 99 % de la masse de probabilité derrière toi : la perte à cet endroit est $\mathrm{VaR}_{0{,}99}$.

La VaR dit deux choses utiles et en cache une. Elle dit à quel point une « mauvaise journée ordinaire » est mauvaise — la frontière de la queue — et elle le dit en devise, ce qui permet à un responsable de desk de comparer un book actions avec un book taux. Elle ne dit **pas** à quel point les choses se dégradent *au-delà* de la frontière : une VaR de 1 M t'apprend que 1 % des jours perdent plus de 1 M, pas si « plus » signifie 1,1 M ou 50 M. Cet angle mort est la raison d'être de l'expected shortfall.

Trois choix définissent tout chiffre de VaR : l'**horizon** (1 jour, 10 jours), le **niveau de confiance** $\alpha$ (95 %, 99 %) et le **modèle** de la distribution des pertes (normale, historique, simulée). Change l'un des trois et le chiffre change ; une VaR citée sans ces trois éléments ne veut rien dire.

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

**Trois méthodes d'estimation.**

| Méthode | Recette | Avantages | Inconvénients |
|---|---|---|---|
| Paramétrique (variance–covariance) | Estimer $\mu$ et $\Sigma$ des facteurs de risque ; perte du portefeuille $\sim \mathcal{N}(-w^\top\mu,\; w^\top\Sigma w)$ ; appliquer la formule | Rapide, analytique, se décompose par position | Suppose la normalité, donc sous-estime les queues épaisses ; linéaire dans les facteurs, donc fausse pour les options |
| Simulation historique | Rejouer les $n$ derniers jours de variations des facteurs sur le portefeuille d'aujourd'hui, prendre le quantile empirique d'ordre $\alpha$ | Aucune hypothèse de distribution ; capture les queues épaisses et les payoffs non linéaires | Vaut ce que vaut la fenêtre : 250 jours ne placent que 2 à 3 points dans la queue à 1 % ; lente à réagir à un changement de régime |
| Monte Carlo | Simuler des scénarios de facteurs selon un modèle choisi, réévaluer le portefeuille, prendre le quantile | N'importe quel modèle (sauts, volatilité stochastique), n'importe quel payoff | Risque de modèle plus erreur d'échantillonnage ; coûteux pour de gros books d'exotiques |

**Cohérence.** Une mesure de risque $\rho$ est *cohérente* (Artzner, Delbaen, Eber et Heath, 1999) si elle est monotone, invariante par translation, positivement homogène et **sous-additive** : $\rho(L_1 + L_2) \le \rho(L_1) + \rho(L_2)$, « diversifier ne peut pas augmenter le risque ». La VaR vérifie les trois premières propriétés mais pas la sous-additivité en général ; l'ES vérifie les quatre.

## Dérivation

**VaR normale.** Si $L = \mu + \sigma Z$ avec $Z \sim \mathcal{N}(0,1)$, alors $\mathbb{P}(L \le \ell) = \Phi\big((\ell - \mu)/\sigma\big)$ ; en posant cette quantité égale à $\alpha$, on obtient $\ell = \mu + \sigma z_\alpha$.

**ES normale.** En utilisant $\varphi'(z) = -z\varphi(z)$,
$$
\mathbb{E}[Z \mid Z > z_\alpha] = \frac{1}{1-\alpha}\int_{z_\alpha}^{\infty} z\varphi(z)\,dz = \frac{1}{1-\alpha}\Big[-\varphi(z)\Big]_{z_\alpha}^{\infty} = \frac{\varphi(z_\alpha)}{1-\alpha},
$$
et $\mathrm{ES}_\alpha = \mu + \sigma\,\mathbb{E}[Z \mid Z > z_\alpha]$. Pour $\mu = 0$, le rapport $\mathrm{ES}/\mathrm{VaR}$ vaut $\varphi(z_\alpha)/((1-\alpha)z_\alpha) = 1{,}15$ à 99 % pour une normale et tend vers 1 quand $\alpha \to 1$ : la queue normale est fine, donc la moyenne au-delà du quantile dépasse à peine le quantile.

**Racine du temps.** Si les rendements quotidiens $r_1, \dots, r_h$ sont i.i.d. $\mathcal{N}(0, \sigma^2)$, le rendement à $h$ jours suit $\mathcal{N}(0, h\sigma^2)$, donc son quantile vaut $\sqrt{h}$ fois le quantile quotidien — la même croissance linéaire de la variance que dans un [[brownian-motion|mouvement brownien]]. Les deux ingrédients comptent : l'indépendance donne la variance $h\sigma^2$, et la normalité garantit que la distribution à $h$ jours a la même *forme* que la distribution quotidienne, de sorte que le quantile suit l'écart-type. Avec une dérive $\mu \ne 0$, l'expression correcte est $-\mu h + \sigma\sqrt{h}\,z_\alpha$ ; la dérive est négligeable à 1–10 jours et dominante à un an.

**Pourquoi la VaR n'est pas sous-additive : deux obligations.** Deux obligations indépendantes perdent chacune 100 avec probabilité 4 % (défaut, recouvrement nul) et 0 sinon. À $\alpha = 95\,\%$ :

- Une obligation seule : $\mathbb{P}(L \ge 100) = 4\,\% < 5\,\%$, donc le quantile à 95 % vaut 0 : $\mathrm{VaR}_{0{,}95} = 0$ pour chaque obligation prise isolément.
- Les deux ensemble : $\mathbb{P}(\text{au moins un défaut}) = 1 - 0{,}96^2 = 7{,}84\,\% > 5\,\%$, donc $\mathrm{VaR}_{0{,}95} = 100$.

$\mathrm{VaR}(A + B) = 100 > 0 + 0 = \mathrm{VaR}(A) + \mathrm{VaR}(B)$ : diversifier a *augmenté* le chiffre de risque. L'ES répare cela. Pour une obligation, $\mathrm{ES}_{0{,}95} = \frac{1}{0{,}05}\int_{0{,}95}^{1} \mathrm{VaR}_u\,du = \frac{0{,}04 \times 100}{0{,}05} = 80$. Pour la paire, la perte vaut 100 avec probabilité $2 \times 0{,}04 \times 0{,}96 = 7{,}68\,\%$ et 200 avec probabilité $0{,}04^2 = 0{,}16\,\%$, donc
$$
\mathrm{ES}_{0{,}95}(A + B) = \frac{(0{,}9984 - 0{,}95)\times 100 + 0{,}0016 \times 200}{0{,}05} = 103{,}2 \le 80 + 80.
$$
La sous-additivité tient, comme elle le doit pour toute mesure cohérente.

**Backtesting (Kupiec, 1995).** Sur $n$ jours, on compte les exceptions $x$, les jours où $L > \mathrm{VaR}_\alpha$. Si le modèle est juste, $x \sim \mathrm{Binomiale}(n, p)$ avec $p = 1 - \alpha$. Le rapport de vraisemblance de la proportion d'échecs
$$
\mathrm{LR}_{\text{POF}} = -2\ln\frac{(1-p)^{\,n-x}\,p^{\,x}}{(1 - x/n)^{\,n-x}\,(x/n)^{\,x}} \;\sim\; \chi^2_1 \quad \text{sous } H_0
$$
rejette le modèle quand le taux d'exceptions est trop élevé *ou* trop faible (trop faible signifie que du capital est gaspillé). Avec $n = 250$ et $\alpha = 0{,}99$, on attend 2,5 exceptions ; la région de rejet à 5 % est $x \ge 7$ (et $x = 0$, avec une $p$-valeur de 0,025). L'extension de Christoffersen teste aussi que les exceptions ne se regroupent pas : une exception aujourd'hui ne doit pas en rendre une plus probable demain.

## Hypothèses et cas limites

- **La racine du temps échoue** dès que les rendements ne sont pas i.i.d. normaux. Une autocorrélation positive (momentum, valorisations figées sur des actifs illiquides) rend la vraie VaR à $h$ jours plus grande que la mise à l'échelle en $\sqrt{h}$ ; le retour à la moyenne la rend plus petite ; le clustering de volatilité (GARCH) signifie que le bon multiplicateur dépend du niveau de volatilité du jour. Pour des rendements i.i.d. à queues épaisses, le théorème central limite tire la somme à $h$ jours *vers* la normale, donc multiplier une VaR à 1 jour à queues épaisses par $\sqrt{h}$ surestime la queue à 10 jours. Pour un book d'options, le P&L est non linéaire dans le sous-jacent ([[greeks]]), donc aucune règle de mise à l'échelle ne tient : il faut réévaluer à l'horizon.
- **La VaR n'est pas sous-additive** pour des pertes discrètes ou à queues lourdes (l'exemple des obligations, des books de digitales ou de CDS). Elle *l'est* pour des facteurs de risque conjointement elliptiques (par exemple une normale multivariée) et des positions linéaires, ce qui explique que le monde variance–covariance ne remarque jamais le problème.
- **La VaR est un quantile, donc aveugle au-delà d'elle-même.** Deux portefeuilles de même VaR peuvent avoir des ES dans un rapport de dix. Vendre des options très en dehors de la monnaie abaisse la VaR (prime encaissée, faible probabilité de toute perte) tout en rendant la queue catastrophique.
- **Fenêtres historiques.** Une fenêtre d'un an à 99 % repose sur les 2 à 3 pires jours observés ; l'estimation saute quand l'un d'eux sort de la fenêtre. La simulation historique filtrée remet à l'échelle les rendements passés par la volatilité courante pour corriger le problème de régime.
- **Erreur d'estimation.** L'erreur d'échantillonnage d'un quantile à 99 % sur 250 points est énorme ; celle de l'ES l'est encore plus, puisqu'elle moyenne encore moins de points. Publier une VaR avec quatre chiffres significatifs relève du théâtre.

## Exemple détaillé

On simule 2 000 rendements quotidiens selon une Student-$t$ à $\nu = 3$ degrés de liberté, mise à l'échelle pour un écart-type quotidien de 1 %, puis on calcule la VaR et l'ES à 99 % de trois façons : un ajustement paramétrique normal, le quantile historique, et les valeurs exactes pour la distribution $t$ qui a engendré les données.

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

Lecture des chiffres : à écart-type égal, l'ajustement normal place la VaR à 99 % à $2{,}33\sigma \approx 2{,}1\,\%$, alors que le vrai quantile à queues épaisses vaut $2{,}62\,\%$ et la vraie moyenne de queue $4{,}04\,\%$ — presque le double de ce que prédit la normale. L'estimation historique tombe entre les deux : proche pour la VaR, encore loin pour l'ES, parce que 20 observations de queue ne suffisent pas à cerner une queue de $t_3$. Le test de Kupiec rejette franchement le modèle normal : 34 exceptions là où 20 étaient attendues.

L'écart entre l'ES normale et la vraie ES, c'est l'histoire de 2008 en une ligne : des modèles calibrés sur la variance ont placé la frontière de la queue à peu près au bon endroit et la *profondeur* de la queue complètement à côté.

## Pourquoi c'est important en finance quantitative

- **Capital et limites.** Chaque desk de trading opère sous une limite de VaR ; le chiffre de risque décide de ce qu'un desk peut détenir, et et le capital réglementaire au titre du risque de marché en découle.
- **Contexte bâlois.** L'amendement de 1996 sur le risque de marché à Bâle I a autorisé les banques à utiliser une VaR interne à 10 jours et 99 %, multipliée par au moins 3, le multiplicateur étant relevé selon un backtest sur 250 jours (le « feu tricolore » : vert jusqu'à 4 exceptions, jaune de 5 à 9, rouge à 10 et plus). Après 2008, Bâle 2.5 a ajouté une *VaR stressée* calculée sur une fenêtre de crise, et la revue fondamentale du portefeuille de négociation (FRTB, finalisée en 2019) a remplacé la VaR par une expected shortfall à 97,5 % calculée sur des horizons de liquidité de 10 à 120 jours — précisément parce que la VaR n'est pas cohérente et ne dit rien de la profondeur de la queue. FRTB backteste toujours avec les exceptions de VaR à 97,5 % et 99 %, car une exception d'ES n'est pas directement observable.
- **L'ES est une espérance conditionnelle.** $\mathrm{ES} = \mathbb{E}[L \mid L \ge \mathrm{VaR}]$ est un conditionnement par l'événement de queue, voir [[conditional-probability]] ; la décomposition d'Euler $\mathrm{ES}(L) = \sum_i \mathbb{E}[L_i \mid L \ge \mathrm{VaR}_\alpha]$ attribue la queue aux positions individuelles.
- **Books d'options.** La VaR paramétrique utilise le delta et le gamma de chaque position ([[greeks]]) : la VaR delta-normale vaut $z_\alpha\sqrt{\delta^\top \Sigma\, \delta}$, la version delta-gamma ajoute le terme du second ordre. Les deux cassent pour de grands mouvements ; le Monte Carlo avec réévaluation complète sous le modèle de pricing ([[black-scholes]] ou mieux) est l'alternative honnête.
- **VaR factorielle.** Projeter les positions sur quelques facteurs par [[linear-regression|régression linéaire]] (bêtas sur des indices, durations par point de courbe) transforme un book de 5 000 instruments en une matrice de covariance à 50 facteurs, ce qui rend l'approche variance–covariance praticable.
- **Queues épaisses et volatilité.** Les vrais rendements quotidiens sont plus proches d'une $t_4$ que d'une normale, et la volatilité se regroupe. Le remède pratique consiste à remettre à l'échelle les rendements historiques par une estimation de volatilité GARCH ou EWMA avant de prendre le quantile.

## Erreurs fréquentes

::: pitfall Lire la VaR comme le pire cas
$\mathrm{VaR}_{0{,}99}$ est le *meilleur* des 1 % pires jours, pas le pire. La perte attendue un mauvais jour est l'ES, qui avec des queues épaisses peut valoir le double de la VaR.
:::

::: pitfall Multiplier par $\sqrt{h}$ une VaR à queues épaisses ou autocorrélée
La règle exige des rendements i.i.d. normaux. Sous autocorrélation positive elle sous-estime ; sous queues épaisses elle surestime la queue à long horizon ; sous GARCH le multiplicateur dépend du régime courant. Les régulateurs ont accepté $\sqrt{10}$ par commodité, pas parce que c'est juste.
:::

::: pitfall Faire confiance à un quantile à 99 % sur 250 observations
L'estimation tient à 2 ou 3 points de données et son erreur-type est comparable à sa valeur. Préfère une fenêtre plus longue avec mise à l'échelle par la volatilité, ou une queue paramétrique (Student-$t$, théorie des valeurs extrêmes) ajustée sur le gros des données.
:::

::: pitfall Additionner les VaR des desks
Comme la VaR n'est pas sous-additive, la somme des VaR des desks peut être *inférieure* à la VaR de la firme pour des portefeuilles à risque de saut concentré. Agrège au niveau de la distribution des pertes, ou utilise l'ES, qui s'additionne de façon conservatrice.
:::

## Révision en 30 secondes

La VaR au niveau $\alpha$ est le quantile d'ordre $\alpha$ de la perte sur un horizon : $\mu + \sigma z_\alpha$ dans le cas normal, sinon le quantile empirique ou simulé. Elle n'est pas sous-additive (deux obligations à 4 % de défaut : $\mathrm{VaR}_{0{,}95}$ vaut 0 pour chacune, 100 pour les deux) et aveugle au-delà du quantile ; l'expected shortfall $\mathbb{E}[L \mid L \ge \mathrm{VaR}]$ corrige les deux défauts et c'est ce que Bâle (FRTB) utilise désormais à 97,5 %. Multiplie par $\sqrt{h}$ seulement pour des rendements i.i.d. normaux. Backteste en comptant les exceptions : $\mathrm{Binomiale}(n, 1-\alpha)$ sous l'hypothèse nulle, test du rapport de vraisemblance de Kupiec.

## Formules clés

| Nom | Formule |
|---|---|
| Définition | $\mathrm{VaR}_\alpha(L) = \inf\{\ell : \mathbb{P}(L \le \ell) \ge \alpha\}$ |
| VaR normale | $\mu + \sigma z_\alpha$, avec $z_{0{,}99} = 2{,}326$ |
| ES normale | $\mu + \sigma\,\varphi(z_\alpha)/(1-\alpha) = \mu + 2{,}665\,\sigma$ à 99 % |
| Expected shortfall | $\mathrm{ES}_\alpha = \frac{1}{1-\alpha}\int_\alpha^1 \mathrm{VaR}_u\,du = \mathbb{E}[L \mid L \ge \mathrm{VaR}_\alpha]$ |
| Mise à l'échelle temporelle (i.i.d. normal) | $\mathrm{VaR}^{(h)} = \sqrt{h}\,\mathrm{VaR}^{(1)}$ |
| Test de Kupiec | $x \sim \mathrm{Bin}(n, 1-\alpha)$ sous $H_0$ ; $\mathrm{LR}_{\text{POF}} \sim \chi^2_1$ |

## Questions d'entretien

::: question Le P&L quotidien d'un portefeuille est normal, de moyenne nulle et d'écart-type 2 M. Quelles sont ses VaR à 99 % à 1 jour et à 10 jours ?
::: hint
$z_{0{,}99} = 2{,}326$, et réfléchis à la façon dont la variance croît avec l'horizon.
:::
::: answer
VaR à 1 jour $= 2{,}326 \times 2 = 4{,}65$ M. Sous normalité i.i.d., l'écart-type à 10 jours vaut $\sqrt{10} \times 2$ M, donc la VaR à 10 jours vaut $\sqrt{10} \times 4{,}65 = 14{,}7$ M. La relance est toujours « quand est-ce que $\sqrt{10}$ est faux ? » : rendements autocorrélés, clustering de volatilité, queues épaisses, positions non linéaires, ou une dérive qui compte à long horizon.
:::
:::

::: question Pourquoi la VaR n'est-elle pas une mesure de risque cohérente ? Donne un exemple concret.
::: hint
Lequel des quatre axiomes échoue ? Construis un portefeuille où la diversification a l'air mauvaise.
:::
::: answer
La sous-additivité échoue. Deux obligations indépendantes perdant chacune 100 avec probabilité 4 % : chacune seule a $\mathrm{VaR}_{0{,}95} = 0$ parce qu'un événement à 4 % tient dans la queue à 5 %, mais la paire perd au moins 100 avec probabilité $1 - 0{,}96^2 = 7{,}84\,\% > 5\,\%$, donc $\mathrm{VaR}_{0{,}95} = 100 > 0 + 0$. L'expected shortfall est sous-additive : 80 pour chaque obligation, 103,2 pour la paire.
:::
:::

::: question Tu backtestes une VaR à 99 % à 1 jour sur 250 jours de bourse et tu observes 6 exceptions. Le modèle est-il rejeté ? Que fait le régulateur ?
::: hint
Le nombre d'exceptions attendu est $250 \times 0{,}01 = 2{,}5$. Calcule le rapport de vraisemblance de Kupiec et compare-le à un $\chi^2_1$.
:::
::: answer
$\mathrm{LR}_{\text{POF}} = -2\big[244\ln 0{,}99 + 6\ln 0{,}01\big] + 2\big[244\ln 0{,}976 + 6\ln 0{,}024\big] \approx 3{,}56$, sous la valeur critique à 5 % de 3,84 ($p \approx 0{,}06$) : non rejeté à 5 %, mais de justesse ; 7 exceptions rejetteraient. Dans le schéma bâlois du feu tricolore, 6 exceptions correspondent à la zone jaune : le multiplicateur de capital passe de 3 à 3,5, et la banque doit expliquer les exceptions.
:::
:::

::: question Dérive le rapport $\mathrm{ES}_\alpha / \mathrm{VaR}_\alpha$ pour une perte normale et pour une perte de Student-$t$ quand $\alpha \to 1$. Que dit la comparaison sur le choix du modèle ?
::: hint
Pour la normale, utilise $\varphi(z)/(1 - \Phi(z)) \approx z$ pour $z$ grand. Pour la $t_\nu$, la queue est une loi de puissance d'indice $\nu$.
:::
::: answer
Normale : $\mathrm{ES}/\mathrm{VaR} = \varphi(z_\alpha)/\big((1-\alpha) z_\alpha\big)$, et comme $1 - \Phi(z) \sim \varphi(z)/z$, le rapport tend vers 1 : il vaut 1,15 à 99 % et 1,09 à 99,9 %. Student-$t_\nu$ : la queue décroît comme $\ell^{-\nu}$, donc au-delà d'un quantile élevé la perte est approximativement de Pareto et $\mathrm{ES}/\mathrm{VaR} \to \nu/(\nu - 1)$, par exemple 1,5 pour $\nu = 3$ (déjà 1,54 à 99 %) et 1,33 pour $\nu = 4$. Le rapport reste borné loin de 1, ce qui signifie que la queue au-delà de la VaR porte une perte supplémentaire substantielle, aussi loin que l'on aille. Un modèle normal sous-estime donc l'ES bien plus qu'il ne sous-estime la VaR ; c'est exactement pourquoi les régulateurs sont passés à l'ES et pourquoi le modèle de la queue compte plus que le niveau de confiance.
:::
:::
