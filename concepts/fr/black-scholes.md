---
title: Modèle de Black–Scholes
subject: derivatives
summary: Le modèle de référence pour les options européennes. Une action log-normale couverte en continu donne une EDP, un prix fermé avec d1 et d2 et, via la volatilité implicite, le langage que parle tout desk d'options même là où le modèle est connu pour échouer.
difficulty: 3
interview: 5
tags: [black-scholes, options, pde, risk-neutral, implied-volatility, delta-hedging]
prerequisites: [ito-lemma, martingales]
related: [greeks, brownian-motion]
---

## Intuition

Une option ne se valorise pas en prévoyant où ira l'action. Elle se valorise par **réplication** : si l'on peut construire un portefeuille d'actions et de cash qui reproduit le payoff de l'option dans tous les scénarios, l'option doit coûter exactement ce que coûte ce portefeuille, sinon il y a un déjeuner gratuit.

Black et Scholes ont montré que lorsque l'action suit un mouvement brownien géométrique à volatilité constante et que l'on peut trader en continu, un tel portefeuille existe. Il détient $\Delta = \partial V/\partial S$ actions à chaque instant, rééquilibré en continu. Le rendement espéré $\mu$ de l'action n'intervient jamais : quelle que soit la dérive, la couverture l'annule. Seule la volatilité $\sigma$ compte, parce qu'elle gouverne l'ampleur des ajustements de la couverture.

Deux lectures équivalentes du même fait :

1. **Lecture EDP.** Le portefeuille couvert est sans risque, il doit donc rapporter le taux sans risque $r$. Cet énoncé est une équation aux dérivées partielles pour $V(t, S)$.
2. **Lecture probabiliste.** Sous une probabilité artificielle « risque-neutre » $\mathbb{Q}$ dans laquelle l'action dérive au taux $r$, les prix actualisés sont des [[martingales]], et le prix de l'option est l'espérance actualisée du payoff.

La formule fermée est la solution de l'EDP pour le payoff d'un call ; tout le reste du monde des options (le smile, les [[greeks|grecques]], la volatilité implicite) se définit par rapport à elle.

## Formulation mathématique

**Hypothèses.**

1. L'action suit $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$ avec $\mu$ et $\sigma$ constants (rendements log-normaux, trajectoires continues).
2. Un taux sans risque $r$ constant, à capitalisation continue, auquel on peut emprunter et prêter librement.
3. Pas de dividende pendant la vie de l'option (un taux de dividende continu $q$ est une extension facile).
4. Marchés sans friction : pas de coûts de transaction ni de taxes, trading continu, vente à découvert illimitée, actifs infiniment divisibles.
5. Absence d'arbitrage.
6. Exercice européen : payoff en $T$ seulement.

::: formula EDP de Black–Scholes
$$
\partial_t V + \tfrac12 \sigma^2 S^2\,\partial_{SS} V + r S\,\partial_S V - r V = 0, \qquad V(T, S) = \text{payoff}(S).
$$
:::

::: formula Prix du call et du put
$$
\begin{aligned}
C &= S\,N(d_1) - K e^{-rT} N(d_2), \\
P &= K e^{-rT} N(-d_2) - S\,N(-d_1), \\
d_1 &= \frac{\ln(S/K) + (r + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T},
\end{aligned}
$$
avec $N$ la fonction de répartition de la loi normale centrée réduite et $T$ le temps restant jusqu'à l'échéance.
:::

::: formula Parité call–put
$$
C - P = S - K e^{-rT}.
$$
:::

La parité ne dépend d'aucun modèle (un call long plus un put court est un forward), c'est pourquoi la formule du put découle de celle du call sans nouveau calcul.

::: formula Valorisation risque-neutre
$$
V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}\big[\text{payoff}(S_T) \mid \mathcal{F}_t\big], \qquad dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t .
$$
:::

Lecture de la formule : $N(d_2) = \mathbb{Q}(S_T > K)$ est la probabilité risque-neutre d'exercice, donc $K e^{-rT} N(d_2)$ est la valeur actuelle de ce que l'on s'attend à payer. $S\,N(d_1) = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T \mathbf{1}_{S_T > K}]$ est la valeur actuelle de ce que l'on s'attend à recevoir, et $N(d_1)$ est aussi le delta du call.

