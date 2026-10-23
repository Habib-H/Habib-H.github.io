/*
 * Code of project 2 (hotel guest analysis): every R block comes with its SAS equivalent.
 * Column names are those of the original (French) file: Nuitees = nights, Montant = amount,
 * Reduction = discount, Motif = purpose, Chaine = hotel chain, Origine = booking source, Sexe = gender.
 */

export const R_DESCRIBE = `# One row per stay (236 rows). Column names are those of the original French file:
# Nuitees = nights, Montant = amount (EUR), Reduction = discount (EUR), Type = board type,
# Motif = purpose, Chaine = hotel chain, Origine = booking source, Sexe = gender
hotels <- read.csv2("hotels.csv", stringsAsFactors = TRUE)   # path and separator: adjust to your file

# --- 1. The four numeric variables
quanti <- hotels[, c("Nuitees", "Montant", "Reduction", "Age")]
summary(quanti)                                  # min, quartiles, mean, max
sapply(quanti, sd)                               # standard deviation
sapply(quanti, function(x) sd(x) / mean(x))      # coefficient of variation (above 0.25 = heterogeneous)

# the mode is the most frequent value
mode_of <- function(x) as.numeric(names(which.max(table(x))))
mode_of(hotels$Age)        # 52
mode_of(hotels$Nuitees)    # 1

hist(hotels$Age, breaks = 8, labels = TRUE)
boxplot(hotels$Age, ylab = "Age")
barplot(table(hotels$Nuitees), xlab = "Nights", ylab = "Stays")

# --- 2. The five categorical variables
qual <- c("Type", "Sexe", "Origine", "Motif", "Chaine")
lapply(hotels[qual], table)                                              # counts
lapply(hotels[qual], function(x) round(prop.table(table(x)) * 100, 1))   # percentages
barplot(sort(table(hotels$Chaine)), horiz = TRUE)`;

export const SAS_DESCRIBE = `/* One row per stay (236 rows). Variable names are those of the original French file. */
proc import datafile="hotels.csv" out=hotels dbms=csv replace;   /* path and delimiter: adjust to your file */
  delimiter=";";
  getnames=yes;
run;

/* --- 1. The four numeric variables */
ods graphics on;
proc means data=hotels n mean std min q1 median q3 max cv maxdec=2;   /* CV is given in percent */
  var Nuitees Montant Reduction Age;
run;

proc univariate data=hotels modes;      /* MODES lists the most frequent value */
  var Age Nuitees;
run;

proc sgplot data=hotels;  histogram Age / nbins=14 showbins;  run;
proc sgplot data=hotels;  vbox Age;  run;
proc sgplot data=hotels;  vbar Nuitees;  run;

/* --- 2. The five categorical variables */
proc freq data=hotels;
  tables Type Sexe Origine Motif Chaine / nocum plots=freqplot;   /* counts and percentages */
run;`;

export const R_CORR = `quanti <- hotels[, c("Nuitees", "Montant", "Reduction", "Age")]

# All six pairs: coefficient, 95% interval and p-value of the test "no linear relationship"
pairs <- combn(names(quanti), 2, simplify = FALSE)
results <- do.call(rbind, lapply(pairs, function(p) {
  t <- cor.test(hotels[[p[1]]], hotels[[p[2]]])
  data.frame(pair = paste(p, collapse = " x "), r = unname(t$estimate),
             ci_low = t$conf.int[1], ci_high = t$conf.int[2], p_value = t$p.value)
}))
results[, -1] <- round(results[, -1], 4)
results

cov(quanti)    # covariance matrix
cor(quanti)    # correlation matrix

# Nights x amount in detail: the slope is the extra euros per extra night
model <- lm(Montant ~ Nuitees, data = hotels)
coef(model)                    # slope: about 55
summary(model)$r.squared       # 0.89: share of the bill explained by the length of stay
plot(hotels$Nuitees, hotels$Montant, xlab = "Nights", ylab = "Amount (EUR)")
abline(model)`;

export const SAS_CORR = `ods graphics on;
proc corr data=hotels pearson cov fisher(alpha=0.05) plots=matrix(histogram);
  var Nuitees Montant Reduction Age;     /* r, p-value, covariance and 95% interval of r for each pair */
run;

/* Nights x amount in detail: the slope is the extra euros per extra night */
proc reg data=hotels plots(only)=fitplot;
  model Montant = Nuitees;               /* slope: about 55, R-square: 0.89 */
run;
quit;`;

