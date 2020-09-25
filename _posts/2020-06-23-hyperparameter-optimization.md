---
layout: post
title: "Hyperparameter Optimization or The Science of Automating Model Iteration"
category: blog
tags: 
- python 
- hyperopt 
- hyperparameter 
- optimization 
- predictive
- statistics
- model 
- iteration
- automation
- Bayesian
- Bayes
date: 2020-06-23
image: /assets/images/ducks.jpg
description: In this article, I will demonstrate how to use hyperopt to optimize model hyperparameters.
dropcap: True
---

Building a predictive model is a time-consuming task: it is not uncommon to for a data scientist to spend several sessions tweaking a predictive model to improve its accuracy. While most modern machine learning libraries only require the user to call a function to fit the model on training data, most models have settings that determine how it learns patterns from data - these settings are called hyperparameters. An example of a hyperparameter might be the maximum depth of decision tree model. The task of iterating across different variants of a model is formally called hyperparameter optimization.

There have been many attempts to automate hyperparameter optimization:

1. The **grid search** method iterates across a user defined set of model hyperparameters (called the hyperparameter space) to get the best combination of hyperparameters. Because of the exhaustive nature of grid searches, they are sure to find the best hyperparameters within the space but they are also computationally expensive.
2. The **random search** method randomly searches the hyperparameter space for a set number of iterations and returns the best combination of hyperparameters out of the randomly selected subset of tested models. This allows the data scientist to save time and compute power since not all possible combinations are tested but this also means that the modeler cannot be certain that the selected model hyperparameters are the best within the search space.
3. "Intelligent" search methods such as **Bayesian optimization** similarly do not test the entire hyperparameter space but improve upon random search by intelligently adjusting the hyperparameters in the direction of improving model accuracy based on the gradient of the accuracy metric.

