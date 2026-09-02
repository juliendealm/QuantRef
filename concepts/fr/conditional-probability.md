---
title: Probabilité conditionnelle
subject: probability
summary: Comment la probabilité d'un événement change une fois que l'on sait qu'un autre événement s'est produit. L'idée la plus utilisée en finance quantitative, car tout prix est un pari conditionné à l'information disponible.
difficulty: 1
interview: 5
tags: [probability, conditioning, information, bayes]
prerequisites: []
related: [bayes-theorem, martingales]
---

## Intuition

Une probabilité est toujours relative à ce que l'on sait. Avant de lancer deux dés, la chance que leur somme fasse 8 vaut $5/36$. Si l'on t'annonce que le premier dé montre 5, cette chance passe à $1/6$ : l'univers des possibles s'est réduit aux six cas où le premier dé vaut 5, et un seul d'entre eux donne 8.

Conditionner, ce n'est rien d'autre que **restreindre l'espace des possibles** aux issues compatibles avec l'information reçue, puis renormaliser pour que les probabilités somment de nouveau à 1.

En finance, « ce que l'on sait » est l'ensemble d'information à l'instant $t$, noté $\mathcal{F}_t$. Tout prix juste, toute prévision, tout chiffre de risque est une quantité conditionnelle : $\mathbb{E}[X \mid \mathcal{F}_t]$, et non $\mathbb{E}[X]$.

## Formulation mathématique

::: formula Probabilité conditionnelle
$$
\mathbb{P}(A \mid B) = \frac{\mathbb{P}(A \cap B)}{\mathbb{P}(B)}, \qquad \mathbb{P}(B) > 0
$$
:::

Réécrite, c'est la **règle de multiplication** $\mathbb{P}(A \cap B) = \mathbb{P}(A \mid B)\,\mathbb{P}(B)$, qui s'enchaîne pour un nombre quelconque d'événements :

$$
\mathbb{P}(A_1 \cap A_2 \cap \cdots \cap A_n) = \mathbb{P}(A_1)\,\mathbb{P}(A_2 \mid A_1)\,\mathbb{P}(A_3 \mid A_1 \cap A_2)\cdots\mathbb{P}(A_n \mid A_1 \cap \cdots \cap A_{n-1}).
$$

::: formula Formule des probabilités totales
Si $B_1, \dots, B_n$ forment une partition de l'espace,
$$
\mathbb{P}(A) = \sum_{i=1}^{n} \mathbb{P}(A \mid B_i)\,\mathbb{P}(B_i).
$$
:::

Deux événements sont **indépendants** exactement quand conditionner ne change rien : $\mathbb{P}(A \mid B) = \mathbb{P}(A)$, soit $\mathbb{P}(A \cap B) = \mathbb{P}(A)\mathbb{P}(B)$.

Pour des variables aléatoires, la même idée donne l'**espérance conditionnelle** $\mathbb{E}[X \mid Y]$, elle-même une variable aléatoire (fonction de $Y$), avec la **propriété de tour** :

::: formula Propriété de tour
$$
\mathbb{E}\big[\,\mathbb{E}[X \mid \mathcal{G}]\,\big] = \mathbb{E}[X], \qquad \text{et plus généralement} \qquad \mathbb{E}\big[\,\mathbb{E}[X \mid \mathcal{G}] \mid \mathcal{H}\,\big] = \mathbb{E}[X \mid \mathcal{H}] \text{ pour } \mathcal{H} \subseteq \mathcal{G}.
$$
:::

## Dérivation

Partons d'un espace fini $\Omega$ muni d'une mesure $\mathbb{P}$. Apprendre que $B$ s'est produit élimine tout $\omega \notin B$. La nouvelle mesure naturelle sur $B$ conserve les poids relatifs des issues survivantes et les remet à l'échelle pour sommer à 1 :

$$
\mathbb{P}_B(\omega) = \frac{\mathbb{P}(\omega)}{\mathbb{P}(B)} \quad \text{pour } \omega \in B, \qquad 0 \text{ sinon}.
$$

En sommant sur $\omega \in A$, on obtient $\mathbb{P}_B(A) = \mathbb{P}(A \cap B)/\mathbb{P}(B)$. C'est la définition ci-dessus ; c'est l'unique choix qui (i) donne probabilité 1 à $B$ et (ii) conserve les rapports $\mathbb{P}(\omega_1)/\mathbb{P}(\omega_2)$ à l'intérieur de $B$.

La formule des probabilités totales s'obtient en écrivant $A = \bigcup_i (A \cap B_i)$ comme union disjointe et en appliquant la règle de multiplication à chaque morceau.

## Hypothèses et cas limites

