#Investment Simulator

##Created by: Josh Morris

This simulator allows users to simulate investing in the S&P 500 market over a random historical time period. Users may buy and sell at any time over this time period.

###Parameters

-id = a unique identifier (default is blank)
-amt = amount to invest (default is 10,000)
-inv = 1 if begin in market, 0 if begin out of market (default is 1)
-years = length of random time period in years (default is 10)
-speed = number of milliseconds per week (default is 100)

These parameters can be hidden by encoding them in Base64 and stored in a global parameter: Game

###Data

At the conclusion of the time period, the following data is posted to the server:

-id
-amt
-inv
-years
-speed
-date and time of simulation
-start date of time period
-end date of time period
-the date and market value for each time the user buys
-the date and market value for each time the user sells
-end user value
-end value if the user had bought and held (i.e., no sells)


