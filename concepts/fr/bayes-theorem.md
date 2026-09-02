---
title: Théorème de Bayes
subject: probability
summary: Comment renverser une probabilité conditionnelle et mettre à jour une croyance quand une nouvelle information arrive. La règle derrière tout filtre, tout modèle de régime, et toute évaluation honnête de ce que vaut vraiment un signal « fiable à 95 % ».
difficulty: 1
interview: 5
tags: [probability, bayes, updating, priors, base-rate]
prerequisites: [conditional-probability]
related: [conditional-probability, kalman-filter]
---

## Intuition

On connaît en général les probabilités dans le sens *direct* : si le marché est en régime baissier, ce signal se déclenche 90 % du temps. Ce dont on a besoin, c'est le sens *inverse* : le signal vient de se déclencher, quelle est la probabilité d'un régime baissier ? Le théorème de Bayes est le pont entre les deux, et le péage pour le traverser est le **taux de base**, la probabilité de l'hypothèse avant d'avoir vu quoi que ce soit.

La façon la plus claire d'y penser est en cotes. On part de ses cotes a priori, on multiplie par le facteur qui dit combien l'observation est plus probable sous une hypothèse que sous l'autre (le **rapport de vraisemblance**), et on obtient ses cotes a posteriori. Une observation ne dit jamais quoi croire ; elle dit de combien *bouger*.

Comme le mouvement est multiplicatif, les mises à jour s'enchaînent : le posterior d'aujourd'hui est le prior de demain. C'est tout ce que fait un [[kalman-filter|filtre de Kalman]] ou un modèle à changement de régime, tick après tick.

## Formulation mathématique

::: formula Théorème de Bayes
$$
\mathbb{P}(A \mid B) = \frac{\mathbb{P}(B \mid A)\,\mathbb{P}(A)}{\mathbb{P}(B)}, \qquad \mathbb{P}(B) = \mathbb{P}(B \mid A)\,\mathbb{P}(A) + \mathbb{P}(B \mid A^c)\,\mathbb{P}(A^c).
$$
:::

Avec une partition $A_1, \dots, A_n$ de l'espace (hypothèses mutuellement exclusives), la même identité s'écrit

$$
\mathbb{P}(A_i \mid B) = \frac{\mathbb{P}(B \mid A_i)\,\mathbb{P}(A_i)}{\sum_{j=1}^{n} \mathbb{P}(B \mid A_j)\,\mathbb{P}(A_j)}.
$$

Vocabulaire : $\mathbb{P}(A)$ est le **prior** (a priori), $\mathbb{P}(B \mid A)$ la **vraisemblance**, $\mathbb{P}(B)$ l'**évidence** (ou vraisemblance marginale), $\mathbb{P}(A \mid B)$ le **posterior** (a posteriori).

::: formula Forme en cotes
$$
\underbrace{\frac{\mathbb{P}(A \mid B)}{\mathbb{P}(A^c \mid B)}}_{\text{cotes a posteriori}}
= \underbrace{\frac{\mathbb{P}(B \mid A)}{\mathbb{P}(B \mid A^c)}}_{\text{rapport de vraisemblance } LR}
\times
\underbrace{\frac{\mathbb{P}(A)}{\mathbb{P}(A^c)}}_{\text{cotes a priori}}
$$
:::

En passant au logarithme, le produit devient une somme : $\operatorname{logit}\mathbb{P}(A \mid B) = \operatorname{logit}\mathbb{P}(A) + \log LR$. La quantité $\log LR$ est le **poids de l'évidence**.

::: formula Mise à jour séquentielle
Si les observations $B_1, \dots, B_k$ sont conditionnellement indépendantes sachant $A$ et sachant $A^c$,
$$
\text{cotes}(A \mid B_1, \dots, B_k) = \text{cotes}(A) \times \prod_{i=1}^{k} LR_i, \qquad LR_i = \frac{\mathbb{P}(B_i \mid A)}{\mathbb{P}(B_i \mid A^c)}.
$$
:::

Pour un paramètre continu $\theta$ de densité a priori $\pi(\theta)$ et des données $x$ de vraisemblance $f(x \mid \theta)$, le posterior est $\pi(\theta \mid x) \propto f(x \mid \theta)\,\pi(\theta)$ ; la constante de normalisation $\int f(x \mid \theta')\pi(\theta')\,d\theta'$ est l'évidence. Un prior est **conjugué** quand le posterior reste dans la même famille, ce qui réduit la mise à jour séquentielle à de la comptabilité :