- **Conditionner par un événement de probabilité nulle.** $\mathbb{P}(A \mid B)$ n'est pas défini si $\mathbb{P}(B) = 0$. Conditionner par une variable continue prenant une valeur exacte ($Y = y$) demande des densités ou la définition mesure-théorique ; un usage naïf mène au paradoxe de Borel–Kolmogorov.
- **Conditionner n'est pas expliquer.** $\mathbb{P}(A \mid B)$ peut être élevée parce que $B$ cause $A$, parce que $A$ cause $B$, ou parce que les deux partagent une cause commune.
- **L'indépendance n'est pas transitive.** $A \perp B$ et $B \perp C$ n'impliquent pas $A \perp C$ ; et l'indépendance deux à deux n'implique pas l'indépendance mutuelle.
- **L'indépendance conditionnelle peut apparaître ou disparaître.** Deux événements indépendants peuvent devenir dépendants une fois qu'on conditionne par un troisième (paradoxe de Berkson : parmi les étudiants admis, talent et travail semblent négativement corrélés).

## Exemple détaillé

On lance deux dés équilibrés. Que vaut $\mathbb{P}(\text{somme} = 8 \mid \text{au moins un dé montre } 5)$ ?

L'événement conditionnant compte $11$ issues (six avec le premier dé à 5, six avec le second dé à 5, moins le doublon $(5,5)$). Parmi elles, la somme vaut 8 pour $(5,3)$ et $(3,5)$, donc la réponse est $2/11 \approx 0{,}182$. À comparer avec le conditionnement par « le *premier* dé montre 5 », qui donne $1/6$ : la formulation de l'information change tout.

Vérification par Monte Carlo :

```python
import numpy as np

rng = np.random.default_rng(42)
n = 1_000_000
d1 = rng.integers(1, 7, n)
d2 = rng.integers(1, 7, n)
total = d1 + d2

# P(sum = 8 | first die = 5) — exact answer 1/6
first_is_5 = d1 == 5
p_cond = np.mean(total[first_is_5] == 8)

# P(sum = 8 | at least one die is 5) — exact answer 2/11
at_least_one_5 = (d1 == 5) | (d2 == 5)
p_cond2 = np.mean(total[at_least_one_5] == 8)

print(f"P(sum=8 | first=5)       = {p_cond:.4f}  (exact {1/6:.4f})")
print(f"P(sum=8 | at least one 5) = {p_cond2:.4f}  (exact {2/11:.4f})")
```

::: output
```
P(sum=8 | first=5)       = 0.1676  (exact 0.1667)
P(sum=8 | at least one 5) = 0.1821  (exact 0.1818)
```
:::

Conditionner en code, c'est littéralement *filtrer puis moyenner* : `total[mask]` est l'espace des possibles restreint.

## Pourquoi c'est important en finance quantitative

- **Un prix est une espérance conditionnelle.** Sous la mesure risque-neutre, le prix à l'instant $t$ d'un flux $H$ vaut $e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[H \mid \mathcal{F}_t]$. Voir [[martingales]] et [[black-scholes]].
- **Les filtrations formalisent « ce qui est connu ».** Une [[martingales|martingale]] se définit entièrement par des espérances conditionnelles sachant $\mathcal{F}_t$.
- **Un signal est un avantage conditionnel.** Un signal de trading est utile si $\mathbb{E}[r_{t+1} \mid \text{signal}_t] \neq \mathbb{E}[r_{t+1}]$. Un backtest estime exactement cette moyenne conditionnelle.
- **Le risque est conditionnel.** L'expected shortfall vaut $\mathbb{E}[L \mid L > \mathrm{VaR}]$ (voir [[value-at-risk]]) ; un stress test est une espérance conditionnée à un scénario.
- **La mise à jour bayésienne** ([[bayes-theorem]]) est un conditionnement répété à mesure que les données arrivent, ce que fait un [[kalman-filter|filtre de Kalman]] à chaque tick.

## Erreurs fréquentes

::: pitfall Confondre $\mathbb{P}(A \mid B)$ et $\mathbb{P}(B \mid A)$
Le « sophisme du procureur ». $\mathbb{P}(\text{test positif} \mid \text{malade})$ peut valoir 99 % alors que $\mathbb{P}(\text{malade} \mid \text{test positif})$ vaut 10 %. Le théorème de Bayes les relie, il ne les égalise pas.
:::

::: pitfall Oublier de renormaliser
Après avoir filtré sur $B$, il faut diviser par $\mathbb{P}(B)$. Présenter $\mathbb{P}(A \cap B)$ comme si c'était $\mathbb{P}(A \mid B)$ sous-estime toute probabilité conditionnelle.
:::