export const R_TESTS = `qual <- c("Type", "Sexe", "Origine", "Motif", "Chaine")

# Chi-square test of independence for each of the 10 pairs
pairs <- combn(qual, 2, simplify = FALSE)
tests <- do.call(rbind, lapply(pairs, function(p) {
  tab <- table(hotels[[p[1]]], hotels[[p[2]]])
  t   <- chisq.test(tab)       # on a 2 x 2 table (Sexe x Motif) R applies Yates' continuity correction
  n   <- sum(tab)
  data.frame(pair = paste(p, collapse = " x "),
             chi2 = unname(t$statistic), df = unname(t$parameter), p_value = t$p.value,
             cramers_v = sqrt(unname(t$statistic) / (n * (min(dim(tab)) - 1))),   # strength of the link, 0 to 1
             min_expected = min(t$expected))                                      # should be at least 5
}))
tests$significant_5pct <- tests$p_value < 0.05
tests$significant_bonf <- tests$p_value < 0.05 / nrow(tests)   # Bonferroni: 0.05 / 10 = 0.005
tests[order(tests$p_value), ]

# Booking source has expected counts below 5: confirm with a simulated p-value
chisq.test(table(hotels$Origine, hotels$Chaine), simulate.p.value = TRUE, B = 10000)`;

export const SAS_TESTS = `/* One macro call per pair; the results are stacked in the table TESTS */
%macro chi(a, b);
  ods output ChiSq=_c;
  proc freq data=hotels;
    tables &a * &b / chisq expected;     /* EXPECTED prints the counts expected if the variables were unrelated */
  run;
  data _c;
    set _c;
    where Statistic = "Chi-Square";      /* Pearson chi-square (on a 2 x 2 table R reports the continuity-corrected value) */
    length pair $ 30;
    pair = "&a x &b";
  run;
  proc append base=tests data=_c force; run;
%mend;

%chi(Type, Origine);   %chi(Type, Sexe);      %chi(Type, Motif);    %chi(Type, Chaine);
%chi(Origine, Sexe);   %chi(Origine, Motif);  %chi(Origine, Chaine);
%chi(Sexe, Motif);     %chi(Sexe, Chaine);    %chi(Motif, Chaine);

data tests;
  set tests;
  significant_5pct = (Prob < 0.05);
  significant_bonf = (Prob < 0.05 / 10);     /* Bonferroni: 0.05 / 10 = 0.005 */
run;
proc sort data=tests; by Prob; run;
proc print data=tests; var pair Value DF Prob significant_5pct significant_bonf; run;

/* Booking source has expected counts below 5: confirm with a simulated (Monte Carlo) p-value */
proc freq data=hotels;
  tables Origine * Chaine / chisq;
  exact chisq / mc n=10000;
run;`;

export const R_PROFILES = `tab <- table(hotels$Motif, hotels$Chaine)    # purpose x chain (use hotels$Type for board type)

# Cross table (% of all stays), row profiles and column profiles
round(prop.table(tab) * 100, 2)
round(prop.table(tab, 1), 3)    # row profile: among business guests, the share in each chain
round(prop.table(tab, 2), 3)    # column profile: among a chain's guests, the share of business and leisure

# Which cells create the link? The contribution of each cell to the chi-square
test <- chisq.test(tab)
test$observed
round(test$expected, 2)
contrib   <- test$residuals^2                        # (observed - expected)^2 / expected
threshold <- unname(test$statistic) / length(tab)    # average contribution: 1.63 here
contrib > threshold                                  # TRUE = the cell is above average
round(100 * contrib / unname(test$statistic), 1)     # share of the total link, in %
test$observed > test$expected                        # TRUE = over-represented, FALSE = under-represented

# Chart: how each chain's guests split
barplot(prop.table(tab, 2) * 100, beside = TRUE, legend.text = TRUE, ylab = "% of the chain's guests")`;

export const SAS_PROFILES = `/* One call prints the cross table, the row and column profiles, the expected counts */
/* and the contribution of each cell to the chi-square (CELLCHI2) */
proc freq data=hotels;
  tables Motif * Chaine / chisq expected cellchi2 deviation nocum
         plots=freqplot(twoway=groupvertical scale=grouppercent);
run;
/* Each cell shows: frequency, expected, deviation (observed - expected), cell chi-square, percent, row % and column % */
/* Threshold = total chi-square / number of cells: 1.63 for purpose x chain, 1.19 for board type x chain */
/* For board type, replace Motif by Type */`;