::: formula Conjugaison Bêta–Binomiale
Un prior $\theta \sim \mathrm{Beta}(\alpha, \beta)$ et $k$ succès sur $n$ essais de Bernoulli($\theta$) donnent
$$
\theta \mid k \sim \mathrm{Beta}(\alpha + k,\; \beta + n - k), \qquad
\mathbb{E}[\theta \mid k] = \frac{\alpha + k}{\alpha + \beta + n}
= \frac{\alpha + \beta}{\alpha + \beta + n}\cdot\frac{\alpha}{\alpha + \beta} + \frac{n}{\alpha + \beta + n}\cdot\frac{k}{n}.
$$
:::

La moyenne a posteriori est une moyenne pondérée de la moyenne a priori et de la fréquence empirique, le prior valant $\alpha + \beta$ « pseudo-observations ». Autres couples conjugués classiques : prior normal sur une moyenne normale (la mise à jour de Kalman), prior Gamma sur un taux de Poisson.

## Dérivation

Le théorème de Bayes, c'est la [[conditional-probability|règle de multiplication]] lue dans les deux sens. Comme $\mathbb{P}(A \cap B) = \mathbb{P}(A \mid B)\,\mathbb{P}(B) = \mathbb{P}(B \mid A)\,\mathbb{P}(A)$, diviser par $\mathbb{P}(B) > 0$ donne le théorème ; la formule des probabilités totales développe le dénominateur sur $\{A, A^c\}$ ou sur n'importe quelle partition.

**Forme en cotes.** On écrit le théorème pour $A$ et pour $A^c$, puis on divise l'un par l'autre : $\mathbb{P}(B)$ se simplifie et il reste $\text{cotes a posteriori} = LR \times \text{cotes a priori}$. C'est ce qui rend la forme en cotes commode : on n'a jamais besoin de calculer l'évidence $\mathbb{P}(B)$.

**Forme séquentielle.** Avec l'indépendance conditionnelle, $\mathbb{P}(B_1 \cap B_2 \mid A) = \mathbb{P}(B_1 \mid A)\,\mathbb{P}(B_2 \mid A)$ et de même sous $A^c$, donc le rapport de vraisemblance joint est le produit $LR_1 LR_2$. De façon équivalente, on met à jour sur $B_1$, puis on prend le résultat comme prior pour $B_2$ : la réponse est la même, et c'est ce qui rend le filtrage en ligne possible.

**Bêta–Binomiale.** La vraisemblance de $k$ succès sur $n$ essais est $\binom{n}{k}\theta^k(1-\theta)^{n-k}$ et la densité $\mathrm{Beta}(\alpha, \beta)$ est proportionnelle à $\theta^{\alpha-1}(1-\theta)^{\beta-1}$. Leur produit est proportionnel à $\theta^{\alpha+k-1}(1-\theta)^{\beta+n-k-1}$, qui est le noyau de $\mathrm{Beta}(\alpha+k, \beta+n-k)$. Le coefficient binomial et la constante de la loi Bêta ne dépendent pas de $\theta$ et disparaissent dans l'évidence.

## Hypothèses et cas limites

- **L'observation doit être possible.** $\mathbb{P}(B) > 0$ ; sinon le posterior n'est pas défini.
- **Règle de Cromwell.** Un prior valant exactement 0 ou 1 ne bouge jamais, quelles que soient les données : $LR \times 0 = 0$. Garde une petite masse sur toute hypothèse que tu pourrais un jour devoir accepter.
- **L'indépendance conditionnelle est une hypothèse de modélisation.** Multiplier des rapports de vraisemblance compte deux fois une évidence corrélée : deux signaux de momentum calculés sur les mêmes prix ne sont pas deux témoins indépendants.
- **La vraisemblance n'est pas une probabilité en $\theta$.** $f(x \mid \theta)$ vue comme fonction de $\theta$ n'a aucune raison d'intégrer à 1 ; seul le produit avec le prior, une fois normalisé, est une distribution.
- **$LR = 1$ signifie aucune information**, aussi « significative » que paraisse l'observation isolément. Symétriquement, un $LR$ énorme contre un prior minuscule donne toujours un petit posterior : $LR = 100$ et prior $10^{-4}$ donnent des cotes a posteriori de $10^{-2}$, soit environ 1 %.
- **Le posterior hérite des erreurs du modèle.** Le théorème de Bayes est exact ; les vraisemblances qu'on y injecte ne le sont pas. Un modèle de régime avec la mauvaise distribution des rendements se met à jour avec assurance dans la mauvaise direction.