Avec un taux de dividende continu $q$, le call vaut $C = S e^{-qT} N(d_1) - K e^{-rT} N(d_2)$ avec $d_1 = \dfrac{\ln(S/K) + (r - q + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}$. On actualise le spot par $e^{-qT}$ **ou** on le fait porter à $r - q$ dans $d_1$ : c'est la même recette écrite deux fois, donc appliquer les deux compte le dividende deux fois. La formule de Black pour les options sur futures est le cas $q = r$.

## Dérivation

**Argument de couverture en delta (l'EDP).** Soit $V(t, S)$ le prix de l'option, supposé régulier. Formons le portefeuille $\Pi = V - \Delta S$ : long de l'option, court de $\Delta$ actions. Par le [[ito-lemma|lemme d'Itô]],

$$
dV = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt + \partial_S V\,dS_t ,
$$

donc $d\Pi = dV - \Delta\,dS_t$. Choisir $\Delta = \partial_S V$ élimine tout terme en $dS_t$ :

$$
d\Pi = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt .
$$

Le portefeuille est désormais sans risque sur $dt$. Par absence d'arbitrage il doit rapporter le taux sans risque : $d\Pi = r\Pi\,dt = r\,(V - S\,\partial_S V)\,dt$. En égalant les deux expressions on obtient l'EDP de Black–Scholes. Notons que $\mu$ a disparu quand les termes en $dS_t$ se sont annulés ; c'est tout l'intérêt.

(En toute rigueur il faudrait montrer que le portefeuille de réplication est autofinancé ; l'heuristique ci-dessus donne la bonne équation et c'est ce que les recruteurs attendent.)

**Argument risque-neutre (l'espérance).** Le théorème de Girsanov dit que sous la mesure $\mathbb{Q}$ définie par la martingale exponentielle avec $\lambda = (\mu - r)/\sigma$, le processus $W^{\mathbb{Q}}_t = W_t + \lambda t$ est un mouvement brownien, et $dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t$. Alors $e^{-rt} S_t$ est une $\mathbb{Q}$-martingale, de même que la valeur actualisée de tout portefeuille autofinancé ; le prix de l'option est donc $V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff} \mid \mathcal{F}_t]$. Le théorème de Feynman–Kac affirme que cette espérance résout l'EDP ci-dessus.

**Forme fermée.** Sous $\mathbb{Q}$, $S_T = S\exp\big((r - \tfrac12\sigma^2)T + \sigma\sqrt{T}\,Z\big)$ avec $Z \sim \mathcal{N}(0, 1)$. Le call finit dans la monnaie quand $Z > -d_2$, puisque

$$
S_T > K \iff Z > \frac{\ln(K/S) - (r - \tfrac12\sigma^2)T}{\sigma\sqrt{T}} = -d_2 .
$$

Alors

$$
C = e^{-rT}\int_{-d_2}^{\infty} \Big(S e^{(r - \frac12\sigma^2)T + \sigma\sqrt{T} z} - K\Big)\varphi(z)\,dz .
$$

Le second terme vaut $K e^{-rT}\,\mathbb{Q}(Z > -d_2) = K e^{-rT} N(d_2)$. Pour le premier, on complète le carré : $e^{-\frac12\sigma^2 T + \sigma\sqrt{T}z}\,\varphi(z) = \varphi(z - \sigma\sqrt{T})$, si bien qu'il vaut $S\int_{-d_2}^{\infty}\varphi(z - \sigma\sqrt{T})\,dz = S\,N(d_2 + \sigma\sqrt{T}) = S\,N(d_1)$. Le put découle de la parité.

## Hypothèses et cas limites

**Limites à connaître.**

