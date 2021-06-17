---
layout: post
title: "Decision Making Under Uncertainty: Multi-Armed Bandit"
category: blog
tags: 
- blog
- math
- mathematics
- reinforcement learning
- rl
- multi-armed bandit
- mab
- optimization
date: 2021-06-16
image: /assets/images/casino.jpg
dropcap: True
---

Making optimal decisions based on information from data is at the core of data science and machine learning but it is rare to find a situation where perfectly complete information is available. Oftentimes, we need to make educated guesses based on incomplete information and hopefully learn from the results of these choices to inform future decisions. To give a real life example: how can we make an informed decision on what restaurant to dine at if we have not tried every one? It is only once we have developed a sufficiently accurate model from information about the decision environment that we can make consistently the optimal choice - going back to our example, it is only after we have tried a couple of restaurants that we can make an informed decision on where to eat. However, this begs the question: When can we say that we have sufficient information? When do we stop testing different decisions?

This is the exploitation vs exploration dilemma. We need to balance testing new choices and learning new information about the decision environment (exploration) with selecting what we believe are optimal choices based on our limited choices (exploitation). Beyond our restaurant selection example, this exploitation vs exploration dilemma is encountered widely across different industries. The exploitation vs exploration dilemma exists in advertising (Which ads should we show to maximize customer response?), clinical trials (How do we ensure patient well-being while maximizing the information derived from treatment trials?), and web design (What page layouts result in higher engagement?) among others. 

The multi-armed bandit is a reinforcement learning approach to solving the exploitation vs exploration dilemma. In the following section, I will present a Python implementation of the multi-armed bandit applied to the advertising optimization problem. 

I will use an advertising dataset, which you may download [here](/assets/files/Ads_Optimisation.csv). This data shows ad click rates for ten variants of an ad, where each column represents one variant of the ad and the binary values indicate whether or not a user clicked on the ad (1 for click, 0 for no click).

First, we import the required libraries. I will define the multi-armed bandit as a class, so we only need Numpy for analysis, Pandas for working with the dataset, and Matplotlib for visualization.

```python
%matplotlib inline
# Import libraries
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
```

The Python class implementation of the multi-armed bandit follows. The multi-armed bandit is actually an entire family of algorithms and, for this case, I have implemented what is called an Upper Confidence Bound (UCB) bandit. This is designed to slowly decrease the exploration rate as more information is learned about the environment. The UCB bandit does this by selecting the action based on a combination of what the estimated reward is based on previous decisions plus an exploration incentive that decreases based on how many times an action has been selected before.


```python
# Define class for UCB bandit
class ucb_bandit:
    """Class for Upper Confidence Bound k-bandit problem 
    with a DataFrame of observations
    df: DataFrame of observations
    c: Exploration parameter (c > 0)
    iters: Number of steps (int)
    """
    def __init__(self, df, c, iters):
        """__init__ function
        """
        # DataFrame of observations
        self.df = df
        # Number of arms is the count of columns in df
        self.k = df.shape[1]
        
        # Exploration parameter
        self.c = c
        
        # Number of iterations
        self.iters = iters
        
        # Step count
        self.n = 1
        # Step count for each arm
        self.k_n = np.ones(self.k)
        
        # Total mean reward
        self.mean_reward = 0
        self.reward = np.zeros(iters)
        # Estimated reward for each arm
        self.k_reward = np.zeros(self.k)
        
    def pull(self):
        """Function to simulate pulling a bandit arm and adjust the reward estimate
        """
        # Select action according to UCB criteria (estimated reward plus exploration incentive)
        a = np.argmax(self.k_reward + self.c * np.sqrt(np.log(self.n)/self.k_n))
        
        # Return the reward randomly from the observations in df
        reward = df.iloc[np.random.randint(0, df.shape[1]), a]
        
        # Update counts
        self.n += 1
        self.k_n[a] += 1
        
        # Update total mean reward
        self.mean_reward += (reward - self.mean_reward) / self.n
        
        # Update estimated reward for arm
        self.k_reward[a] += (reward - self.k_reward[a]) / self.k_n[a]
        
    def run(self):
        """Function to iterative run pull()
        """
        for i in range(self.iters):
            self.pull()
            self.reward[i] = self.mean_reward
            
    def reset(self):
        """Function to reset results while keeping settings
        """
        # Reset step counts
        self.n = 1
        self.k_n = np.ones(self.k)
        
        # Reset reward and reward estimates
        self.mean_reward = 0
        self.reward = np.zeros(iters)
        self.k_reward = np.zeros(self.k)
```

Now that the multi-armed bandit class has been defined, let's use it to learn the optimal decision policy based on our dataset.

```python
# Load data
df = pd.read_csv('Ads_Optimisation.csv')
```


```python
# Set UCB parameters
iters = 10000
episodes = 1000
```


```python
# Initialize UCB bandit for data
ucb = ucb_bandit(df, c=2, iters=iters)
```


```python
# Run UCB bandit for data for 1000 episodes

ucb_rewards = np.zeros(iters)
ucb_selection = np.zeros(df.shape[1])

for i in range(episodes):
    ucb.reset()
    
    # Run experiment
    ucb.run()
    
    # Update long-term averages
    ucb_rewards += (ucb.reward - ucb_rewards) / (i + 1)
    
    # Average actions per episode
    ucb_selection += (ucb.k_n - ucb_selection) / (i + 1)
``` 


```python
# Plot regret during learning
plt.figure(figsize=(12, 8))
plt.plot(ucb_rewards, label='UCB', color='b')
plt.legend(bbox_to_anchor=(1.3, 0.5))
plt.xlabel('Iterations')
plt.ylabel('Average Reward')
plt.title('Average UCB Rewards after '+str(episodes)+' Episodes')
plt.show()
```


![png](/assets/images/output_7_0.png)

The chart above plots the average reward (i.e. clicks per ad) across iterations. We can observe that the average reward of the multi-armed bandit agent steadily increases as it learns more about the decision environment and that the average reward begins to plateau as the agent focuses on exploitation after an initial exploration period.