Both [grid search](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html#sklearn.model_selection.GridSearchCV) and [random search](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.RandomizedSearchCV.html#sklearn.model_selection.RandomizedSearchCV) have implementations in [scikit-learn](https://scikit-learn.org/stable/modules/grid_search.html) but I will focus on how to perform intelligent hyperparameter optimization using the [Hyperopt](https://github.com/hyperopt/hyperopt) library.

## Hyperparameter Optimization Using Hyperopt

Recall that hyperparameter optimization requires using an automated algorithm to search a user-defined hyperparameter space for best combination of hyperparameters based on model accuracy metric. 

The typical structure of a modeling script that leverages Hyperopt for hyperparameter optimization is as follows:

```python
from hyperopt import fmin, tpe, hp


# Define the hyperparameter space
space = [
         hp.uniform('a1', 0, 3), # Uniformly distributed
         hp.normal('a2', 0, 3), # Normally distributed
         hp.quniform('a3', 0, 28, 1), # Uniformly distributed with discrete intervals
    	 hp.choice('a4', ['A', 'B', 'C']) # Discrete choices
]

# Define the objective function
def function(args):
    a1, a2, a3, a4 = args
    # Data transformations
    X_train = X_train.apply(lambda x: x**a1)
    X_test = X_test.apply(lambda x: x**a1)
    # Fit a model
    reg = model_class(a2, a3, a4)
    reg.fit(X_train, Y_train)
    Y_pred = reg.predict(X_test)
    return mean_squared_error(Y_test, Y_pred)

# Getting the best hyperparameters and transformations using hyperopt
best = fmin(function,space,algo=tpe.suggest,max_evals=1000)

# Display the best combination of hyperparameters and transformations
print(best)

# Fit the final model using the hyperparameter optimization results
a1 = best['a1']
a2 = best['a2']
a3 = best['a3']
a4 = best['a4']
# Data transformations
X_train = X_train.apply(lambda x: x**a1)
X_test = X_test.apply(lambda x: x**a1)
# Fit a model
reg = model_class(a2, a3, a4)
reg.fit(X_train, Y_train)
Y_pred = reg.predict(X_test)
```

Let's go through that code section by section.

## Defining the Hyperparameter Space

```python
# Define the hyperparameter space
space = [
         hp.uniform('a1', 0, 3), # Uniformly distributed
         hp.normal('a2', 0, 3), # Normally distributed
         hp.quniform('a3', 0, 28, 1), # Uniformly distributed with discrete intervals
    	 hp.choice('a4', ['A', 'B', 'C']) # Discrete choices
]
```

Hyperopt provides the **hp** class to represent hyperparameter distributions. Some of these distributions might be:

* hp.uniform - a uniformly distributed hyperparameter
* hp.normal - a normally distributed hyperparameter
* hp.quniform - a uniformly distributed hyperparameter with discrete intervals
* hp.choice - a hyperparameter randomly selected from a list of choices

Hyperopt expects the hyperparameter space to be a list of hp objects. The code block above defines a hyperparameter space of four hyperparameters defined by the distribution of values to be tested.

Note that because the hp.choice class defines a hyperparameter that randomly selects from a list of choices, it is possible to nest the hyperparameter space within an hp.choice object. This is useful when you want to test multiple model classes which take in different kinds of hyperparameters. This is illustrated in the code block below.

```python
# Define a nested hyperparameter space
space = hp.choice('space choice',[
    [hp.uniform('a1', 0, 3),
     hp.normal('a2', 0, 3)],
    [hp.uniform('a1', 0, 3),
     hp.choice('a2', ['mae', 'mse'])]
])
```

## Defining the Objective Function

```python
# Define the objective function
def function(args):
    a1, a2, a3, a4 = args
    # Data transformations
    X_train = X_train.apply(lambda x: x**a1)
    X_test = X_test.apply(lambda x: x**a1)
    # Fit a model
    reg = model_class(a2, a3, a4)
    reg.fit(X_train, Y_train)
    Y_pred = reg.predict(X_test)
    return mean_squared_error(Y_test, Y_pred)
```

Since hyperparameter optimization requires a model accuracy metric, a function must be defined that will return this metric, as in the code block above.

Note that Hyperopt expects this to be a loss metric such as the mean squared error and will seek minimize this. If you instead using an accuracy metric that is better if it is higher (e.g. accuracy or R2), you may add a negative sign so that Hyperopt will seek to minimize its additive inverse.

The objective function takes in the selected hyperparameters from the distributions previously defined in the hyperparameter space as arguments and attempts to fit a model using these hyperparameters. Note that in this example, parameters for data variable transformations are also considered as hyperparameters (i.e. a1 controls the power transformation). The function then returns the model accuracy or loss metric for evaluation.

## Automating Model Iteration

```python
# Getting the best hyperparameters and transformations using hyperopt
best = fmin(function,space,algo=tpe.suggest,max_evals=1000)
```

The code block above calls Hyperopt's **fmin** function to minimize the loss metric we had defined in the objective function earlier (function) by testing various combinations of hyperparameters from the hyperparameter space (space). The algo argument is set to tpe.suggest to tell Hyperopt to automatically suggest the next set of hyperparameters based on the gradient of previously tested model losses. The max_evals argument is set to 1,000 to tell Hyperopt to test 1,000 combinations of hyperparameters before stopping.

The fmin function returns the best set of hyperparameters. We will store these hyperparameters in a variable to call later when we finalize the model.

## Finalizing the Model

```python
# Fit the final model using the hyperparameter optimization results
a1 = best['a1']
a2 = best['a2']
a3 = best['a3']
a4 = best['a4']
# Data transformations
X_train = X_train.apply(lambda x: x**a1)
X_test = X_test.apply(lambda x: x**a1)
# Fit a model
reg = model_class(a2, a3, a4)
reg.fit(X_train, Y_train)
Y_pred = reg.predict(X_test)
```

Lastly, the final model is fit based on best hyperparameters saved from the results of the fmin function earlier.