- $T \to 0$ : $C \to (S - K)^+$, avec $d_1, d_2 \to \pm\infty$ selon que $S > K$ ou non.
- $\sigma \to 0$ : $C \to (S - K e^{-rT})^+$, la valeur d'un forward si elle est positive : sans incertitude, l'option est un forward ou rien.
- $\sigma \to \infty$ : $d_1 \to +\infty$, $d_2 \to -\infty$, $C \to S$ : une option sur un sous-jacent infiniment volatil vaut l'action.
- Très dans la monnaie : $C \approx S - K e^{-rT}$ ; très en dehors : $C \to 0$ plus vite que toute puissance de $S$.
- À la monnaie forward ($S = K e^{-rT}$) : $C \approx 0{,}4\,S\,\sigma\sqrt{T}$, la règle empirique des traders.

**Volatilité implicite et smile.** Comme $\partial C/\partial\sigma > 0$, l'application $\sigma \mapsto C_{BS}(\sigma)$ est strictement croissante de $(S - Ke^{-rT})^+$ à $S$ ; pour tout prix de marché dans cet intervalle il existe une unique $\sigma_{\text{impl}}$ qui le reproduit. Si le modèle était juste, $\sigma_{\text{impl}}$ serait le même nombre pour tous les strikes et toutes les échéances. Ce n'est pas le cas : tracée en fonction de $K$, elle donne un **smile** (en change) ou, depuis 1987 sur les actions, un **skew** où les puts de strike bas sont chers ; tracée en fonction de $T$, une structure par terme. Le smile est le désaccord mesuré du marché avec la log-normalité : queues épaisses, peur du krach, effet de levier. Pourtant la volatilité implicite reste la convention de cotation universelle, précisément parce que tout le monde peut inverser la même formule.

**Ce qui casse, et à quel point.**

