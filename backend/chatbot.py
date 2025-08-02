import json
import pickle
import nltk
import random
from nltk.stem import PorterStemmer
import requests
from prettytable import PrettyTable
import difflib
import os
from datetime import datetime, timedelta

def suggest_similar_symbols(symbol):
    matches = difflib.get_close_matches(symbol, COIN_ID_MAP.keys(), n=3, cutoff=0.6)
    if matches:
        return f"❌ Coin not found. Did you mean: {', '.join(matches)}?"
    return "❌ Coin not found. Try another name or symbol (e.g., 'btc', 'eth', 'sol')."

def get_crypto_news(limit=5):
    """Get latest crypto news"""
    try:
        url = "https://api.coingecko.com/api/v3/search/trending"
        res = requests.get(url)
        data = res.json()
        
        news_items = []
        trending_coins = data.get('coins', [])[:limit]
        
        for coin in trending_coins:
            news_items.append({
                "title": f"🔥 {coin['item']['name']} ({coin['item']['symbol']}) is trending",
                "description": f"Market Cap Rank: #{coin['item']['market_cap_rank']}",
                "coin": coin['item']['name'],
                "symbol": coin['item']['symbol']
            })
        
        return {
            "type": "news", 
            "title": "📰 Latest Crypto Trends", 
            "data": news_items
        }
    except Exception as e:
        return {"type": "text", "reply": "❌ Could not fetch crypto news right now."}

def get_market_cap_info(coin_name):
    """Get detailed market cap information for a specific coin"""
    try:
        coin = coin_name.lower().replace(" ", "-")
        if coin in POPULAR_SYMBOLS:
            coin_id = POPULAR_SYMBOLS[coin]
        elif coin in COIN_ID_MAP:
            coin_id = COIN_ID_MAP[coin]
        else:
            return {"type": "text", "reply": suggest_similar_symbols(coin_name.lower())}
        
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
        res = requests.get(url)
        data = res.json()
        
        if 'market_data' in data:
            market_data = data['market_data']
            name = data['name']
            symbol = data['symbol'].upper()
            
            market_cap = market_data.get('market_cap', {}).get('usd', 0)
            price = market_data.get('current_price', {}).get('usd', 0)
            volume_24h = market_data.get('total_volume', {}).get('usd', 0)
            market_cap_rank = market_data.get('market_cap_rank', 'N/A')
            circulating_supply = market_data.get('circulating_supply', 0)
            
            info_data = [{
                "metric": "Current Price",
                "value": f"${price:,.2f}",
                "icon": "💰"
            }, {
                "metric": "Market Cap",
                "value": f"${market_cap:,.0f}",
                "icon": "🏦"
            }, {
                "metric": "Market Cap Rank",
                "value": f"#{market_cap_rank}",
                "icon": "🏆"
            }, {
                "metric": "24h Volume",
                "value": f"${volume_24h:,.0f}",
                "icon": "📊"
            }, {
                "metric": "Circulating Supply",
                "value": f"{circulating_supply:,.0f} {symbol}",
                "icon": "🔄"
            }]
            
            return {
                "type": "market_info",
                "title": f"📈 {name} ({symbol}) Market Information",
                "data": info_data
            }
        else:
            return {"type": "text", "reply": f"❌ Could not fetch market data for {coin_name}."}
    except Exception as e:
        return {"type": "text", "reply": "⚠️ Something went wrong while fetching market cap data."}

def get_price_chart_data(coin_name, days=7):
    """Get historical price data for charts"""
    try:
        coin = coin_name.lower().replace(" ", "-")
        if coin in POPULAR_SYMBOLS:
            coin_id = POPULAR_SYMBOLS[coin]
        elif coin in COIN_ID_MAP:
            coin_id = COIN_ID_MAP[coin]
        else:
            return {"type": "text", "reply": suggest_similar_symbols(coin_name.lower())}
        
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
        params = {
            "vs_currency": "usd",
            "days": days,
            "interval": "daily" if days > 1 else "hourly"
        }
        
        res = requests.get(url, params=params)
        data = res.json()
        
        if 'prices' in data:
            chart_data = []
            for price_point in data['prices']:
                timestamp = price_point[0]
                price = price_point[1]
                date = datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d')
                chart_data.append({
                    "date": date,
                    "price": round(price, 2)
                })
            
            coin_info_url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
            coin_res = requests.get(coin_info_url)
            coin_data = coin_res.json()
            coin_name_full = coin_data.get('name', coin_name.title())
            
            return {
                "type": "chart",
                "title": f"📈 {coin_name_full} Price Chart ({days} days)",
                "data": chart_data,
                "coin": coin_name_full
            }
        else:
            return {"type": "text", "reply": f"❌ Could not fetch chart data for {coin_name}."}
    except Exception as e:
        return {"type": "text", "reply": "⚠️ Something went wrong while fetching chart data."}

