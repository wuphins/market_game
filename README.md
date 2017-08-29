# Investment Simulator

## Created by: Josh Morris

This simulator allows users to simulate investing in the S&P 500 market over a random historical time period. Users may buy and sell at any time over this time period. At the end, their performance is compared to the performance of the market.

Its creation was inspired by a [Quartz article](https://qz.com/487013/this-game-will-show-you-just-how-foolish-it-is-to-sell-stocks-right-now/) by David Yanofsky (8/26/2015).

### S&P 500 Data

The data used is weekly (closing price on Friday) from January 6, 1978 - July 28, 2017.

### URL Parameters

* `id` = a unique identifier (default is the date of user activity)
* `amt` = amount to invest (default is 10,000)
* `inv` = 1 if begin in market, 0 if begin out of market (default is 1)
* `years` = length of random time period in years (default is 10)
* `speed` = number of milliseconds per week (default is 100)

These parameters can be hidden by encoding them in Base64 and stored in a global parameter: `Game`.

### Collectable Data

At the conclusion of the time period, the following data is posted to the server:

* ID = `id`
* initialValue = `amt`
* realDate = the date of user activity
* years = `years`
* speed = `speed`
* inMarketDefault = a boolean of `inv`
* startDate: the first date in the investment time period
* endDate: the last date in the investment time period
* startClose: the first closing price in the investment time period
* endClose: the last closing price in the investment time period
* userFinalValue: the value of the user's account after the investment time period has ended
* marketFinalValue: the hypothetical value of the user's account if they had never traded (i.e., buy and hold)
* weeklyData: an object containing data for each week of the investment time period
	* week: the week number (from 0 to `years`/52)
	* date: the week date
	* currentPrice: the week closing price
	* isMarketCurrent: a boolean indicating whether the user was invested in the market for that week 
	* userCurrentValue: the current value of the user's account
	* marketCurrentValue: the current hypothetical value of the user's account if they had never traded
	* lastTradeDate: the last date that the user traded
	* lastTradeWeek: the last week number that the user traded
	* lastTradePrice: the closing price of the last week that the user traded
	* totalTrades: the total number of trades made by the user entering that week
	* trade: a boolean indicating whether the user made a trade that week