- **Couverture discrète.** Rééquilibrer $N$ fois au lieu de continûment laisse une erreur de couverture de moyenne nulle et d'écart-type d'ordre $\sigma\,\nu/\sqrt{N}$, où $\nu$ est le véga (l'estimation de Derman et Kamal est $\sqrt{\pi/4}\;\sigma\nu/\sqrt{N}$). Une couverture quotidienne d'une option à 3 mois ($N \approx 63$) laisse une erreur d'environ 10 % de la prime.
- **Sauts.** Un saut ne se couvre pas avec une position en action seule : le marché est incomplet, le prix n'est plus unique, et les puts en dehors de la monnaie sont systématiquement sous-évalués par le modèle, ce qui est une lecture du skew.
- **Volatilité stochastique.** Avec $\sigma$ aléatoire, la couverture garde une exposition véga résiduelle et le smile apparaît ; des modèles comme Heston ajoutent un second mouvement brownien corrélé à l'action.
- **Coûts de transaction.** Un rééquilibrage continu coûterait infiniment cher. L'ajustement de Leland remplace $\sigma^2$ par $\sigma^2\big(1 + \sqrt{2/\pi}\;k/(\sigma\sqrt{\delta t})\big)$ pour un coût proportionnel $k$ et un intervalle de rééquilibrage $\delta t$.
- **Taux et dividendes.** Les taux stochastiques comptent pour les options longues ; les dividendes discrets demandent un spot ajusté. Les deux sont des extensions de routine.
- **Exercice anticipé.** La formule vaut pour les options européennes. Un put américain sur une action sans dividende vaut strictement plus ; un call américain sur une action sans dividende vaut la même chose, car il n'est jamais optimal de l'exercer avant l'échéance.

## Exemple détaillé

Valorisons un call à un an avec $S = 100$, $K = 105$, $r = 3\,\%$, $\sigma = 20\,\%$.

$$
d_1 = \frac{\ln(100/105) + (0{,}03 + 0{,}02)\times 1}{0{,}20} = \frac{-0{,}04879 + 0{,}05}{0{,}20} = 0{,}0060, \qquad d_2 = 0{,}0060 - 0{,}20 = -0{,}1940 .
$$

$N(d_1) = 0{,}5024$, $N(d_2) = 0{,}4231$, $K e^{-rT} = 105 \times 0{,}97045 = 101{,}90$, donc

$$
C = 100 \times 0{,}5024 - 101{,}90 \times 0{,}4231 = 50{,}24 - 43{,}11 = 7{,}13, \qquad P = C - S + K e^{-rT} = 9{,}02 .
$$

Le call est légèrement en dehors de la monnaie, et pourtant $N(d_2) = 42\,\%$ des trajectoires risque-neutres finissent au-dessus de $105$. Le code ci-dessous confirme la forme fermée par Monte Carlo sous le même MBG, puis inverse la formule pour retrouver une volatilité implicite à partir d'une cotation de marché :

```python
import numpy as np
from scipy.stats import norm
from scipy.optimize import brentq

def bs_call(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

S0, K, T, r, sigma = 100.0, 105.0, 1.0, 0.03, 0.20
analytic = bs_call(S0, K, T, r, sigma)

# Monte Carlo under the risk-neutral GBM: S_T = S0 exp((r - sigma^2/2) T + sigma sqrt(T) Z)
rng = np.random.default_rng(2024)
n = 1_000_000
Z = rng.standard_normal(n)
ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
disc_payoff = np.exp(-r * T) * np.maximum(ST - K, 0.0)
mc, se = disc_payoff.mean(), disc_payoff.std(ddof=1) / np.sqrt(n)

print(f"Black-Scholes call : {analytic:.4f}")
print(f"Monte Carlo call   : {mc:.4f}  (std error {se:.4f})")

# Put from put-call parity, then implied vol backed out of a market quote
put = analytic - S0 + K * np.exp(-r * T)
print(f"Put via parity     : {put:.4f}")
market_price = 8.00
iv = brentq(lambda s: bs_call(S0, K, T, r, s) - market_price, 1e-6, 5.0)
print(f"Implied vol of a call quoted at {market_price:.2f} : {iv:.4%}")
print(f"Check: bs_call at implied vol = {bs_call(S0, K, T, r, iv):.4f}")
```

::: output
```
Black-Scholes call : 7.1281
Monte Carlo call   : 7.1427  (std error 0.0126)
Put via parity     : 9.0248
Implied vol of a call quoted at 8.00 : 22.1859%
Check: bs_call at implied vol = 8.0000
```
:::

L'estimation Monte Carlo se situe à 1,2 erreur-type de la forme fermée, comme il se doit. Une cotation de marché de $8{,}00$ pour ce call est incompatible avec $\sigma = 20\,\%$ : le marché implique $22{,}2\,\%$. Collecter ce nombre pour chaque strike et chaque échéance, c'est ainsi que l'on construit la surface de volatilité. `brentq` fonctionne parce que le prix du call est monotone en $\sigma$, donc la racine est unique.

## Pourquoi c'est important en finance quantitative

- **C'est la convention de cotation.** Les traders cotent les options en volatilité implicite, pas en prix, et décrivent le marché par la surface de vol $\sigma_{\text{impl}}(K, T)$. Tout modèle plus sophistiqué est calibré sur cette surface.
- **Il définit la couverture.** Le delta $N(d_1)$ et les autres [[greeks|grecques]] sont ce qu'un desk trade réellement ; le P&L d'une position couverte vaut $\tfrac12\Gamma S^2(\sigma^2_{\text{real}} - \sigma^2_{\text{impl}})\,dt$, un pari sur la variance réalisée contre la variance implicite.
- **C'est le gabarit de tout ce qui a suivi.** Black-76 pour les futures et les caps, Garman–Kohlhagen pour le change, le modèle structurel de crédit de Merton (les fonds propres sont un call sur les actifs de l'entreprise), volatilité locale et stochastique, diffusions à sauts : chacun est Black–Scholes avec une hypothèse relâchée.
- **C'est le cas concret du pricing par martingale.** Le changement de mesure, la propriété de [[martingales|martingale]] des prix actualisés et Feynman–Kac apparaissent tous ici dans le cadre non trivial le plus simple, bâti sur le [[brownian-motion|mouvement brownien]] et le [[ito-lemma|lemme d'Itô]].
- **Il alimente les systèmes de risque.** Les livres d'options sont réévalués avec la formule et ses grecques sous des milliers de scénarios pour calculer la [[value-at-risk]].
- **C'est la dérivation standard en entretien.** Dériver l'EDP à partir d'une couverture, énoncer la forme fermée et expliquer pourquoi le smile existe est attendu de quiconque touche aux options.