## Exemple détaillé

Un test détecte une maladie présente chez 1 % de la population, avec une sensibilité de 99 % et un taux de faux positifs de 5 %. Que vaut $\mathbb{P}(\text{malade} \mid \text{positif})$ ?

$$
\mathbb{P}(\text{malade} \mid +) = \frac{0.99 \times 0.01}{0.99 \times 0.01 + 0.05 \times 0.99} = \frac{0.0099}{0.0594} \approx 0.167.
$$

En cotes : cotes a priori $1/99 \approx 0{,}0101$, rapport de vraisemblance $0{,}99/0{,}05 = 19{,}8$, cotes a posteriori $0{,}2$, soit $1/6$. Un second test positif, conditionnellement indépendant, multiplie encore les cotes par $19{,}8$ : $3{,}96$, donc $\mathbb{P} \approx 0{,}80$. Remplace « malade » par « régime de krach » et « test » par « signal déclenché », et tu as l'arithmétique de tout système d'alerte.

La partie Bêta–Binomiale ci-dessous regarde un prior plat apprendre le biais d'une pièce avec $\theta = 0{,}6$, un lancer à la fois :

```python
import numpy as np

# --- Base rate: a test with 99 % sensitivity and 5 % false-positive rate ---
prior, sens, fpr = 0.01, 0.99, 0.05
p_pos = sens * prior + fpr * (1 - prior)          # law of total probability
post = sens * prior / p_pos
print(f"P(positive)        = {p_pos:.4f}")
print(f"P(sick | positive) = {post:.4f}")

# --- Same update in odds form, applied twice for two independent positives ---
lr = sens / fpr
odds = prior / (1 - prior)
for k in (1, 2):
    odds *= lr
    print(f"after {k} positive(s): odds = {odds:.3f}, P = {odds / (1 + odds):.4f}")

# --- Sequential Beta-Binomial update on coin flips, true P(heads) = 0.6 ---
rng = np.random.default_rng(7)
flips = rng.random(50) < 0.6
a, b = 1.0, 1.0                                   # Beta(1, 1): flat prior
for n, x in enumerate(flips, 1):
    a, b = a + int(x), b + 1 - int(x)             # posterior after one more flip
    if n in (1, 5, 10, 25, 50):
        mean = a / (a + b)
        sd = np.sqrt(a * b / ((a + b) ** 2 * (a + b + 1)))
        print(f"n={n:2d}  Beta({a:2.0f},{b:2.0f})  mean={mean:.3f}  sd={sd:.3f}")
```

::: output
```
P(positive)        = 0.0594
P(sick | positive) = 0.1667
after 1 positive(s): odds = 0.200, P = 0.1667
after 2 positive(s): odds = 3.960, P = 0.7984
n= 1  Beta( 1, 2)  mean=0.333  sd=0.236
n= 5  Beta( 3, 4)  mean=0.429  sd=0.175
n=10  Beta( 5, 7)  mean=0.417  sd=0.137
n=25  Beta(15,12)  mean=0.556  sd=0.094
n=50  Beta(31,21)  mean=0.596  sd=0.067
```
:::

Après 10 lancers, le posterior est encore à $0{,}42$ avec un écart-type de $0{,}14$ : une série de faces dans un petit échantillon domine. Après 50 lancers, il est passé à $0{,}60 \pm 0{,}07$. L'écart-type a posteriori décroît à peu près comme $1/\sqrt{n}$, ce qui est le visage bayésien de la loi des grands nombres.

## Pourquoi c'est important en finance quantitative

