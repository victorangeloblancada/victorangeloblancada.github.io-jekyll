---
layout: post
title: "Supply Chain Network Design in Python"
category: blog
tags: 
- scnd
- supply chain
- logistics
- python
date: 2023-01-21
image: /assets/images/supplychain.jpg
description: Marketing Mix Modeling (MMM) is a powerful tool for understanding the effectiveness of a company’s marketing campaigns and strategies. 
dropcap: false
draft: true
---

Supply chain network design is a critical component of successful supply chain management. It involves the optimal arrangement of facilities and distribution channels to minimize costs and maximize efficiency. Operations research (OR) is a powerful tool used to analyze and optimize supply chain network design. In this blog post, we will demonstrate how operations research can be used to optimize supply chain network design and how the PuLP operations research library in Python can be used to automate the process.

## Load Data


```python
# Import libraries
import numpy as np
import pandas as pd

from pulp import *

import plotly.graph_objects as go
```

Major changes from previous INFOR-based approach:
* All sites are treated the same, i.e., a flowthrough site may have its own non-zero demand or supply. 
* Links are defined in the lane sheets, i.e., if no lane is defined, the assumption is that there is actually no lane. 
* Sites of different kinds may be combined in the same sheet.
* Lanes of different origin and destination site kinds may be combined in the same sheet.

Spreadsheet inputs are therefore:
1. Products
2. Sites - No longer need to define supply, flowthrough, and demand sites separately.
3. Product-Sites - The linkage to sites and products are purely by ID, so strictly no duplication of IDs.
4. Lanes - Similar to sites, no longer need to define supply to flowthrough and flowthrough to demand sites separately.
5. Product-Lanes - The linkage to lanes and products are purely by ID, so strictly no duplication of IDs.

Required columns per sheet:
* Prod
    * ID
* Site
    * ID
* PSite
    * ID
    * Supply
    * Demand
* Lane
    * ID
* PLane
    * ID


```python
# Settings
fn = 'Sample.xlsm'

# Project name
project = 'Sample'

# Force round off (2 means 2 decimal places, 
# -2 means round off to hundreds, set to None if no need to round off)
round_dec = 0

# Scenario name
scenario_name = 'Output'

# Historical flow? (Keeps flow from HistFlow columns and calculates costs)
histFlow = True
#histFlow = False

# Always apply fixed costs regardless of whether site is open?
#alwaysFixed = True
alwaysFixed = False

# Dictionary of sheet names (key is based on spreadsheet sheet names, 
# value is data role) <- breaking change from previous version
sheets = {'Prod': 'Prod',
          'Supply': 'Site',
          'psS': 'PSite',
          'DC': 'Site',
          'psDC': 'PSite',
          'Market': 'Site',
          'psM': 'PSite',
          'lSDC': 'Lane',
          'plSDC': 'PLane',
          'lDCM': 'Lane',
          'plDCM': 'PLane'}

# Site and product site connections (key is site, value is product site)
# and lane and product lane connections (key is lane, value is product lane)
prod_conn = {'Supply': 'psS',
             'DC': 'psDC',
             'Market': 'psM',
             'lSDC': 'plSDC',
             'lDCM': 'plDCM'}

# Columns of fixed costs in site sheet
# FixedCost renamed to Fixed Cost when computing totals
fix_cost_cols = ['FixedCost']

# NOT YET IMPLEMENTED
# Columns of product fixed costs in product site sheet
# FixedCost renamed to Fixed Cost when computing totals
fixp_cost_cols = []

# Columns of variable costs in site sheet
# CPU renamed to Total Cost when computing totals
var_cost_cols = []

# Columns of product variable costs in product site sheet
# CPU renamed to Total Cost when computing totals
varp_cost_cols = ['ReceivingCPU',
                  'StorageCPU',
                  'VASCPU',
                  'XDockCPU']

# NOT YET IMPLEMENTED
# Columns of fixed costs in lane sheet
# FixedCost renamed to Fixed Cost when computing totals
tfix_cost_cols = []

# NOT YET IMPLEMENTED
# Columns of product fixed costs in product lane sheet
# FixedCost renamed to Fixed Cost when computing totals
tfixp_cost_cols = []

# Columns of variable costs in lane sheet
# TransPrice renamed to Transport Cost when computing totals
tvar_cost_cols = []

# Columns of product variable costs in product lane sheet
# TransPrice renamed to Transport Cost when computing totals
tvarp_cost_cols = ['FreightCPU',
                   'DrayageCPU',
                   'TransportCPU']

data = {'Prod': pd.DataFrame(),
        'Site': pd.DataFrame(),
        'PSite': pd.DataFrame(),
        'Lane': pd.DataFrame(),
        'PLane': pd.DataFrame()}
```


```python
# Rename cost variables when getting cost totals
def costRename(string):
    # Rename CPU to Cost
    string = string.replace('CPU', ' Cost')
    # Rename TransPrice to Transport Cost
    string = string.replace('TransPrice', 'Transport Cost')
    # Rename FixedCost to Fixed Cost
    string = string.replace('FixedCost', 'Fixed Cost')
    return string
```


```python
# Map Settings

# Insert mapbox token
mapbox_access_token = ''

# Map dimensions
map_height = 500
map_width = 800
```


```python
# Function to get zoom level
def getBoundsZoomLevel(bounds, mapDim):
    """source: https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
    bounds: list of ne and sw lat/lon
    mapDim: dictionary with image size in pixels
    returns: zoom level to fit bounds in the visible area
    """
    ne_lat = bounds[0]
    ne_long = bounds[1]
    sw_lat = bounds[2]
    sw_long = bounds[3]

    scale = 2 # adjustment to reflect MapBox base tiles are 512x512 vs. Google's 256x256
    WORLD_DIM = {'height': 256 * scale, 'width': 256 * scale}
    ZOOM_MAX = 18

    def latRad(lat):
        sin = np.sin(lat * np.pi / 180)
        radX2 = np.log((1 + sin) / (1 - sin)) / 2
        return max(min(radX2, np.pi), -np.pi) / 2

    def zoom(mapPx, worldPx, fraction):
        return np.floor(np.log(mapPx / worldPx / fraction) / np.log(2))

    latFraction = (latRad(ne_lat) - latRad(sw_lat)) / np.pi

    lngDiff = ne_long - sw_long
    lngFraction = ((lngDiff + 360) if lngDiff < 0 else lngDiff) / 360

    latZoom = zoom(mapDim['height'], WORLD_DIM['height'], latFraction)
    lngZoom = zoom(mapDim['width'], WORLD_DIM['width'], lngFraction)

    return min(latZoom, lngZoom, ZOOM_MAX)
```


```python
# Load data
xls = pd.ExcelFile(fn)

for sheet in sheets.keys():
    temp = pd.read_excel(xls, 
                         sheet,
                         skiprows=2)
    if sheets[sheet] == 'Lane':
        temp['ID'] = temp['ID'].apply(lambda x: prod_conn[sheet]+'_'+x)
    if sheets[sheet] == 'PLane':
        temp['LaneID'] = temp['LaneID'].apply(lambda x: sheet+'_'+x)
    data[sheets[sheet]] = data[sheets[sheet]].append(temp)
                                                     
for dataType in data.keys():
    data[dataType] = data[dataType].loc[:, ~data[dataType].columns.str.contains('^unnamed', 
                                                                                case=False)]

xls.close()
```