def get_top_gainers(limit=5):
    try:
        url = "https://api.coingecko.com/api/v3/coins/markets"
        params = {
            "vs_currency": "usd",
            "order": "price_change_percentage_24h_desc",
            "per_page": limit,
            "page": 1
        }
        res = requests.get(url, params=params)
        coins = res.json()
        
        data = []
        for coin in coins:
            data.append({
                "name": coin["name"],
                "price": coin["current_price"],
                "change": coin["price_change_percentage_24h"]
            })
        return {"type": "table", "title": f"📈 Top {limit} Gainers", "data": data}
    except:
        return {"type": "text", "reply": "❌ Could not fetch top gainers."}

def get_top_losers(limit=5):
    """Get top losing cryptocurrencies"""
    try:
        url = "https://api.coingecko.com/api/v3/coins/markets"
        params = {
            "vs_currency": "usd",
            "order": "price_change_percentage_24h_asc",
            "per_page": limit,
            "page": 1
        }
        res = requests.get(url, params=params)
        coins = res.json()
        
        data = []
        for coin in coins:
            data.append({
                "name": coin["name"],
                "price": coin["current_price"],
                "change": coin["price_change_percentage_24h"]
            })
        return {"type": "table", "title": f"📉 Top {limit} Losers", "data": data}
    except:
        return {"type": "text", "reply": "❌ Could not fetch top losers."}

def get_global_market_stats():
    """Get global cryptocurrency market statistics"""
    try:
        url = "https://api.coingecko.com/api/v3/global"
        res = requests.get(url)
        data = res.json()
        
        if 'data' in data:
            global_data = data['data']
            
            stats_data = [{
                "metric": "Total Market Cap",
                "value": f"${global_data.get('total_market_cap', {}).get('usd', 0):,.0f}",
                "icon": "🌍"
            }, {
                "metric": "24h Trading Volume",
                "value": f"${global_data.get('total_volume', {}).get('usd', 0):,.0f}",
                "icon": "📊"
            }, {
                "metric": "Bitcoin Dominance",
                "value": f"{global_data.get('market_cap_percentage', {}).get('btc', 0):.1f}%",
                "icon": "₿"
            }, {
                "metric": "Active Cryptocurrencies",
                "value": f"{global_data.get('active_cryptocurrencies', 0):,}",
                "icon": "🪙"
            }, {
                "metric": "Markets",
                "value": f"{global_data.get('markets', 0):,}",
                "icon": "🏪"
            }]
            
            return {
                "type": "market_info",
                "title": "🌐 Global Crypto Market Statistics",
                "data": stats_data
            }
        else:
            return {"type": "text", "reply": "❌ Could not fetch global market data."}
    except Exception as e:
        return {"type": "text", "reply": "⚠️ Something went wrong while fetching global market stats."}

def load_coin_id_map():
    cache_file = "coin_list_cache.json"
    if os.path.exists(cache_file):
        with open(cache_file, "r", encoding="utf-8") as f:
            coins = json.load(f)
    else:
        url = "https://api.coingecko.com/api/v3/coins/list"
        res = requests.get(url)
        coins = res.json()
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(coins, f)
    
    symbol_map = {}
    for coin in coins:
        symbol_map[coin["symbol"].lower()] = coin["id"]
    return symbol_map

def compare_two_coins(text):
    try:
        words = text.lower().replace("price of", "").replace("vs", "|").split("|")
        if len(words) != 2:
            return {"type": "text", "reply": "❌ Please use the format like: 'btc vs eth' or 'compare sol vs near'"}
        
        coin1 = words[0].strip()
        coin2 = words[1].strip()
        
        for coin in [coin1, coin2]:
            if coin in POPULAR_SYMBOLS:
                continue
            elif coin not in COIN_ID_MAP:
                return {"type": "text", "reply": suggest_similar_symbols(coin)}
        
        id1 = POPULAR_SYMBOLS.get(coin1, COIN_ID_MAP.get(coin1))
        id2 = POPULAR_SYMBOLS.get(coin2, COIN_ID_MAP.get(coin2))
        
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={id1},{id2}&vs_currencies=usd"
        res = requests.get(url).json()
        
        p1 = res.get(id1, {}).get("usd")
        p2 = res.get(id2, {}).get("usd")
        
        if p1 and p2:
            comparison_text = (f"💱 Price Comparison:\n"
                             f"{coin1.upper()}: ${p1:,}\n"
                             f"{coin2.upper()}: ${p2:,}")
            return {"type": "text", "reply": comparison_text}
        else:
            return {"type": "text", "reply": "⚠️ Could not fetch one or both prices."}
    except:
        return {"type": "text", "reply": "⚠️ Something went wrong during comparison."}

POPULAR_SYMBOLS = {
    "btc": "bitcoin",
    "eth": "ethereum",
    "sol": "solana",
    "bnb": "binancecoin",
    "matic": "polygon",
    "near": "near",
    "ada": "cardano",
    "dot": "polkadot",
    "ltc": "litecoin",
    "shib": "shiba-inu",
    "doge": "dogecoin",
    "xrp": "ripple",
}

COIN_ID_MAP = load_coin_id_map()