- **La fiabilité d'un signal est une question de taux de base.** Un indicateur de krach qui se déclenche avant 90 % des krachs et dans 5 % des mois normaux, avec des krachs dans 2 % des mois, donne $\mathbb{P}(\text{krach} \mid \text{déclenché}) \approx 0{,}27$ : la plupart des alertes sont fausses. C'est la précision, pas le taux de détection, que voit le P&L.
- **La détection de régime est du Bayes séquentiel.** Dans un modèle de Markov caché / à changement de régime, la probabilité filtrée $\mathbb{P}(S_t = \text{baissier} \mid r_{1:t})$ s'obtient par une étape de *prédiction* (appliquer la matrice de transition au posterior d'hier) et une étape de *mise à jour* (multiplier par la vraisemblance du rendement du jour sous chaque régime, renormaliser). C'est le filtre de Hamilton.
- **Le [[kalman-filter|filtre de Kalman]] est du Bayes avec conjugaison gaussienne.** Prior gaussien sur l'état, vraisemblance gaussienne de l'observation, posterior gaussien ; le gain de Kalman est la moyenne pondérée par les précisions, la formule Bêta–Binomiale déguisée.
- **Rétrécissement (shrinkage).** Les moyennes a posteriori ramènent les estimations bruitées vers le prior : Black–Litterman mélange rendements d'équilibre et vues, et le taux de réussite d'une stratégie estimé sur 20 trades doit être fortement ramené vers 50 %.
- **Sur-apprentissage des backtests.** Si seule 1 stratégie testée sur 100 a un vrai avantage, et qu'un backtest au seuil de 5 % laisse passer 80 % des vraies stratégies, alors $\mathbb{P}(\text{vraie} \mid \text{passe}) = 0{,}008/(0{,}008 + 0{,}0495) \approx 0{,}14$. La plupart des backtests publiés sont des faux positifs, exactement pour la raison du test médical.
- **Le conditionnement par l'information** en général est le sujet de [[conditional-probability]] ; Bayes est l'outil qui rend le conditionnement par des *observations* calculable.

## Erreurs fréquentes

::: pitfall Négliger le taux de base
Lire « le test est fiable à 99 % » comme « un positif signifie malade à 99 % ». La sensibilité est $\mathbb{P}(+ \mid \text{malade})$ ; le posterior $\mathbb{P}(\text{malade} \mid +)$ peut valoir 17 % ou 1 % selon la prévalence. Écris toujours le prior en premier.
:::

::: pitfall Multiplier des rapports de vraisemblance d'observations corrélées
Trois indicateurs techniques dérivés de la même série de prix ne sont pas trois confirmations indépendantes. Leur rapport de vraisemblance joint est bien plus petit que le produit des rapports individuels ; les traiter comme indépendants produit des posteriors trop confiants.
:::

::: pitfall Un prior dogmatique
Poser $\mathbb{P}(\text{le modèle est faux}) = 0$ signifie qu'aucune perte ne pourra jamais te faire changer d'avis. Un prior de 0 ou 1 n'est pas une croyance, c'est un refus d'apprendre.
:::

::: pitfall Confondre la vraisemblance et le posterior
Maximiser $f(x \mid \theta)$ (maximum de vraisemblance) ignore le prior et peut s'écarter énormément de la moyenne a posteriori quand les données sont rares. Avec $n = 10$ trades, le taux de réussite empirique n'est pas ta meilleure estimation du vrai taux.
:::

## Révision en 30 secondes

Bayes renverse le conditionnement : $\mathbb{P}(A \mid B) = \mathbb{P}(B \mid A)\mathbb{P}(A)/\mathbb{P}(B)$. En cotes, c'est cotes a posteriori $=$ rapport de vraisemblance $\times$ cotes a priori, et des observations indépendantes multiplient les rapports de vraisemblance (additionnent les log-cotes). Le taux de base est ce que l'intuition oublie : un test sensible à 99 % sur une maladie à 1 % donne un posterior de 17 %. Les priors conjugués (Bêta–Binomiale, Normale–Normale) rendent les mises à jour séquentielles explicites, et la moyenne a posteriori est une moyenne pondérée du prior et des données, le prior valant $\alpha + \beta$ observations. Les filtres de régime et le filtre de Kalman sont cette mise à jour répétée à chaque période.

## Formules clés

| Nom | Formule |
|---|---|
| Théorème de Bayes | $\mathbb{P}(A \mid B) = \dfrac{\mathbb{P}(B \mid A)\,\mathbb{P}(A)}{\mathbb{P}(B)}$ |
| Évidence | $\mathbb{P}(B) = \sum_j \mathbb{P}(B \mid A_j)\,\mathbb{P}(A_j)$ |
| Forme en cotes | $\text{cotes}(A \mid B) = LR \times \text{cotes}(A)$, $LR = \dfrac{\mathbb{P}(B \mid A)}{\mathbb{P}(B \mid A^c)}$ |
| Log-cotes | $\operatorname{logit}\mathbb{P}(A \mid B) = \operatorname{logit}\mathbb{P}(A) + \log LR$ |
| Posterior continu | $\pi(\theta \mid x) \propto f(x \mid \theta)\,\pi(\theta)$ |
| Bêta–Binomiale | $\mathrm{Beta}(\alpha, \beta) \xrightarrow{k \text{ sur } n} \mathrm{Beta}(\alpha + k, \beta + n - k)$, moyenne $\dfrac{\alpha + k}{\alpha + \beta + n}$ |

## Questions d'entretien