```python
# Round off if necessary
if not round_dec is None:
    try:
        data['PSite']['Supply'] = data['PSite']['Supply'].round(round_dec)
    except:
        print('No column Supply in PSite')
    try:
        data['PSite']['Demand'] = data['PSite']['Demand'].round(round_dec)
    except:
        print('No column Demand in PSite')
    try:
        data['PLane']['HistFlow'] = data['PLane']['HistFlow'].round(round_dec)
    except:
        print('No column HistFlow in PLane')
```


```python
# Get value of M (very large number)
M = data['PSite']['Supply'].sum()
```

### Products


```python
# The list of products
products = list(data['Prod']['ID'])
#products
```

### Sites and Product Sites


```python
sites = data['Site']['ID']
```


```python
# Get dataframe of suppliers
suppliers = data['PSite']#.loc[data['PSite']['Supply']>0]

# The dictionary of supply per product per site
supply = {s:{p:suppliers.loc[(suppliers['SiteID']==s)&(suppliers['ProductID']==p), 'Supply'].values[0] for p in suppliers.loc[(suppliers['SiteID']==s)&(suppliers['Supply']>0), 'ProductID'].values} for s in pd.unique(suppliers['SiteID'])}
```


```python
# Get dataframe of markets
markets = data['PSite']#.loc[data['PSite']['Demand']>0]

# The dictionary of demand per product per market
demand = {m:{p:markets.loc[(markets['SiteID']==m)&(markets['ProductID']==p), 'Demand'].values[0] for p in markets.loc[(markets['SiteID']==m)&(markets['Demand']>0), 'ProductID'].values} for m in pd.unique(markets['SiteID'])}
```


```python
# Join product-independent costs from DC Site sheet to DC Product Site sheet
data['PSite'] = data['PSite'].join(data['Site'].set_index('ID')[fix_cost_cols + 
                                                                var_cost_cols],
                                   on='SiteID')
```


```python
# Get dataframe of DCs (defined as sites with costs greater than zero)
DC = data['PSite'].loc[data['PSite'][fix_cost_cols +
                                     fixp_cost_cols +
                                     var_cost_cols + 
                                     varp_cost_cols].sum(axis=1)>0]
```


```python
# The dictionary of dictionaries of variable costs per DC
DCVar = {}
for cost in var_cost_cols + varp_cost_cols:
    DCVar[cost] = makeDict([pd.unique(DC['SiteID']),
                            pd.unique(DC['ProductID'])],
                           [list(DC.loc[DC['SiteID'] == dc, cost]) for dc in pd.unique(DC['SiteID'])],
                           0)
```