::: pitfall Croire que « sachant » est symétrique dans le temps
Conditionner par le futur ($\mathbb{E}[X_t \mid \mathcal{F}_T]$ avec $T > t$) est mathématiquement licite, mais c'est du **biais d'anticipation** (look-ahead bias) dans un backtest.
:::

## Révision en 30 secondes

Probabilité conditionnelle = restreindre à ce que l'on sait, puis renormaliser : $\mathbb{P}(A \mid B) = \mathbb{P}(A \cap B)/\mathbb{P}(B)$. On l'enchaîne pour les probabilités jointes, on la somme sur une partition pour les probabilités totales, et on retient la propriété de tour pour l'information emboîtée. En finance, tout prix est $\mathbb{E}^{\mathbb{Q}}[\cdot \mid \mathcal{F}_t]$ ; l'indépendance signifie que conditionner ne change rien.

## Formules clés

| Nom | Formule |
|---|---|
| Définition | $\mathbb{P}(A \mid B) = \dfrac{\mathbb{P}(A \cap B)}{\mathbb{P}(B)}$ |
| Règle de multiplication | $\mathbb{P}(A \cap B) = \mathbb{P}(A \mid B)\,\mathbb{P}(B)$ |
| Probabilités totales | $\mathbb{P}(A) = \sum_i \mathbb{P}(A \mid B_i)\,\mathbb{P}(B_i)$ |
| Indépendance | $\mathbb{P}(A \mid B) = \mathbb{P}(A)$ |
| Propriété de tour | $\mathbb{E}[\mathbb{E}[X \mid \mathcal{G}]] = \mathbb{E}[X]$ |

## Questions d'entretien

::: question On lance deux pièces équilibrées. Sachant qu'au moins une montre pile, quelle est la probabilité que les deux montrent pile ?
::: hint
Liste les quatre issues équiprobables et retire celles incompatibles avec l'information.
:::
::: answer
L'événement conditionnant $\{PP, PF, FP\}$ a probabilité $3/4$ ; $\{PP\}$ a probabilité $1/4$. Donc $\mathbb{P} = (1/4)/(3/4) = 1/3$, et non $1/2$. La relance classique : « sachant que la *première* pièce montre pile » donne $1/2$.
:::
:::

::: question Une action monte avec probabilité 60 % chaque jour, les jours étant indépendants. Sachant qu'elle a monté au moins 2 des 3 derniers jours, quelle est la probabilité qu'elle ait monté les 3 jours ?
::: hint
Comptage binomial : $\mathbb{P}(3 \text{ hausses}) = 0{,}6^3$ et $\mathbb{P}(\text{exactement } 2) = 3 \cdot 0{,}6^2 \cdot 0{,}4$.
:::
::: answer
$\mathbb{P}(3) = 0{,}216$, $\mathbb{P}(2) = 0{,}432$. $\mathbb{P}(3 \mid \geq 2) = 0{,}216 / (0{,}216 + 0{,}432) = 1/3$.
:::
:::

::: question Énonce la propriété de tour et explique pourquoi elle rend le prix actualisé de tout produit une martingale sous la mesure de pricing.
::: hint
Écris le prix en $t$ comme espérance conditionnelle du flux final, puis prends une nouvelle espérance conditionnelle en $s < t$.
:::
::: answer
Propriété de tour : $\mathbb{E}[\mathbb{E}[X \mid \mathcal{F}_t] \mid \mathcal{F}_s] = \mathbb{E}[X \mid \mathcal{F}_s]$ pour $s \le t$. Avec $\tilde{V}_t = \mathbb{E}^{\mathbb{Q}}[\tilde{H} \mid \mathcal{F}_t]$ (flux actualisé $\tilde{H}$), on obtient $\mathbb{E}^{\mathbb{Q}}[\tilde{V}_t \mid \mathcal{F}_s] = \mathbb{E}^{\mathbb{Q}}[\tilde{H} \mid \mathcal{F}_s] = \tilde{V}_s$, ce qui est exactement la propriété de martingale.
:::
:::

::: question Deux événements $A$ et $B$ sont indépendants. Le restent-ils conditionnellement à un troisième événement $C$ ? Donne un contre-exemple financier.
::: hint
Pense à deux signaux indépendants et conditionne par leur somme, ou par une règle de sélection qui les a utilisés tous les deux.
:::
::: answer
Pas en général. Soit $A$ = « la stratégie 1 a gagné » et $B$ = « la stratégie 2 a gagné », indépendants. Conditionne par $C$ = « exactement une des deux a gagné ». Savoir que $A$ s'est produit implique que $B$ ne s'est pas produit : ils sont parfaitement négativement dépendants sachant $C$. C'est le paradoxe de Berkson, qui apparaît dès qu'on analyse un échantillon *sélectionné* (par exemple les fonds qui ont survécu).
:::
:::