def get_crypto_price(coin_name):
    try:
        coin = coin_name.lower().replace(" ", "-")
        if coin in POPULAR_SYMBOLS:
            coin = POPULAR_SYMBOLS[coin]
        elif coin in COIN_ID_MAP:
            coin = COIN_ID_MAP[coin]
        
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies=usd"
        res = requests.get(url)
        data = res.json()
        
        if coin in data:
            price = data[coin]["usd"]
            price_text = f"💰 The current price of {coin.replace('-', ' ').title()} is ${price:,} USD."
            return {"type": "text", "reply": price_text}
        else:
            return {"type": "text", "reply": suggest_similar_symbols(coin_name.lower())}
    except:
        return {"type": "text", "reply": "⚠️ Something went wrong while fetching the price. Try again."}

def get_top_ecosystem_coins(category):
    try:
        url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category={category}&order=market_cap_desc&per_page=5&page=1"
        res = requests.get(url)
        coins = res.json()
        
        if not coins:
            return {"type": "text", "reply": "⚠️ No coins found for that ecosystem. Try Ethereum or Solana."}
        
        data = []
        for coin in coins:
            data.append({
                "name": coin["name"],
                "price": coin["current_price"],
                "mcap": coin["market_cap"]
            })
        
        title = f"🌐 Top Coins in the {category.replace('-', ' ').title()} Ecosystem"
        return {"type": "table", "title": title, "data": data}
    except:
        return {"type": "text", "reply": "❌ Could not fetch data for that ecosystem. Try again later."}

stemmer = PorterStemmer()

with open("intents.json") as file:
    intents = json.load(file)

model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

def clean_text(text):
    tokens = text.lower().split()
    stemmed = " ".join([stemmer.stem(w) for w in tokens])
    return stemmed

def get_response(user_input):
    cleaned = clean_text(user_input)
    X = vectorizer.transform([cleaned])
    prediction = model.predict(X)[0]
    
    user_lower = user_input.lower()
    
    if any(kw in user_lower for kw in ["news", "latest news", "crypto news", "trending", "what's happening"]):
        return get_crypto_news()
    
    chart_keywords = ["chart", "graph", "price history", "historical", "show me chart"]
    if any(kw in user_lower for kw in chart_keywords):
        for symbol in POPULAR_SYMBOLS.keys():
            if symbol in user_lower:
                days = 7  
                if "month" in user_lower or "30" in user_lower:
                    days = 30
                elif "week" in user_lower or "7" in user_lower:
                    days = 7
                elif "year" in user_lower or "365" in user_lower:
                    days = 365
                return get_price_chart_data(symbol, days)
        
        return {"type": "text", "reply": "📈 Which coin's chart would you like to see? (e.g., 'Bitcoin chart', 'ETH price history')"}
    
    market_cap_keywords = ["market cap", "marketcap", "market capitalization", "mcap"]
    if any(kw in user_lower for kw in market_cap_keywords):
        if any(global_kw in user_lower for global_kw in ["global", "total", "overall", "crypto market"]):
            return get_global_market_stats()
        
        for symbol in POPULAR_SYMBOLS.keys():
            if symbol in user_lower:
                return get_market_cap_info(symbol)
        
        coin_names = ["bitcoin", "ethereum", "solana", "cardano", "polygon", "dogecoin"]
        for name in coin_names:
            if name in user_lower:
                return get_market_cap_info(name)
        
        return {"type": "text", "reply": "🏦 Which coin's market cap would you like to know? (e.g., 'Bitcoin market cap', 'SOL market cap')"}
    
    if any(kw in user_lower for kw in ["top losers", "biggest losers", "worst performing", "price decrease"]):
        return get_top_losers()
    
    if any(kw in user_lower for kw in ["global stats", "market stats", "crypto market", "total market cap"]):
        return get_global_market_stats()
    
    eco_keywords = {
        "ethereum": "ethereum-ecosystem",
        "solana": "solana-ecosystem",
        "near": "near-protocol-ecosystem",
        "avalanche": "avalanche-ecosystem",
        "bnb": "binance-smart-chain",
        "polygon": "polygon-ecosystem"
    }
    
    for name, category in eco_keywords.items():
        if name in user_lower and any(word in user_lower for word in ["ecosystem", "tokens", "coins", "top projects"]):
            return get_top_ecosystem_coins(category)
    
    if "price" in user_lower:
        for keyword in ["price of", "price for", "value of"]:
            if keyword in user_lower:
                coin = user_lower.split(keyword)[-1].strip()
                return get_crypto_price(coin)
    
    if " vs " in user_lower:
        return compare_two_coins(user_input)
    
    if any(kw in user_lower for kw in ["top gainers", "biggest gainers", "price increase", "top performers"]):
        return get_top_gainers()
    
    for intent in intents["intents"]:
        if intent["tag"] == prediction:
            response_text = random.choice(intent["responses"])
            return {"type": "text", "reply": response_text}
    
    return {"type": "text", "reply": "Sorry, I don't understand that. Can you rephrase?"}