```python
DCVar
```




    {'ReceivingCPU': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                 {'NZ DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 0.3}),
                  'AU DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 0.22})}),
     'StorageCPU': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                 {'NZ DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 1.25}),
                  'AU DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 0.9})}),
     'VASCPU': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                 {'NZ DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 0.9}),
                  'AU DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 0.75})}),
     'XDockCPU': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                 {'NZ DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 0.02}),
                  'AU DC': defaultdict(<function pulp.utilities.__makeDict.<locals>.<lambda>()>,
                              {'ProductA': 0.07})})}




```python
# The dictionary of dictionaries of fixed costs per DC
DCFix = {}
for cost in fix_cost_cols:
    DCFix[cost] = dict(zip(DC['SiteID'], DC[cost]))
```


```python
DCFix
```




    {'FixedCost': {'NZ DC': 100000.0, 'AU DC': 120000.0}}




```python
# The dictionary of dictionaries of fixed product costs per DC
DCFixp = {}
for cost in fixp_cost_cols:
    DCFixp[cost] = dict(zip(DC['SiteID'], DC[cost]))
```


```python
DCFixp
```




    {}




```python
if not alwaysFixed:
    # The binary variables for DC fixed costs
    DC_bv = LpVariable.dicts('DCbin', DC['SiteID'], 0, cat='Binary')
    #DC_bv
    
    # The binary variables for DC product fixed costs
    # TBD
```


```python
DC_bv
```




    {'NZ DC': DCbin_NZ_DC, 'AU DC': DCbin_AU_DC}



### Lanes and Product Lanes


```python
# Join in origin and destination data to product lane dataframe
if 'FromID' in data['PLane'].columns:
    pass
else:
    data['PLane'] = data['PLane'].join(data['Lane'].set_index('ID')[['FromID',
                                                                     'ToID']],
                                       on='LaneID')
```


```python
# Fill NaNs in costs with zeroes
data['PLane'][tvarp_cost_cols] = data['PLane'][tvarp_cost_cols].fillna(0)
```


```python
data['PLane']
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID</th>
      <th>LaneID</th>
      <th>ProductID</th>
      <th>FreightCPU</th>
      <th>DrayageCPU</th>
      <th>HistFlow</th>
      <th>TransportCPU</th>
      <th>FromID</th>
      <th>ToID</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>PL00000001</td>
      <td>plSDC_LA00000001</td>
      <td>ProductA</td>
      <td>0.278624</td>
      <td>0.022397</td>
      <td>100</td>
      <td>0.000000</td>
      <td>Shanghai</td>
      <td>NZ DC</td>
    </tr>
    <tr>
      <th>1</th>
      <td>PL00000002</td>
      <td>plSDC_LA00000002</td>
      <td>ProductA</td>
      <td>0.162942</td>
      <td>0.040232</td>
      <td>200</td>
      <td>0.000000</td>
      <td>Shanghai</td>
      <td>AU DC</td>
    </tr>
    <tr>
      <th>0</th>
      <td>PL00000001</td>
      <td>plDCM_LA00000001</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>100</td>
      <td>0.462276</td>
      <td>NZ DC</td>
      <td>NZ Market</td>
    </tr>
    <tr>
      <th>1</th>
      <td>PL00000002</td>
      <td>plDCM_LA00000002</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0</td>
      <td>2.647417</td>
      <td>NZ DC</td>
      <td>AU Market</td>
    </tr>
    <tr>
      <th>2</th>
      <td>PL00000003</td>
      <td>plDCM_LA00000003</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0</td>
      <td>9.093692</td>
      <td>AU DC</td>
      <td>NZ Market</td>
    </tr>
    <tr>
      <th>3</th>
      <td>PL00000004</td>
      <td>plDCM_LA00000004</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>200</td>
      <td>0.412256</td>
      <td>AU DC</td>
      <td>AU Market</td>
    </tr>
  </tbody>
</table>
</div>




```python
# Remove later
data['PLane'].loc[data['PLane']['HistFlow']>0]#.to_clipboard(index=False)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID</th>
      <th>LaneID</th>
      <th>ProductID</th>
      <th>FreightCPU</th>
      <th>DrayageCPU</th>
      <th>HistFlow</th>
      <th>TransportCPU</th>
      <th>FromID</th>
      <th>ToID</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>PL00000001</td>
      <td>plSDC_LA00000001</td>
      <td>ProductA</td>
      <td>0.278624</td>
      <td>0.022397</td>
      <td>100</td>
      <td>0.000000</td>
      <td>Shanghai</td>
      <td>NZ DC</td>
    </tr>
    <tr>
      <th>1</th>
      <td>PL00000002</td>
      <td>plSDC_LA00000002</td>
      <td>ProductA</td>
      <td>0.162942</td>
      <td>0.040232</td>
      <td>200</td>
      <td>0.000000</td>
      <td>Shanghai</td>
      <td>AU DC</td>
    </tr>
    <tr>
      <th>0</th>
      <td>PL00000001</td>
      <td>plDCM_LA00000001</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>100</td>
      <td>0.462276</td>
      <td>NZ DC</td>
      <td>NZ Market</td>
    </tr>
    <tr>
      <th>3</th>
      <td>PL00000004</td>
      <td>plDCM_LA00000004</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>200</td>
      <td>0.412256</td>
      <td>AU DC</td>
      <td>AU Market</td>
    </tr>
  </tbody>
</table>
</div>




```python
# Remove later
pd.DataFrame({'OUT': data['PLane'].groupby(['FromID', 'ProductID'])['HistFlow'].sum(),
              'IN': data['PLane'].groupby(['ToID', 'ProductID'])['HistFlow'].sum()}).fillna(0).to_clipboard()
```


```python
# Remove later
data['PLane'].loc[(data['PLane']['FromID']=='Kunshan')&(data['PLane']['HistFlow']>0)]#.to_clipboard(index=False)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID</th>
      <th>LaneID</th>
      <th>ProductID</th>
      <th>FreightCPU</th>
      <th>DrayageCPU</th>
      <th>HistFlow</th>
      <th>TransportCPU</th>
      <th>FromID</th>
      <th>ToID</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>
</div>




```python
# Remove later
data['PLane'].loc[(data['PLane']['ToID']=='Kunshan')&(data['PLane']['HistFlow']>0)]#.to_clipboard(index=False)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID</th>
      <th>LaneID</th>
      <th>ProductID</th>
      <th>FreightCPU</th>
      <th>DrayageCPU</th>
      <th>HistFlow</th>
      <th>TransportCPU</th>
      <th>FromID</th>
      <th>ToID</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>
</div>




```python
# Get dataframe of transport lanes (defined as lanes with transport costs greater than zero)
Lanes = data['PLane'].loc[data['PLane'][tfix_cost_cols +
                                        tfixp_cost_cols +
                                        tvar_cost_cols + 
                                        tvarp_cost_cols].sum(axis=1)>0]
```


```python
Lanes
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>ID</th>
      <th>LaneID</th>
      <th>ProductID</th>
      <th>FreightCPU</th>
      <th>DrayageCPU</th>
      <th>HistFlow</th>
      <th>TransportCPU</th>
      <th>FromID</th>
      <th>ToID</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>PL00000001</td>
      <td>plSDC_LA00000001</td>
      <td>ProductA</td>
      <td>0.278624</td>
      <td>0.022397</td>
      <td>100</td>
      <td>0.000000</td>
      <td>Shanghai</td>
      <td>NZ DC</td>
    </tr>
    <tr>
      <th>1</th>
      <td>PL00000002</td>
      <td>plSDC_LA00000002</td>
      <td>ProductA</td>
      <td>0.162942</td>
      <td>0.040232</td>
      <td>200</td>
      <td>0.000000</td>
      <td>Shanghai</td>
      <td>AU DC</td>
    </tr>
    <tr>
      <th>0</th>
      <td>PL00000001</td>
      <td>plDCM_LA00000001</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>100</td>
      <td>0.462276</td>
      <td>NZ DC</td>
      <td>NZ Market</td>
    </tr>
    <tr>
      <th>1</th>
      <td>PL00000002</td>
      <td>plDCM_LA00000002</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0</td>
      <td>2.647417</td>
      <td>NZ DC</td>
      <td>AU Market</td>
    </tr>
    <tr>
      <th>2</th>
      <td>PL00000003</td>
      <td>plDCM_LA00000003</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0</td>
      <td>9.093692</td>
      <td>AU DC</td>
      <td>NZ Market</td>
    </tr>
    <tr>
      <th>3</th>
      <td>PL00000004</td>
      <td>plDCM_LA00000004</td>
      <td>ProductA</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>200</td>
      <td>0.412256</td>
      <td>AU DC</td>
      <td>AU Market</td>
    </tr>
  </tbody>
</table>
</div>




```python
# The dictionary of dictionaries of costs for the transport routes per product from origin to destination
OtoD = {}
for cost in tvarp_cost_cols:
    if cost in OtoD:
        pass
    else:
        OtoD[cost] = {}
    for o in np.unique(Lanes['FromID']):
        if o in OtoD[cost]:
            pass
        else:
            OtoD[cost][o] = {}
        for p in np.unique(Lanes.loc[Lanes['FromID']==o, 
                                     'ProductID']):
            if p in OtoD[cost][o]:
                pass
            else:
                OtoD[cost][o][p] = {}
            for d in np.unique(Lanes.loc[(Lanes['FromID']==o) & 
                                         (Lanes['ProductID']==p), 
                                         'ToID']):
                OtoD[cost][o][p][d] = Lanes.loc[(Lanes['FromID']==o) & 
                                                (Lanes['ProductID']==p) & 
                                                (Lanes['ToID']==d), 
                                                cost].values[0]
```


```python
OtoD
```




    {'FreightCPU': {'AU DC': {'ProductA': {'AU Market': 0.0, 'NZ Market': 0.0}},
      'NZ DC': {'ProductA': {'AU Market': 0.0, 'NZ Market': 0.0}},
      'Shanghai': {'ProductA': {'AU DC': 0.16294159923090565,
        'NZ DC': 0.2786243970847587}}},
     'DrayageCPU': {'AU DC': {'ProductA': {'AU Market': 0.0, 'NZ Market': 0.0}},
      'NZ DC': {'ProductA': {'AU Market': 0.0, 'NZ Market': 0.0}},
      'Shanghai': {'ProductA': {'AU DC': 0.04023184834654048,
        'NZ DC': 0.02239721224741304}}},
     'TransportCPU': {'AU DC': {'ProductA': {'AU Market': 0.41225625063258187,
        'NZ Market': 9.093692079973163}},
      'NZ DC': {'ProductA': {'AU Market': 2.647417446257063,
        'NZ Market': 0.46227599344198433}},
      'Shanghai': {'ProductA': {'AU DC': 0.0, 'NZ DC': 0.0}}}}




```python
# The dictionary containing the referenced variables (the routes) per product for origin to destination
OtoD_v = {}
for o in np.unique(Lanes['FromID']):
    if o in OtoD_v:
        pass
    else:
        OtoD_v[o] = {}
    for p in np.unique(Lanes.loc[Lanes['FromID']==o, 
                                 'ProductID']):        
        if p in OtoD_v[o]:
            pass
        else:
            OtoD_v[o][p] = {}
        for d in np.unique(Lanes.loc[(Lanes['FromID']==o) & 
                                     (Lanes['ProductID']==p), 
                                     'ToID']):
            OtoD_v[o][p][d] = LpVariable('OtoD_'+str(o)+'_'+str(p)+'_'+str(d),
                                         0,
                                         None,
                                         LpInteger)
```


```python
OtoD_v
```




    {'AU DC': {'ProductA': {'AU Market': OtoD_AU_DC_ProductA_AU_Market,
       'NZ Market': OtoD_AU_DC_ProductA_NZ_Market}},
     'NZ DC': {'ProductA': {'AU Market': OtoD_NZ_DC_ProductA_AU_Market,
       'NZ Market': OtoD_NZ_DC_ProductA_NZ_Market}},
     'Shanghai': {'ProductA': {'AU DC': OtoD_Shanghai_ProductA_AU_DC,
       'NZ DC': OtoD_Shanghai_ProductA_NZ_DC}}}




```python
# Creates a list of tuples containing all the possible routes per product from origin to destination
OtoD_l = list(Lanes[['FromID', 
                     'ProductID', 
                     'ToID']].itertuples(index=False,
                                                 name=None))
#OtoD_l
```


```python
OtoD_l
```




    [('Shanghai', 'ProductA', 'NZ DC'),
     ('Shanghai', 'ProductA', 'AU DC'),
     ('NZ DC', 'ProductA', 'NZ Market'),
     ('NZ DC', 'ProductA', 'AU Market'),
     ('AU DC', 'ProductA', 'NZ Market'),
     ('AU DC', 'ProductA', 'AU Market')]



## Define LP


```python
# The variable containing the problem data
prob = LpProblem(project, LpMinimize)
```

### Objective Function


```python
# The objective function is added to 'prob' first

if alwaysFixed:
    prob += (
        lpSum(
            [OtoD_v[o][p][d] * OtoD[cost][o][p][d] for (o, p, d) in OtoD_l for cost in OtoD] + # Origin to destination transport cost
            [OtoD_v[o][p][d] * DCVar[cost][d][p] for (o, p, d) in OtoD_l for cost in DCVar] + # Site variable cost (based on inbound)
            #[OtoD_v[o][p][d] * DCVar[cost][o][p] for (o, p, d) in OtoD_l for cost in DCVar] + # Site variable cost (based on outbound)
            #[DC_bv[d] * DCFix[cost][d] for d in DC['SiteID'] for cost in DCFix] # Site fixed cost applied if there is flow
            [DCFix[cost][d] for d in np.unique(DC['SiteID']) for cost in DCFix] # DC fixed cost is always applied
             ),
        'Sum_of_Logistics_Costs',
    )
else:
    prob += (
        lpSum(
            [OtoD_v[o][p][d] * OtoD[cost][o][p][d] for (o, p, d) in OtoD_l for cost in OtoD] + # Origin to destination transport cost
            [OtoD_v[o][p][d] * DCVar[cost][d][p] for (o, p, d) in OtoD_l for cost in DCVar] + # Site variable cost (based on inbound)
            #[OtoD_v[o][p][d] * DCVar[cost][o][p] for (o, p, d) in OtoD_l for cost in DCVar] + # Site variable cost (based on outbound)
            [DC_bv[d] * DCFix[cost][d] for d in np.unique(DC['SiteID']) for cost in DCFix] # Site fixed cost applied if there is flow
            #[DCFix[cost][d] for d in DC['SiteID'] for cost in DCFix] # DC fixed cost is always applied
             ),
        'Sum_of_Logistics_Costs',
    )
```


```python
# Print objective
prob.objective
```




    120000.0*DCbin_AU_DC + 100000.0*DCbin_NZ_DC + 0.41225625063258187*OtoD_AU_DC_ProductA_AU_Market + 9.093692079973163*OtoD_AU_DC_ProductA_NZ_Market + 2.647417446257063*OtoD_NZ_DC_ProductA_AU_Market + 0.46227599344198433*OtoD_NZ_DC_ProductA_NZ_Market + 2.1431734475774458*OtoD_Shanghai_ProductA_AU_DC + 2.7710216093321716*OtoD_Shanghai_ProductA_NZ_DC + 0.0



### DC Integer Constraints


```python
if not alwaysFixed:
    # Get list of DCs with fixed costs
    temp_list = DC.loc[DC[fix_cost_cols].sum(axis=1)>0, 'SiteID']
    # DC fixed costs are applied if a DC is open (based on inbound)
    for d in np.unique(temp_list):
        prob += (
            lpSum([OtoD_v[s][p][d] for s in np.unique(Lanes.loc[Lanes['ToID']==d, 'FromID']) for p in np.unique(Lanes.loc[(Lanes['FromID']==s)&(Lanes['ToID']==d), 'ProductID'])]) <= DC_bv[d]*M,
            "%s_Hub_is_Open" % d,
        )
```


```python
# Print DC integer constraints
for c in prob.constraints:
    if '_Hub_is_Open' in c:
        print(c, ':', prob.constraints[c], '\n')
```

    AU_DC_Hub_is_Open : -300.0*DCbin_AU_DC + OtoD_Shanghai_ProductA_AU_DC <= -0.0 
    
    NZ_DC_Hub_is_Open : -300.0*DCbin_NZ_DC + OtoD_Shanghai_ProductA_NZ_DC <= -0.0 
    
    

### Supply Constraints


```python

# The supply maximum constraints are added to prob for each supply node (supplier)
for s in supply:
    for p in supply[s]:
        if not np.isnan(supply[s][p]):
            prob += (
                lpSum([OtoD_v[s][p][d] for d in OtoD_v[s][p].keys()]) <= supply[s][p],
                "Sum_of_Products_{}_out_of_Supplier_{}".format(p, s),
            )

```


```python
# Print supply constraints
for c in prob.constraints:
    if '_out_of_Supplier_' in c:
        print(c, ':', prob.constraints[c], '\n')
```

    Sum_of_Products_ProductA_out_of_Supplier_Shanghai : OtoD_Shanghai_ProductA_AU_DC + OtoD_Shanghai_ProductA_NZ_DC <= 300.0 
    
    

### DC Flow Constraints


```python
# The DC can only ship out what was shipped in

for s in sites:
    for p in products:
        # Skip supply and demand sites:
        if (demand.get(s, {p:0}).get(p, 0)>0) or (supply.get(s, {p:0}).get(p, 0)>0):
            pass
        else:
            prob +=(
                lpSum([OtoD_v[s][p][d] for d in np.unique(Lanes.loc[(Lanes['FromID']==s)&(Lanes['ProductID']==p), 'ToID'])]) + # Total outbound to site
                #demand.get(s, {p:0}).get(p, 0) == # Total demand at site
                demand.get(s, {p:0}).get(p, 0) <= # Total demand at site # Test Demand <= Supply
                lpSum([OtoD_v[o][p][s] for o in np.unique(Lanes.loc[(Lanes['ToID']==s)&(Lanes['ProductID']==p), 'FromID'])]) + # Total inbound to site
                supply.get(s, {p:0}).get(p, 0), # Total supply at site
                "Sum_of_Products_{}_Through_Site_{}".format(p, s),
            )

```


```python
# Print DC flow constraints
for c in prob.constraints:
    if '_Through_Site_' in c:
        print(c, ':', prob.constraints[c], '\n')
```

    Sum_of_Products_ProductA_Through_Site_NZ_DC : OtoD_NZ_DC_ProductA_AU_Market + OtoD_NZ_DC_ProductA_NZ_Market - OtoD_Shanghai_ProductA_NZ_DC <= 0 
    
    Sum_of_Products_ProductA_Through_Site_AU_DC : OtoD_AU_DC_ProductA_AU_Market + OtoD_AU_DC_ProductA_NZ_Market - OtoD_Shanghai_ProductA_AU_DC <= 0 
    
    

### Demand Constraints


```python
# The demand minimum constraints are added to prob for each demand node (market)

for m in demand:
    for p in demand[m]:
        if not np.isnan(demand[m][p]):
            prob += (
                lpSum([OtoD_v[d][p][m] for d in np.unique(Lanes.loc[(Lanes['ToID']==m)&(Lanes['ProductID']==p), 'FromID'])]) >= demand[m][p],
                "Sum_of_Products_{}_into_Market_{}".format(p, m),
            )

```


```python
# Print demand constraints
for c in prob.constraints:
    if '_into_Market_' in c:
        print(c, ':', prob.constraints[c], '\n')
```

    Sum_of_Products_ProductA_into_Market_NZ_Market : OtoD_AU_DC_ProductA_NZ_Market + OtoD_NZ_DC_ProductA_NZ_Market >= 100.0 
    
    Sum_of_Products_ProductA_into_Market_AU_Market : OtoD_AU_DC_ProductA_AU_Market + OtoD_NZ_DC_ProductA_AU_Market >= 200.0 
    
    

### Baseline Constraint (Use Historical Flow) (Optional)


```python
if histFlow:
    # Fix historical supplier to hub flow
    for s in OtoD_v:
        for p in OtoD_v[s]:
            for d in OtoD_v[s][p]:
                prob += (
                    OtoD_v[s][p][d] == data['PLane'].loc[(data['PLane']['ProductID']==p)&
                                                         (data['PLane']['FromID']==s)&
                                                         (data['PLane']['ToID']==d), 
                                                         'HistFlow'].values[0],
                    "Historical_Flow_of_{}_from_{}_to_{}".format(p, s, d)
                )
```


```python
# Print optional baseline historical flow constraint
for c in prob.constraints:
    if 'Historical_Flow_of_' in c:
        print(c, ':', prob.constraints[c])
```

    Historical_Flow_of_ProductA_from_AU_DC_to_AU_Market : OtoD_AU_DC_ProductA_AU_Market = 200
    Historical_Flow_of_ProductA_from_AU_DC_to_NZ_Market : OtoD_AU_DC_ProductA_NZ_Market = 0
    Historical_Flow_of_ProductA_from_NZ_DC_to_AU_Market : OtoD_NZ_DC_ProductA_AU_Market = 0
    Historical_Flow_of_ProductA_from_NZ_DC_to_NZ_Market : OtoD_NZ_DC_ProductA_NZ_Market = 100
    Historical_Flow_of_ProductA_from_Shanghai_to_AU_DC : OtoD_Shanghai_ProductA_AU_DC = 200
    Historical_Flow_of_ProductA_from_Shanghai_to_NZ_DC : OtoD_Shanghai_ProductA_NZ_DC = 100
    

## Solve LP


```python
# Print LP
prob
```




    Sample:
    MINIMIZE
    120000.0*DCbin_AU_DC + 100000.0*DCbin_NZ_DC + 0.41225625063258187*OtoD_AU_DC_ProductA_AU_Market + 9.093692079973163*OtoD_AU_DC_ProductA_NZ_Market + 2.647417446257063*OtoD_NZ_DC_ProductA_AU_Market + 0.46227599344198433*OtoD_NZ_DC_ProductA_NZ_Market + 2.1431734475774458*OtoD_Shanghai_ProductA_AU_DC + 2.7710216093321716*OtoD_Shanghai_ProductA_NZ_DC + 0.0
    SUBJECT TO
    AU_DC_Hub_is_Open: - 300 DCbin_AU_DC + OtoD_Shanghai_ProductA_AU_DC <= 0
    
    NZ_DC_Hub_is_Open: - 300 DCbin_NZ_DC + OtoD_Shanghai_ProductA_NZ_DC <= 0
    
    Sum_of_Products_ProductA_out_of_Supplier_Shanghai:
     OtoD_Shanghai_ProductA_AU_DC + OtoD_Shanghai_ProductA_NZ_DC <= 300
    
    Sum_of_Products_ProductA_Through_Site_NZ_DC: OtoD_NZ_DC_ProductA_AU_Market
     + OtoD_NZ_DC_ProductA_NZ_Market - OtoD_Shanghai_ProductA_NZ_DC <= 0
    
    Sum_of_Products_ProductA_Through_Site_AU_DC: OtoD_AU_DC_ProductA_AU_Market
     + OtoD_AU_DC_ProductA_NZ_Market - OtoD_Shanghai_ProductA_AU_DC <= 0
    
    Sum_of_Products_ProductA_into_Market_NZ_Market: OtoD_AU_DC_ProductA_NZ_Market
     + OtoD_NZ_DC_ProductA_NZ_Market >= 100
    
    Sum_of_Products_ProductA_into_Market_AU_Market: OtoD_AU_DC_ProductA_AU_Market
     + OtoD_NZ_DC_ProductA_AU_Market >= 200
    
    Historical_Flow_of_ProductA_from_AU_DC_to_AU_Market:
     OtoD_AU_DC_ProductA_AU_Market = 200
    
    Historical_Flow_of_ProductA_from_AU_DC_to_NZ_Market:
     OtoD_AU_DC_ProductA_NZ_Market = 0
    
    Historical_Flow_of_ProductA_from_NZ_DC_to_AU_Market:
     OtoD_NZ_DC_ProductA_AU_Market = 0
    
    Historical_Flow_of_ProductA_from_NZ_DC_to_NZ_Market:
     OtoD_NZ_DC_ProductA_NZ_Market = 100
    
    Historical_Flow_of_ProductA_from_Shanghai_to_AU_DC:
     OtoD_Shanghai_ProductA_AU_DC = 200
    
    Historical_Flow_of_ProductA_from_Shanghai_to_NZ_DC:
     OtoD_Shanghai_ProductA_NZ_DC = 100
    
    VARIABLES
    0 <= DCbin_AU_DC <= 1 Integer
    0 <= DCbin_NZ_DC <= 1 Integer
    0 <= OtoD_AU_DC_ProductA_AU_Market Integer
    0 <= OtoD_AU_DC_ProductA_NZ_Market Integer
    0 <= OtoD_NZ_DC_ProductA_AU_Market Integer
    0 <= OtoD_NZ_DC_ProductA_NZ_Market Integer
    0 <= OtoD_Shanghai_ProductA_AU_DC Integer
    0 <= OtoD_Shanghai_ProductA_NZ_DC Integer




```python
# The problem data is written to an .lp file
prob.writeLP("TransportationProblem.lp")

# The problem is solved using PuLP's choice of Solver
prob.solve()
#prob.solve('PULP_CHOCO_CMD')

# The status of the solution is printed to the screen
print("Status:", LpStatus[prob.status])

# Each of the variables is printed with its resolved optimum value
for v in prob.variables():
    print(v.name, "=", v.varValue)

# The optimised objective function value is printed to the screen
print("Total Logistics Cost = ", value(prob.objective))
```

    Status: Optimal
    DCbin_AU_DC = 1.0
    DCbin_NZ_DC = 1.0
    OtoD_AU_DC_ProductA_AU_Market = 200.0
    OtoD_AU_DC_ProductA_NZ_Market = 0.0
    OtoD_NZ_DC_ProductA_AU_Market = 0.0
    OtoD_NZ_DC_ProductA_NZ_Market = 100.0
    OtoD_Shanghai_ProductA_AU_DC = 200.0
    OtoD_Shanghai_ProductA_NZ_DC = 100.0
    Total Logistics Cost =  220834.41569991942
    


```python
# Print violated constraints, if any
for c in prob.constraints.values():
    if not c.valid(0):
        print(c.name)
        print(c)
        print(c.value())
```

## Data Summaries


```python
# Create a Pandas Excel writer using XlsxWriter as the engine.
#writer = pd.ExcelWriter(fn.replace('.xlsx', ' - '+str(scenario_name)+'.xlsx'),
#                        engine='xlsxwriter')
writer = pd.ExcelWriter(fn.replace('.xlsm', ' - '+str(scenario_name)+'.xlsx'),
                        engine='xlsxwriter')
```

### Cost Totals


```python
# Cost components come from the objective function with the variables evaluated using the value() function
# Must use value() function twice since lpSum result is not recognized by Pandas

totals = {}

# Transport cost
for cost in OtoD:
    totals['Transport '+costRename(cost)] = lpSum([OtoD_v[o][p][d] * OtoD[cost][o][p][d] for (o, p, d) in OtoD_l]).value()

# DC variable costs (based on inbound)
for cost in DCVar:
    totals['Site Variable '+costRename(cost)] = lpSum([OtoD_v[o][p][d] * DCVar[cost][d][p] for (o, p, d) in OtoD_l]).value()

# DC fixed cost
if alwaysFixed:
    for cost in DCFix:
        totals['Site '+costRename(cost)] = lpSum([DCFix[cost][d] for d in np.unique(DC['SiteID'])]).value()
else:
    for cost in DCFix:
        totals['Site '+costRename(cost)] = lpSum([DC_bv[d] * DCFix[cost][d] for d in DC['SiteID']]).value()

totals = pd.DataFrame.from_dict(totals,
                                orient='index',
                                columns=['Cost'])

totals = totals.reset_index() 

totals = totals.rename(columns={'index': 'Cost Component'})

# Add totals
temp = totals.sum()
temp['Cost Component'] = 'Total'
temp = totals.append(temp, ignore_index=True)

# Save to Excel
temp.to_excel(writer, 
              sheet_name='Totals',
              index=False)

temp
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Cost Component</th>
      <th>Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Transport Freight Cost</td>
      <td>60.450760</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Transport Drayage Cost</td>
      <td>10.286091</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Transport Transport Cost</td>
      <td>128.678849</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Site Variable Receiving Cost</td>
      <td>74.000000</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Site Variable Storage Cost</td>
      <td>305.000000</td>
    </tr>
    <tr>
      <th>5</th>
      <td>Site Variable VAS Cost</td>
      <td>240.000000</td>
    </tr>
    <tr>
      <th>6</th>
      <td>Site Variable XDock Cost</td>
      <td>16.000000</td>
    </tr>
    <tr>
      <th>7</th>
      <td>Site Fixed Cost</td>
      <td>220000.000000</td>
    </tr>
    <tr>
      <th>8</th>
      <td>Total</td>
      <td>220834.415700</td>
    </tr>
  </tbody>
</table>
</div>



### Total Site Flow


```python
# Total flow per site
dc_flow = {(s, p, d): OtoD_v[s][p][d].value() for (s, p, d) in OtoD_l}

dc_flow = pd.DataFrame.from_dict(dc_flow,
                                 orient='index',
                                 columns=['Flow'])

# Reset index and parse supplier, product, and DC from index
dc_flow = dc_flow.reset_index()
dc_flow = pd.DataFrame(dc_flow['index'].tolist(),
                       columns=['Supplier',
                                'Product',
                                'Site']).join(dc_flow.drop(['index'],
                                                         axis=1))

dc_flow = dc_flow.pivot_table(index=['Site',
                                     'Product'],
                              values=['Flow'],
                              aggfunc=sum)

dc_flow = dc_flow.reset_index()

# Add totals
temp = dc_flow.sum()
temp['Site'] = 'Total'
temp['Product'] = 'Total'
temp = dc_flow.append(temp,
                      ignore_index=True)

# Save to Excel
temp.to_excel(writer, 
              sheet_name='Site Flow',
              index=False)

temp
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Site</th>
      <th>Product</th>
      <th>Flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>AU DC</td>
      <td>ProductA</td>
      <td>200.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>AU Market</td>
      <td>ProductA</td>
      <td>200.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>NZ DC</td>
      <td>ProductA</td>
      <td>100.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>NZ Market</td>
      <td>ProductA</td>
      <td>100.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Total</td>
      <td>Total</td>
      <td>600.0</td>
    </tr>
  </tbody>
</table>
</div>



### Flow from Origin to Destination


```python
# Total flow per site
sdc_flow = {(s, p, d): OtoD_v[s][p][d].value() for (s, p, d) in OtoD_l}

sdc_flow = pd.DataFrame.from_dict(sdc_flow,
                                  orient='index',
                                  columns=['Flow'])

# Reset index and parse supplier, product, and DC from index
sdc_flow = sdc_flow.reset_index()
sdc_flow = pd.DataFrame(sdc_flow['index'].tolist(),
                        columns=['Origin',
                                 'Product',
                                 'Destination']).join(sdc_flow.drop(['index'],
                                                           axis=1))

# Add totals
temp = sdc_flow.sum()
temp['Origin'] = 'Total'
temp['Product'] = 'Total'
temp['Destination'] = 'Total'
temp = sdc_flow.append(temp,
                       ignore_index=True)

# Save to Excel
temp.to_excel(writer, 
              sheet_name='Origin to Destination Flow',
              index=False)

temp
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Origin</th>
      <th>Product</th>
      <th>Destination</th>
      <th>Flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Shanghai</td>
      <td>ProductA</td>
      <td>NZ DC</td>
      <td>100.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Shanghai</td>
      <td>ProductA</td>
      <td>AU DC</td>
      <td>200.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>NZ DC</td>
      <td>ProductA</td>
      <td>NZ Market</td>
      <td>100.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>NZ DC</td>
      <td>ProductA</td>
      <td>AU Market</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>AU DC</td>
      <td>ProductA</td>
      <td>NZ Market</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>5</th>
      <td>AU DC</td>
      <td>ProductA</td>
      <td>AU Market</td>
      <td>200.0</td>
    </tr>
    <tr>
      <th>6</th>
      <td>Total</td>
      <td>Total</td>
      <td>Total</td>
      <td>600.0</td>
    </tr>
  </tbody>
</table>
</div>



### Variable Site Costs


```python
# Table of DC variable costs by product and DC
dc_varcost = dc_flow.pivot_table(index=['Site', 
                                        'Product'],
                                 values=['Flow'],
                                 aggfunc=sum)

dc_varcost = dc_varcost.reset_index()

dc_varcost = dc_varcost.merge(data['PSite'],
                              left_on=['Site',
                                       'Product'],
                              right_on=['SiteID',
                                        'ProductID'])

for cost in DCVar:
    dc_varcost[costRename(cost)] = dc_varcost[cost] * dc_varcost['Flow']

# Drop unnecessary columns
colnames = ['Site', 'Product', 'Flow'] + \
           var_cost_cols + \
           varp_cost_cols + \
           [costRename(cost) for cost in DCVar]
dc_varcost = dc_varcost[colnames]

# Drop rows with zero flow
dc_varcost = dc_varcost.loc[dc_varcost['Flow']>0]

# Add totals
temp = dc_varcost.sum()
temp['Site'] = 'Total'
temp['Product'] = 'Total'
temp = dc_varcost.append(temp,
                       ignore_index=True)

# Fill NAs with zeros
temp = temp.fillna(0)

# Save to Excel
temp.to_excel(writer, 
              sheet_name='Variable Site Costs',
              index=False)

temp
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Site</th>
      <th>Product</th>
      <th>Flow</th>
      <th>ReceivingCPU</th>
      <th>StorageCPU</th>
      <th>VASCPU</th>
      <th>XDockCPU</th>
      <th>Receiving Cost</th>
      <th>Storage Cost</th>
      <th>VAS Cost</th>
      <th>XDock Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>AU DC</td>
      <td>ProductA</td>
      <td>200.0</td>
      <td>0.22</td>
      <td>0.90</td>
      <td>0.75</td>
      <td>0.07</td>
      <td>44.0</td>
      <td>180.0</td>
      <td>150.0</td>
      <td>14.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>AU Market</td>
      <td>ProductA</td>
      <td>200.0</td>
      <td>0.00</td>
      <td>0.00</td>
      <td>0.00</td>
      <td>0.00</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>NZ DC</td>
      <td>ProductA</td>
      <td>100.0</td>
      <td>0.30</td>
      <td>1.25</td>
      <td>0.90</td>
      <td>0.02</td>
      <td>30.0</td>
      <td>125.0</td>
      <td>90.0</td>
      <td>2.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>NZ Market</td>
      <td>ProductA</td>
      <td>100.0</td>
      <td>0.00</td>
      <td>0.00</td>
      <td>0.00</td>
      <td>0.00</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Total</td>
      <td>Total</td>
      <td>600.0</td>
      <td>0.52</td>
      <td>2.15</td>
      <td>1.65</td>
      <td>0.09</td>
      <td>74.0</td>
      <td>305.0</td>
      <td>240.0</td>
      <td>16.0</td>
    </tr>
  </tbody>
</table>
</div>



### Fixed Site Costs


```python
# Table of DC fixed costs by DC
dc_fixcost = dc_flow.pivot_table(index=['Site'],
                                 values=['Flow'],
                                 aggfunc=sum)

dc_fixcost = dc_fixcost.reset_index()

dc_fixcost = dc_fixcost.join(data['Site'].set_index('ID'),
                             on='Site')

for cost in DCFix:
    dc_fixcost[costRename(cost)] = 0
    dc_fixcost.loc[dc_fixcost['Flow']>0, costRename(cost)] = dc_fixcost['FixedCost']

# Drop unnecessary columns
colnames = ['Site', 'Flow', 'X', 'Y'] + \
           fix_cost_cols + \
           [costRename(cost) for cost in fix_cost_cols]
dc_fixcost = dc_fixcost[colnames]

if not alwaysFixed:
    # Drop rows with zero flow
    dc_fixcost = dc_fixcost.loc[dc_fixcost['Flow']>0]

# Add totals
temp = dc_fixcost.sum()
temp['Site'] = 'Total'
temp = dc_fixcost.append(temp,
                         ignore_index=True)

temp = temp.fillna(0)

# Save to Excel
temp.drop(['X', 'Y'],
          axis=1).to_excel(writer, 
                           sheet_name='Site Fixed Costs',
                           index=False)

temp.drop(['X', 'Y'],
          axis=1)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Site</th>
      <th>Flow</th>
      <th>FixedCost</th>
      <th>Fixed Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>AU DC</td>
      <td>200.0</td>
      <td>120000.0</td>
      <td>120000.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>AU Market</td>
      <td>200.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>NZ DC</td>
      <td>100.0</td>
      <td>100000.0</td>
      <td>100000.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>NZ Market</td>
      <td>100.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Total</td>
      <td>600.0</td>
      <td>220000.0</td>
      <td>220000.0</td>
    </tr>
  </tbody>
</table>
</div>



### Total Site Costs


```python
# Total DC costs (fixed and variable) by DC
dc_totalcost = dc_varcost.pivot_table(index=['Site'],
                                      values=[costRename(cost) for cost in DCVar],
                                      aggfunc=sum)
dc_totalcost = dc_totalcost.join(dc_fixcost.set_index('Site'),
                                 how='outer')

dc_totalcost['Var Cost'] = dc_totalcost[[costRename(cost) for cost in DCVar]].sum(axis=1)

dc_totalcost['Site Cost'] = dc_totalcost['Var Cost'] + dc_totalcost['Fixed Cost']

dc_totalcost = dc_totalcost.reset_index()

# Drop unnecessary columns
colnames = ['Site', 'Flow', 'X', 'Y'] + \
           [costRename(cost) for cost in fix_cost_cols] + \
           [costRename(cost) for cost in var_cost_cols] + \
           [costRename(cost) for cost in varp_cost_cols] + \
           ['Var Cost', 'Site Cost']
dc_totalcost = dc_totalcost[colnames]

# Add totals
temp = dc_totalcost.sum()
temp['Site'] = 'Total'
temp = dc_totalcost.append(temp,
                           ignore_index=True)

temp = temp.fillna(0)

# Save to Excel
temp.drop(['X', 'Y'],
          axis=1).to_excel(writer, 
                           sheet_name='Site Total Costs',
                           index=False)

temp.drop(['X', 'Y'],
          axis=1)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Site</th>
      <th>Flow</th>
      <th>Fixed Cost</th>
      <th>Receiving Cost</th>
      <th>Storage Cost</th>
      <th>VAS Cost</th>
      <th>XDock Cost</th>
      <th>Var Cost</th>
      <th>Site Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>AU DC</td>
      <td>200.0</td>
      <td>120000.0</td>
      <td>44.0</td>
      <td>180.0</td>
      <td>150.0</td>
      <td>14.0</td>
      <td>388.0</td>
      <td>120388.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>AU Market</td>
      <td>200.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>NZ DC</td>
      <td>100.0</td>
      <td>100000.0</td>
      <td>30.0</td>
      <td>125.0</td>
      <td>90.0</td>
      <td>2.0</td>
      <td>247.0</td>
      <td>100247.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>NZ Market</td>
      <td>100.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Total</td>
      <td>600.0</td>
      <td>220000.0</td>
      <td>74.0</td>
      <td>305.0</td>
      <td>240.0</td>
      <td>16.0</td>
      <td>635.0</td>
      <td>220635.0</td>
    </tr>
  </tbody>
</table>
</div>



### Total Transport Costs


```python
# Total supplier to DC transport costs

sdc_cost = sdc_flow.merge(data['PLane'],
                          left_on=['Origin',
                                   'Product',
                                   'Destination'],
                          right_on=['FromID',
                                    'ProductID',
                                    'ToID'])

# Calculate total transport costs based on flow
for cost in tvarp_cost_cols:
    sdc_cost[costRename(cost)] = sdc_cost['Flow'] * sdc_cost[cost]
    
# Drop unnecessary columns
colnames = ['FromID', 'ToID', 'Product', 'Flow'] + \
           [cost for cost in tvarp_cost_cols] + \
           [costRename(cost) for cost in tvarp_cost_cols]
sdc_cost = sdc_cost[colnames]

# Drop rows with zero flow
sdc_cost = sdc_cost.loc[sdc_cost['Flow']>0]

# Join coordinates (and location name?)
sdc_cost = sdc_cost.join(data['Site'].set_index('ID')[['X',
                                                       'Y']],
                         on='FromID')
sdc_cost = sdc_cost.join(data['Site'].set_index('ID')[['X',
                                                       'Y']],
                         on='ToID',
                         lsuffix='_From',
                         rsuffix='_To')

# Add totals
temp = sdc_cost.sum()
temp['FromID'] = 'Total'
temp['ToID'] = 'Total'
temp['Product'] = 'Total'
temp = sdc_cost.append(temp,
                       ignore_index=True)

# Save to Excel
temp.drop(['X_From', 
           'Y_From',
           'X_To',
           'Y_To'],
          axis=1).to_excel(writer, 
                           sheet_name='Transport Costs',
                           index=False)

temp.drop(['X_From', 
           'Y_From',
           'X_To',
           'Y_To'],
          axis=1)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>FromID</th>
      <th>ToID</th>
      <th>Product</th>
      <th>Flow</th>
      <th>FreightCPU</th>
      <th>DrayageCPU</th>
      <th>TransportCPU</th>
      <th>Freight Cost</th>
      <th>Drayage Cost</th>
      <th>Transport Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Shanghai</td>
      <td>NZ DC</td>
      <td>ProductA</td>
      <td>100.0</td>
      <td>0.278624</td>
      <td>0.022397</td>
      <td>0.000000</td>
      <td>27.86244</td>
      <td>2.239721</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Shanghai</td>
      <td>AU DC</td>
      <td>ProductA</td>
      <td>200.0</td>
      <td>0.162942</td>
      <td>0.040232</td>
      <td>0.000000</td>
      <td>32.58832</td>
      <td>8.046370</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>2</th>
      <td>NZ DC</td>
      <td>NZ Market</td>
      <td>ProductA</td>
      <td>100.0</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.462276</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>46.227599</td>
    </tr>
    <tr>
      <th>3</th>
      <td>AU DC</td>
      <td>AU Market</td>
      <td>ProductA</td>
      <td>200.0</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.412256</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>82.451250</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Total</td>
      <td>Total</td>
      <td>Total</td>
      <td>600.0</td>
      <td>0.441566</td>
      <td>0.062629</td>
      <td>0.874532</td>
      <td>60.45076</td>
      <td>10.286091</td>
      <td>128.678849</td>
    </tr>
  </tbody>
</table>
</div>



### Flow Map


```python
sdc_cost
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>FromID</th>
      <th>ToID</th>
      <th>Product</th>
      <th>Flow</th>
      <th>FreightCPU</th>
      <th>DrayageCPU</th>
      <th>TransportCPU</th>
      <th>Freight Cost</th>
      <th>Drayage Cost</th>
      <th>Transport Cost</th>
      <th>X_From</th>
      <th>Y_From</th>
      <th>X_To</th>
      <th>Y_To</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Shanghai</td>
      <td>NZ DC</td>
      <td>ProductA</td>
      <td>100.0</td>
      <td>0.278624</td>
      <td>0.022397</td>
      <td>0.000000</td>
      <td>27.86244</td>
      <td>2.239721</td>
      <td>0.000000</td>
      <td>121.4967</td>
      <td>31.2466</td>
      <td>174.6928</td>
      <td>-36.8936</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Shanghai</td>
      <td>AU DC</td>
      <td>ProductA</td>
      <td>200.0</td>
      <td>0.162942</td>
      <td>0.040232</td>
      <td>0.000000</td>
      <td>32.58832</td>
      <td>8.046370</td>
      <td>0.000000</td>
      <td>121.4967</td>
      <td>31.2466</td>
      <td>153.0807</td>
      <td>-27.3760</td>
    </tr>
    <tr>
      <th>2</th>
      <td>NZ DC</td>
      <td>NZ Market</td>
      <td>ProductA</td>
      <td>100.0</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.462276</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>46.227599</td>
      <td>174.6928</td>
      <td>-36.8936</td>
      <td>174.7645</td>
      <td>-36.8509</td>
    </tr>
    <tr>
      <th>5</th>
      <td>AU DC</td>
      <td>AU Market</td>
      <td>ProductA</td>
      <td>200.0</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.412256</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>82.451250</td>
      <td>153.0807</td>
      <td>-27.3760</td>
      <td>146.9211</td>
      <td>-31.2532</td>
    </tr>
  </tbody>
</table>
</div>




```python
# Create a map of routes

# Initialize figure sites
fig = go.Figure()

# Add routes from origin to destination
for index, row in sdc_cost.iterrows():
    fig.add_trace(go.Scattermapbox(
        name = str(row['FromID'])+' to '+str(row['ToID']),
        mode = 'lines',
        #hovertemplate = temp_data['Sequence'].apply(str) + ') ' + temp_data['Ship_To_Location'],
        lon = [row['X_From'], row['X_To']],
        lat = [row['Y_From'], row['Y_To']],
        #marker = {'size': 10},
        line = {'width': 10*row['Flow']/sdc_cost['Flow'].max(),
                'color': 'red'}))
# Add sites
temp = sdc_cost.pivot_table(index=['FromID',
                                   'Y_From',
                                   'X_From'],
                            values=['Flow'],
                            aggfunc=sum)
temp = temp.reset_index()
for index, row in temp.iterrows():
    fig.add_trace(go.Scattermapbox(
        name = str(row['FromID']),
        mode = 'markers',
        lon = [row['X_From']],
        lat = [row['Y_From']],
        marker = {'size': 50*row['Flow']/sdc_cost['Flow'].sum(),
                  'color': 'red'}
        ))

temp_X = sdc_cost['X_To'].append(sdc_cost['X_From'])
temp_Y = sdc_cost['Y_To'].append(sdc_cost['Y_From'])
    
fig.update_layout(
    margin ={'l':0,'t':0,'b':0,'r':0},
    mapbox = {
        'accesstoken': mapbox_access_token,
        'center': {'lon': temp_X.mean(),
                   'lat': temp_Y.mean()},
        'bearing': 0,
        'zoom': getBoundsZoomLevel([temp_Y.max(),
                                    temp_X.max(),
                                    temp_Y.min(),
                                    temp_X.min()],
                                   {'height': map_height,
                                    'width': map_width})})

fig
```

```python
# Close the Pandas Excel writer and output the Excel file.
writer.save()
# Save and release handle
#writer.close()
#writer.handles = None
```


```python
fig.write_image(fn.replace('.xlsm', ' - '+str(scenario_name)+'.jpg'),
                height=map_height,
                width=map_width)
```