## Erreurs fréquentes

::: pitfall Injecter le rendement espéré dans la formule
$\mu$ n'apparaît pas parce que la couverture l'élimine. « Risque-neutre » ne signifie pas que les investisseurs sont indifférents au risque ; cela signifie que l'argument de réplication rend les préférences pour le risque sans effet sur le prix.
:::

::: pitfall Confondre N(d1) et N(d2)
$N(d_2)$ est la probabilité risque-neutre que l'option soit exercée. $N(d_1)$ est le delta, et il est *toujours plus grand* que $N(d_2)$ ; c'est la probabilité d'exercice sous la mesure qui prend l'action comme numéraire. Présenter $N(d_1)$ comme « la probabilité de finir dans la monnaie » est une erreur classique.
:::

::: pitfall Mélanger les unités de temps
$\sigma$ est annualisée et $T$ est en années ; la formule ne voit jamais que $\sigma\sqrt{T}$ et $rT$. Fournir une volatilité quotidienne avec une échéance en années, ou une échéance en jours avec un $\sigma$ annuel, est faux d'un facteur $\sqrt{252}$.
:::

::: pitfall Lire le smile comme une erreur de prix à arbitrer
Le smile n'est pas une erreur du marché ; c'est le marché qui valorise des queues et des krachs que le modèle log-normal ne peut pas représenter. Vendre des puts en dehors de la monnaie « chers » parce que leur volatilité implicite est élevée, c'est le trade qui explose.
:::

## Révision en 30 secondes

Sous une action log-normale à $\sigma$ constant, la couverture en delta continue rend l'option sans risque, donc elle rapporte $r$ : $\partial_t V + \tfrac12\sigma^2 S^2 \partial_{SS}V + rS\,\partial_S V - rV = 0$. De façon équivalente, prix $=$ espérance actualisée sous $\mathbb{Q}$ avec dérive $r$. Pour un call, $C = S N(d_1) - K e^{-rT} N(d_2)$ avec $d_{1,2} = [\ln(S/K) + (r \pm \tfrac12\sigma^2)T]/(\sigma\sqrt{T})$ ; le put vient de la parité $C - P = S - K e^{-rT}$. $\mu$ n'apparaît jamais. La volatilité implicite inverse la formule ; le smile montre que le modèle est faux, mais la formule reste le langage de cotation.

## Formules clés

| Nom | Formule |
|---|---|
| EDP | $\partial_t V + \tfrac12\sigma^2 S^2\partial_{SS}V + rS\,\partial_S V - rV = 0$ |
| Call | $C = S\,N(d_1) - Ke^{-rT}N(d_2)$ |
| Put | $P = Ke^{-rT}N(-d_2) - S\,N(-d_1)$ |
| $d_1$, $d_2$ | $d_1 = \dfrac{\ln(S/K) + (r + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}$, $d_2 = d_1 - \sigma\sqrt{T}$ |
| Parité call–put | $C - P = S - Ke^{-rT}$ |
| Prix risque-neutre | $V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff} \mid \mathcal{F}_t]$ |
| Règle empirique ATM | $C \approx 0{,}4\,S\,\sigma\sqrt{T}$ |

## Questions d'entretien

::: question Pourquoi le rendement espéré $\mu$ de l'action n'apparaît-il pas dans la formule de Black–Scholes ?
::: hint
Que deviennent les termes en $dS$ quand on détient $\partial_S V$ actions contre l'option ?
:::
::: answer
Le portefeuille de réplication détient $\Delta = \partial_S V$ actions, et les termes en $dS$, seul endroit où $\mu$ apparaît, s'annulent exactement. La position couverte est sans risque et doit rapporter $r$, donc le prix ne dépend que de $r$ et de $\sigma$. De façon équivalente, sous la mesure risque-neutre la dérive est remplacée par $r$. Deux investisseurs qui ne sont pas d'accord sur $\mu$ mais le sont sur $\sigma$ s'accordent sur le prix de l'option.
:::
:::