::: question Une maladie touche 0,1 % des gens. Un test a une sensibilité de 99 % et un taux de faux positifs de 1 %. Tu es testé positif : quelle est la probabilité que tu sois malade ?
::: hint
Calcule les deux façons d'obtenir un résultat positif : malade et détecté, sain et fausse alerte.
:::
::: answer
$\mathbb{P}(\text{malade} \mid +) = \dfrac{0.99 \times 0.001}{0.99 \times 0.001 + 0.01 \times 0.999} = \dfrac{0.00099}{0.01098} \approx 0.090$. Environ 9 % : les fausses alertes parmi les 99,9 % de gens sains sont dix fois plus nombreuses que les vrais positifs. En cotes : $\frac{1}{999} \times 99 \approx 0{,}099$.
:::
:::

::: question Un sac contient une pièce équilibrée et une pièce à deux faces « pile ». Tu en tires une au hasard, tu la lances trois fois et tu obtiens trois piles. Quelle est la probabilité de tenir la pièce truquée ? Comment la réponse évolue-t-elle lancer après lancer ?
::: hint
Les cotes a priori sont 1:1. Chaque pile est deux fois plus probable avec la pièce truquée.
:::
::: answer
Vraisemblances : $1$ pour la pièce truquée, $(1/2)^3 = 1/8$ pour la pièce équilibrée. Posterior $= \dfrac{1 \cdot \frac12}{1 \cdot \frac12 + \frac18 \cdot \frac12} = \dfrac{8}{9} \approx 0{,}889$. Séquentiellement, chaque pile a $LR = 2$, donc les cotes vont $1 \to 2 \to 4 \to 8$, soit des probabilités $1/2 \to 2/3 \to 4/5 \to 8/9$. Une seule face enverrait les cotes à 0, puisque la pièce truquée ne peut pas la produire.
:::
:::

::: question Une stratégie a gagné 12 de ses 20 premiers trades. Ton prior sur le taux de réussite des nouvelles stratégies est centré à 50 % avec un écart-type de 5 %. Donne une estimation bayésienne du vrai taux de réussite et explique la formule utilisée.
::: hint
Choisis un prior $\mathrm{Beta}(\alpha, \alpha)$ de moyenne $1/2$ et de variance $1/(4(2\alpha + 1))$, puis utilise la conjugaison.
:::
::: answer
Pour $\mathrm{Beta}(\alpha, \alpha)$, variance $= \frac{1}{4(2\alpha + 1)} = 0{,}05^2$ donne $2\alpha + 1 = 100$, donc $\alpha = \beta = 49{,}5$ : le prior vaut 99 pseudo-trades. Posterior $\mathrm{Beta}(61{,}5;\ 57{,}5)$, moyenne $61{,}5/119 \approx 0{,}517$. La fréquence empirique $0{,}60$ reçoit le poids $n/(\alpha + \beta + n) = 20/119 \approx 0{,}17$, la moyenne a priori le poids $0{,}83$. Vingt trades déplacent à peine un prior bien fondé ; en déduire un taux de réussite de 60 % est le sophisme du taux de base déguisé.
:::
:::

::: question Dans un modèle à deux régimes, la probabilité filtrée du régime baissier hier valait 0,20. Probabilités de transition : baissier reste baissier avec 0,90, haussier passe à baissier avec 0,05. Le rendement du jour est 4 fois plus probable sous le régime baissier que sous le haussier. Quelle est la probabilité filtrée du régime baissier aujourd'hui ? Quelle étape est du Bayes et laquelle ne l'est pas ?
::: hint
Propage d'abord le posterior d'hier à travers la matrice de transition, puis mets à jour avec le rapport de vraisemblance en forme de cotes.
:::
::: answer
Prédiction : $\mathbb{P}(\text{baissier aujourd'hui} \mid r_{1:t-1}) = 0{,}20 \times 0{,}90 + 0{,}80 \times 0{,}05 = 0{,}22$. Cette étape est la formule des probabilités totales sur le régime d'hier, pas Bayes. Mise à jour : cotes a priori $0{,}22/0{,}78 \approx 0{,}282$, fois $LR = 4$ donne des cotes a posteriori $\approx 1{,}128$, donc $\mathbb{P}(\text{baissier} \mid r_{1:t}) \approx 0{,}53$. L'étape de mise à jour est le théorème de Bayes. Itérer prédiction–mise à jour est le filtre de Hamilton ; remplace les régimes discrets par un état gaussien et tu as le [[kalman-filter|filtre de Kalman]].
:::
:::