::: question Donne une approximation rapide d'un call à la monnaie et démontre-la.
::: hint
Prends $K = S e^{rT}$ de sorte que $d_1 = -d_2 = \tfrac12\sigma\sqrt{T}$, et utilise $N(x) - N(-x) \approx 2x\,\varphi(0)$ pour $x$ petit.
:::
::: answer
Avec $K e^{-rT} = S$, $C = S\big[N(\tfrac12\sigma\sqrt{T}) - N(-\tfrac12\sigma\sqrt{T})\big] \approx S\,\sigma\sqrt{T}\,\varphi(0) = S\sigma\sqrt{T}/\sqrt{2\pi} \approx 0{,}4\,S\sigma\sqrt{T}$. Pour $S = 100$, $\sigma = 20\,\%$, $T = 0{,}25$ : $C \approx 0{,}4 \times 100 \times 0{,}2 \times 0{,}5 = 4{,}0$ (exact : $3{,}99$). L'approximation est à moins de 1 % tant que $\sigma\sqrt{T} \lesssim 0{,}5$.
:::
:::

::: question Interprète $N(d_1)$ et $N(d_2)$ de façon probabiliste et explique pourquoi $N(d_1) > N(d_2)$.
::: hint
Écris le call comme $e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T\mathbf{1}_{S_T>K}] - Ke^{-rT}\,\mathbb{Q}(S_T > K)$ et demande-toi quelles trajectoires pèsent le plus dans le premier terme.
:::
::: answer
$N(d_2) = \mathbb{Q}(S_T > K)$. Dans le premier terme, l'indicatrice est pondérée par $S_T$, c'est-à-dire par la densité d'une mesure $\mathbb{Q}^S$ telle que $d\mathbb{Q}^S/d\mathbb{Q} = S_T/(S e^{rT})$ (l'action comme numéraire) ; sous $\mathbb{Q}^S$ le log de l'action dérive à $r + \tfrac12\sigma^2$ au lieu de $r - \tfrac12\sigma^2$, et $\mathbb{Q}^S(S_T > K) = N(d_1)$. Les trajectoires à $S_T$ élevé pèsent davantage, donc la probabilité d'exercice sous $\mathbb{Q}^S$ est plus grande : $N(d_1) > N(d_2)$, les deux arguments différant exactement de $\sigma\sqrt{T}$. $N(d_1)$ est aussi $\partial C/\partial S$.
:::
:::

::: question Suppose que la volatilité est stochastique mais indépendante du mouvement brownien qui pilote l'action. Montre que le prix de l'option est une moyenne de prix Black–Scholes et explique pourquoi cela crée un smile mais pas un skew.
::: hint
Conditionne par toute la trajectoire de volatilité. Quelle est la loi de $\ln S_T$ sachant $\bar\sigma^2 = \tfrac1T\int_0^T\sigma_t^2\,dt$ ?
:::
::: answer
Sachant la trajectoire de volatilité, $\ln S_T$ est gaussien de variance $\bar\sigma^2 T$, donc le prix conditionnel est $C_{BS}(\bar\sigma)$, et par la propriété de tour $C = \mathbb{E}[C_{BS}(\bar\sigma)]$ (mélange de Hull–White). La convexité de $C_{BS}$ en $\sigma$ est le volga, $\nu\,d_1 d_2/\sigma$. Près de la monnaie, $d_1 d_2 < 0$ : $C_{BS}$ est concave en $\bar\sigma$, le prix moyen est en dessous du prix à la volatilité moyenne, et la vol implicite à la monnaie est *en dessous* de $\sqrt{\mathbb{E}[\bar\sigma^2]}$. Loin de la monnaie, $d_1 d_2 > 0$ : $C_{BS}$ est convexe et la vol implicite est poussée *vers le haut*. Résultat : un smile symétrique. Comme le mélange est symétrique en $\ln(K/S)$ autour du forward, il ne peut pas produire de skew ; un skew exige une corrélation entre volatilité et rendements (effet de levier, $\rho < 0$ dans Heston) ou des sauts asymétriques.
:::
:::
